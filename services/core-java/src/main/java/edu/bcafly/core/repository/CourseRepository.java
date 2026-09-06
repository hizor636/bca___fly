package edu.bcafly.core.repository;

import edu.bcafly.core.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByActiveTrue();
    List<Course> findBySemesterAndActiveTrue(int semester);
    Optional<Course> findByCourseCode(String courseCode);
}
