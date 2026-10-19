package com.fixchennai.repair;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Getter @Setter
public class RepairRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String customerName;
    private String customerPhone;
    private String category;
    @Column(length = 1000) private String issue;
    private String area;
    private Long technicianId;
    @Enumerated(EnumType.STRING) private Status status = Status.REQUESTED;
    private Integer quotedAmount;
    private Integer finalAmount;
    private Instant createdAt = Instant.now();
}
