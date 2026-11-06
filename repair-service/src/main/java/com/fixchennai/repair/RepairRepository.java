package com.fixchennai.repair;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepairRepository extends JpaRepository<RepairRequest, Long> {
    List<RepairRequest> findByCustomerPhoneOrderByCreatedAtDesc(String phone);
    List<RepairRequest> findByTechnicianIdOrderByCreatedAtDesc(Long technicianId);
    List<RepairRequest> findByStatusOrderByCreatedAtDesc(Status status);
    List<RepairRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(Status status);
}
