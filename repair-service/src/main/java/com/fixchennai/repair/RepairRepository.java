package com.fixchennai.repair;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepairRepository extends JpaRepository<RepairRequest, Long> {
    List<RepairRequest> findByCustomerPhoneOrderByCreatedAtDesc(String phone);
}
