package com.fixchennai.review;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

/**
 * Trust rule: only the customer of a COMPLETED repair can review it, once.
 * No verified repair = no review, so ratings can't be faked.
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    public record ReviewRequest(@NotNull Long repairId, @NotBlank String customerPhone,
                                @Min(1) @Max(5) int rating, String comment) {}
    record RepairView(Long id, Long technicianId, String status, String customerPhone) {}

    private final ReviewRepository repo;
    private final RestClient http;

    public ReviewController(ReviewRepository repo, RestClient.Builder builder) {
        this.repo = repo;
        this.http = builder.build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Review create(@Valid @RequestBody ReviewRequest req) {
        RepairView repair = http.get().uri("http://repair-service/api/repairs/{id}", req.repairId())
                .retrieve().body(RepairView.class);
        if (repair == null || !"COMPLETED".equals(repair.status()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only completed repairs can be reviewed");
        if (!repair.customerPhone().equals(req.customerPhone()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the customer of this repair can review it");
        if (repo.existsByRepairId(req.repairId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This repair has already been reviewed");

        Review r = new Review();
        r.setRepairId(req.repairId());
        r.setTechnicianId(repair.technicianId());
        r.setRating(req.rating());
        r.setComment(req.comment());
        Review saved = repo.save(r);

        http.post().uri("http://technician-service/api/technicians/{id}/ratings", repair.technicianId())
                .body(Map.of("rating", req.rating())).retrieve().toBodilessEntity();
        return saved;
    }

    @GetMapping
    public List<Review> forTechnician(@RequestParam Long technicianId) {
        return repo.findByTechnicianIdOrderByCreatedAtDesc(technicianId);
    }
}
