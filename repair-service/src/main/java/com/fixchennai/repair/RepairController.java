package com.fixchennai.repair;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/repairs")
public class RepairController {

    public record CreateRequest(@NotBlank String customerName, @NotBlank String customerPhone,
                                @NotBlank String category, @NotBlank String issue, @NotBlank String area) {}
    public record QuoteRequest(@NotNull Long technicianId, @Min(1) int amount, String note) {}
    public record CompleteRequest(@Min(1) int finalAmount, String completionNotes) {}
    public record CancelRequest(String reason) {}
    public record AssignRequest(@NotNull Long technicianId, String note) {}
    public record RejectRequest(@NotNull Long technicianId, String reason) {}

    private final RepairService service;

    public RepairController(RepairService service) { this.service = service; }

    @GetMapping("/estimate")
    public PriceGuide.Range estimate(@RequestParam String category) { return PriceGuide.forCategory(category); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RepairRequest create(@Valid @RequestBody CreateRequest c) {
        RepairRequest r = new RepairRequest();
        r.setCustomerName(c.customerName());
        r.setCustomerPhone(c.customerPhone());
        r.setCategory(c.category().toUpperCase());
        r.setIssue(c.issue());
        r.setArea(c.area());
        return service.create(r);
    }

    /** Repair history for a customer, newest first. */
    @GetMapping
    public List<RepairRequest> history(@RequestParam String phone) { return service.historyFor(phone); }

    /** All repairs across the system for Admin dashboard. */
    @GetMapping("/all")
    public List<RepairRequest> all() { return service.all(); }

    /** Repairs assigned to technician or available for technician to quote. */
    @GetMapping("/technician/{techId}")
    public List<RepairRequest> forTechnician(@PathVariable Long techId) {
        return service.historyForTechnician(techId);
    }

    @GetMapping("/{id}")
    public RepairRequest get(@PathVariable Long id) { return service.get(id); }

    @GetMapping("/{id}/timeline")
    public List<StatusEvent> timeline(@PathVariable Long id) { return service.timeline(id); }

    @PostMapping("/{id}/quote")
    public RepairRequest quote(@PathVariable Long id, @Valid @RequestBody QuoteRequest q) {
        return service.quote(id, q.technicianId(), q.amount(), q.note());
    }

    @PostMapping("/{id}/accept")
    public RepairRequest accept(@PathVariable Long id) { return service.accept(id); }

    @PostMapping("/{id}/start")
    public RepairRequest start(@PathVariable Long id) { return service.start(id); }

    @PostMapping("/{id}/complete")
    public RepairRequest complete(@PathVariable Long id, @Valid @RequestBody CompleteRequest c) {
        return service.complete(id, c.finalAmount(), c.completionNotes());
    }

    @PostMapping("/{id}/cancel")
    public RepairRequest cancel(@PathVariable Long id, @RequestBody(required = false) CancelRequest c) {
        return service.cancel(id, c == null ? null : c.reason());
    }

    @PostMapping("/{id}/assign")
    public RepairRequest assign(@PathVariable Long id, @Valid @RequestBody AssignRequest a) {
        return service.assignTechnician(id, a.technicianId(), a.note());
    }

    @PostMapping("/{id}/reject")
    public RepairRequest reject(@PathVariable Long id, @Valid @RequestBody RejectRequest r) {
        return service.reject(id, r.technicianId(), r.reason());
    }
}
