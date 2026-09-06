package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(name = "parent_phone")
    private String parentPhone;

    @Column(nullable = false)
    @Builder.Default
    private int semester = 1;

    @Column(nullable = false)
    @Builder.Default
    private String section = "A";

    @Column(nullable = false)
    @Builder.Default
    private String course = "BCA";

    @Column(name = "attendance_rate")
    @Builder.Default
    private double attendanceRate = 0.0;

    @Column(name = "mentoring_status")
    @Builder.Default
    private String mentoringStatus = "Regular";

    @Builder.Default
    private double cgpa = 0.0;

    @Column(name = "assigned_faculty")
    private String assignedFaculty;

    @Column(name = "assigned_faculty_id")
    private String assignedFacultyId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
