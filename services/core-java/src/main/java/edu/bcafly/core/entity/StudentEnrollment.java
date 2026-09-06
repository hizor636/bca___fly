package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_course_enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentEnrollment {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @Column(nullable = false)
    @Builder.Default
    private int semester = 1;

    @Column(nullable = false)
    @Builder.Default
    private String section = "A";

    @Column(name = "enrollment_status")
    @Builder.Default
    private String enrollmentStatus = "ENROLLED";

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
