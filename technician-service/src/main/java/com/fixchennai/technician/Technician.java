package com.fixchennai.technician;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Technician {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String name;
    @NotBlank private String phone;
    /** e.g. WASHING_MACHINE, AC, REFRIGERATOR, TV, PLUMBING, ELECTRICAL, WATER_PURIFIER */
    @NotBlank private String category;
    /** comma separated Chennai localities, e.g. "Adyar,Velachery,Guindy" */
    @NotBlank private String areas;
    @Min(0) private int experienceYears;
    @Min(0) private int visitFee;
    private boolean verified;
    private double ratingAvg;
    private int ratingCount;
}
