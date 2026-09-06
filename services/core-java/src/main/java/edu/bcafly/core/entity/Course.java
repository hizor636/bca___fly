package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    private String id;

    @Column(name = "course_code", nullable = false, unique = true)
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(name = "short_name")
    private String shortName;

    @Column(nullable = false)
    private int semester;

    @Column(nullable = false)
    @Builder.Default
    private int credits = 4;

    @Column(name = "course_type")
    @Builder.Default
    private String courseType = "Theory";

    @Column(name = "max_marks")
    @Builder.Default
    private int maxMarks = 100;

    @Column(name = "cia1_max_marks")
    @Builder.Default
    private int cia1MaxMarks = 20;

    @Column(name = "cia2_max_marks")
    @Builder.Default
    private int cia2MaxMarks = 20;

    @Column(name = "pass_marks")
    @Builder.Default
    private int passMarks = 40;

    @Column(name = "attendance_required")
    @Builder.Default
    private double attendanceRequired = 75.0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "archived_by")
    private String archivedBy;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
