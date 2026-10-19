package com.fixchennai.repair;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StatusEventRepository extends JpaRepository<StatusEvent, Long> {
    List<StatusEvent> findByRepairIdOrderByAtAsc(Long repairId);
}
