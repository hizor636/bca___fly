package edu.bcafly.core.repository;

import edu.bcafly.core.entity.FacultyAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FacultyAllocationRepository extends JpaRepository<FacultyAllocation, String> {
    List<FacultyAllocation> findByFacultyId(String facultyId);
    List<FacultyAllocation> findByCourseId(String courseId);
    boolean existsByFacultyIdAndCourseIdAndSection(String facultyId, String courseId, String section);
}
