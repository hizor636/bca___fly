package edu.bcafly.core.repository;

import edu.bcafly.core.entity.FacultyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<FacultyProfile, String> {
    List<FacultyProfile> findByActiveTrue();
    List<FacultyProfile> findByDepartmentAndActiveTrue(String department);
    Optional<FacultyProfile> findByEmail(String email);
}

