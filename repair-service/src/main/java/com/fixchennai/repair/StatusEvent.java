package com.fixchennai.repair;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/** One row per workflow step: this is the customer-visible repair timeline / history. */
@Entity
@Getter @Setter
public class StatusEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long repairId;
    @Enumerated(EnumType.STRING) private Status status;
    private String note;
    private Instant at = Instant.now();
}
