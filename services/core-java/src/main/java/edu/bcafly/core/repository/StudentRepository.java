package edu.bcafly.core.repository;

import edu.bcafly.core.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<StudentProfile, String> {
    List<StudentProfile> findByActiveTrue();
    Optional<StudentProfile> findByStudentId(String studentId);
    Optional<StudentProfile> findByEmail(String email);
    List<StudentProfile> findByAssignedFacultyIdAndActiveTrue(String assignedFacultyId);
    List<StudentProfile> findByParentPhoneAndActiveTrue(String parentPhone);
}
