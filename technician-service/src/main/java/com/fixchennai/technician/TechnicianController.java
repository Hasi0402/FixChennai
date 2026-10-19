package com.fixchennai.technician;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    public record RatingRequest(@Min(1) @Max(5) int rating) {}

    private final TechnicianRepository repo;

    public TechnicianController(TechnicianRepository repo) { this.repo = repo; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Technician register(@Valid @RequestBody Technician t) {
        t.setId(null);
        t.setVerified(false);
        t.setRatingAvg(0);
        t.setRatingCount(0);
        return repo.save(t);
    }

    /** Discovery: filter by category + area, sort by rating (default), fee or experience. */
    @GetMapping
    public List<Technician> search(@RequestParam(required = false) String category,
                                   @RequestParam(required = false) String area,
                                   @RequestParam(defaultValue = "rating") String sort) {
        Sort s = switch (sort) {
            case "fee" -> Sort.by(Sort.Direction.ASC, "visitFee");
            case "experience" -> Sort.by(Sort.Direction.DESC, "experienceYears");
            default -> Sort.by(Sort.Direction.DESC, "ratingAvg", "ratingCount");
        };
        return repo.search(category, area, s);
    }

    @GetMapping("/{id}")
    public Technician get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found"));
    }

    /** Admin step: mark a technician as ID/background verified. */
    @PostMapping("/{id}/verify")
    public Technician verify(@PathVariable Long id) {
        Technician t = get(id);
        t.setVerified(true);
        return repo.save(t);
    }

    /** Called by review-service after a completed repair is reviewed. */
    @PostMapping("/{id}/ratings")
    @Transactional
    public Technician addRating(@PathVariable Long id, @Valid @RequestBody RatingRequest r) {
        Technician t = get(id);
        double total = t.getRatingAvg() * t.getRatingCount() + r.rating();
        t.setRatingCount(t.getRatingCount() + 1);
        t.setRatingAvg(Math.round(total / t.getRatingCount() * 100.0) / 100.0);
        return repo.save(t);
    }
}
