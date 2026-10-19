package com.fixchennai.technician;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    @Query("select t from Technician t where (:category is null or lower(t.category) = lower(:category)) "
         + "and (:area is null or lower(t.areas) like lower(concat('%', :area, '%')))")
    List<Technician> search(@Param("category") String category, @Param("area") String area, Sort sort);
}
