package com.fixchennai.review;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Getter @Setter
@Table(uniqueConstraints = @UniqueConstraint(columnNames = "repairId"))
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long repairId;
    private Long technicianId;
    private int rating;
    @Column(length = 1000) private String comment;
    private Instant createdAt = Instant.now();
}
