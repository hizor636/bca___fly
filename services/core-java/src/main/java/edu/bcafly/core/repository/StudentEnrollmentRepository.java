package edu.bcafly.core.repository;

import edu.bcafly.core.entity.StudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, String> {
    List<StudentEnrollment> findByStudentId(String studentId);
    List<StudentEnrollment> findByCourseId(String courseId);
    boolean existsByStudentIdAndCourseId(String studentId, String courseId);
}
