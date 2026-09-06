package edu.bcafly.core.repository;

import edu.bcafly.core.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {
    List<Department> findByActiveTrue();
    Optional<Department> findByCode(String code);
}
