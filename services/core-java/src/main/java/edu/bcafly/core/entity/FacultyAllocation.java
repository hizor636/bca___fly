package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_course_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyAllocation {

    @Id
    private String id;

    @Column(name = "faculty_id", nullable = false)
    private String facultyId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @Column(nullable = false)
    @Builder.Default
    private String section = "A";

    @Column(nullable = false)
    @Builder.Default
    private String batch = "2026-27";

    @Column(name = "academic_year", nullable = false)
    @Builder.Default
    private String academicYear = "2026-27";

    @Column(name = "assigned_role")
    @Builder.Default
    private String assignedRole = "PRIMARY_INSTRUCTOR";

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
