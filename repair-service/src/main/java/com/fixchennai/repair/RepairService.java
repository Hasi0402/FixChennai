package com.fixchennai.repair;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@Transactional
public class RepairService {
    /** Final bill may exceed the accepted quote by at most this fraction. */
    private static final double MAX_OVERRUN = 0.10;

    private final RepairRepository repairs;
    private final StatusEventRepository events;

    public RepairService(RepairRepository repairs, StatusEventRepository events) {
        this.repairs = repairs;
        this.events = events;
    }

    public RepairRequest create(RepairRequest r) {
        r.setId(null);
        r.setStatus(Status.REQUESTED);
        RepairRequest saved = repairs.save(r);
        log(saved, "Repair requested");
        return saved;
    }

    public RepairRequest get(Long id) {
        return repairs.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Repair not found"));
    }

    public List<RepairRequest> historyFor(String phone) { return repairs.findByCustomerPhoneOrderByCreatedAtDesc(phone); }

    public List<StatusEvent> timeline(Long id) { get(id); return events.findByRepairIdOrderByAtAsc(id); }

    public RepairRequest quote(Long id, Long technicianId, int amount, String note) {
        RepairRequest r = get(id);
        require(r, Status.REQUESTED, Status.QUOTED);
        r.setTechnicianId(technicianId);
        r.setQuotedAmount(amount);
        r.setStatus(Status.QUOTED);
        return log(repairs.save(r), "Quote of Rs." + amount + (note == null ? "" : " - " + note));
    }

    public RepairRequest accept(Long id) {
        RepairRequest r = get(id);
        require(r, Status.QUOTED);
        r.setStatus(Status.ACCEPTED);
        return log(repairs.save(r), "Customer accepted quote");
    }

    public RepairRequest start(Long id) {
        RepairRequest r = get(id);
        require(r, Status.ACCEPTED);
        r.setStatus(Status.IN_PROGRESS);
        return log(repairs.save(r), "Work started");
    }

    public RepairRequest complete(Long id, int finalAmount) {
        RepairRequest r = get(id);
        require(r, Status.IN_PROGRESS);
        int cap = (int) Math.floor(r.getQuotedAmount() * (1 + MAX_OVERRUN));
        if (finalAmount > cap) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Final amount exceeds the accepted quote by more than 10% (max Rs." + cap + "). Send a revised quote first.");
        }
        r.setFinalAmount(finalAmount);
        r.setStatus(Status.COMPLETED);
        return log(repairs.save(r), "Completed. Final bill Rs." + finalAmount);
    }

    public RepairRequest cancel(Long id, String reason) {
        RepairRequest r = get(id);
        require(r, Status.REQUESTED, Status.QUOTED, Status.ACCEPTED, Status.IN_PROGRESS);
        r.setStatus(Status.CANCELLED);
        return log(repairs.save(r), "Cancelled" + (reason == null ? "" : ": " + reason));
    }

    private void require(RepairRequest r, Status... allowed) {
        for (Status s : allowed) if (r.getStatus() == s) return;
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid transition from " + r.getStatus());
    }

    private RepairRequest log(RepairRequest r, String note) {
        StatusEvent e = new StatusEvent();
        e.setRepairId(r.getId());
        e.setStatus(r.getStatus());
        e.setNote(note);
        events.save(e);
        return r;
    }
}
