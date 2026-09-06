package edu.bcafly.core.service;

import edu.bcafly.core.entity.*;
import edu.bcafly.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final BatchRepository batchRepository;
    private final CourseRepository courseRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;
    private final FacultyAllocationRepository facultyAllocationRepository;
    private final AuditService auditService;

    public List<Department> getAllDepartments() {
        return departmentRepository.findByActiveTrue();
    }

    public List<Semester> getSemestersByDepartment(String deptCode) {
        return semesterRepository.findByActiveTrueOrderByNumberAsc();
    }

    public List<Course> getCoursesByDepartment(String deptCode) {
        return courseRepository.findByActiveTrue();
    }

    public List<StudentProfile> getStudentsByDepartment(String deptCode) {
        return studentRepository.findByActiveTrue();
    }

    public List<FacultyProfile> getFacultyByDepartment(String deptCode) {
        return facultyRepository.findByDepartmentAndActiveTrue(deptCode);
    }

    // 1. Create Department
    @Transactional
    public Department createDepartment(String name, String code, String deptHeadId) {
        String id = "dept-" + code.toLowerCase().replaceAll("[^a-z0-9]", "");
        Department dept = Department.builder()
                .id(id)
                .name(name)
                .code(code)
                .deptHeadId(deptHeadId)
                .active(true)
                .build();
        Department saved = departmentRepository.save(dept);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_CREATE_DEPARTMENT", "DEPARTMENT", id, "Created department: " + name, null);
        return saved;
    }

    // 2. Create Academic Year
    @Transactional
    public AcademicYear createAcademicYear(String name, LocalDate startDate, LocalDate endDate, double attendanceRule) {
        String id = "ay-" + name.replaceAll("[^a-zA-Z0-9]", "");
        AcademicYear ay = AcademicYear.builder()
                .id(id)
                .name(name)
                .startDate(startDate)
                .endDate(endDate)
                .attendanceRule(attendanceRule)
                .active(true)
                .build();
        AcademicYear saved = academicYearRepository.save(ay);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_CREATE_ACADEMIC_YEAR", "ACADEMIC_YEAR", id, "Created academic year: " + name, null);
        return saved;
    }

    // 3. Configure Semester
    @Transactional
    public Semester configureSemester(int number, String name, int year, LocalDate startDate, LocalDate endDate, int credits, double minAttendance) {
        String id = "sem-" + number;
        Semester sem = Semester.builder()
                .id(id)
                .number(number)
                .name(name)
                .year(year)
                .startDate(startDate)
                .endDate(endDate)
                .credits(credits)
                .minAttendance(minAttendance)
                .active(true)
                .build();
        Semester saved = semesterRepository.save(sem);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_CONFIGURE_SEMESTER", "SEMESTER", id, "Configured semester " + number + " (" + name + ")", null);
        return saved;
    }

    // 4. Create Course Master
    @Transactional
    public Course createCourse(String courseCode, String courseName, int semester, int credits, String courseType, int maxMarks, int passMarks, double attendanceRequired) {
        String id = "crs-" + courseCode.toLowerCase().replaceAll("[^a-z0-9]", "");
        Course course = Course.builder()
                .id(id)
                .courseCode(courseCode)
                .courseName(courseName)
                .semester(semester)
                .credits(credits)
                .courseType(courseType != null ? courseType : "Theory")
                .maxMarks(maxMarks > 0 ? maxMarks : 100)
                .passMarks(passMarks > 0 ? passMarks : 40)
                .attendanceRequired(attendanceRequired > 0 ? attendanceRequired : 75.0)
                .active(true)
                .build();
        Course saved = courseRepository.save(course);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_CREATE_COURSE", "COURSE", id, "Created course: " + courseCode + " - " + courseName, null);
        return saved;
    }

    // 5. Create Faculty
    @Transactional
    public FacultyProfile createFaculty(String name, String email, String designation, String department, String phone) {
        String id = "fac-" + UUID.randomUUID().toString().substring(0, 8);
        FacultyProfile faculty = FacultyProfile.builder()
                .id(id)
                .name(name)
                .email(email)
                .designation(designation != null ? designation : "Assistant Professor")
                .department(department != null ? department : "BCA")
                .phone(phone)
                .active(true)
                .build();
        FacultyProfile saved = facultyRepository.save(faculty);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_CREATE_FACULTY", "FACULTY", id, "Created faculty profile: " + name + " (" + email + ")", null);
        return saved;
    }

    // 6. Create Student
    @Transactional
    public StudentProfile createStudent(String studentId, String name, String email, String phone, String parentPhone, int semester, String section) {
        String id = "stu-" + studentId.toLowerCase().replaceAll("[^a-z0-9]", "");
        StudentProfile student = StudentProfile.builder()
                .id(id)
                .studentId(studentId)
                .name(name)
                .email(email)
                .phone(phone)
                .parentPhone(parentPhone)
                .semester(semester > 0 ? semester : 1)
                .section(section != null ? section : "A")
                .course("BCA")
                .active(true)
                .build();
        StudentProfile saved = studentRepository.save(student);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_CREATE_STUDENT", "STUDENT", id, "Created student profile: " + studentId + " (" + name + ")", null);
        return saved;
    }

    // 7. Enroll Student in Course
    @Transactional
    public StudentEnrollment enrollStudent(String studentId, String courseId, int semester, String section) {
        String id = "enr-" + studentId + "-" + courseId;
        StudentEnrollment enrollment = StudentEnrollment.builder()
                .id(id)
                .studentId(studentId)
                .courseId(courseId)
                .semester(semester > 0 ? semester : 1)
                .section(section != null ? section : "A")
                .enrollmentStatus("ENROLLED")
                .build();
        StudentEnrollment saved = studentEnrollmentRepository.save(enrollment);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_ENROLL_STUDENT", "ENROLLMENT", id, "Enrolled student " + studentId + " into course " + courseId, null);
        return saved;
    }

    // 8. Assign Faculty to Course
    @Transactional
    public FacultyAllocation allocateFaculty(String facultyId, String courseId, String section, String batch, String academicYear) {
        String id = "alloc-" + facultyId + "-" + courseId + "-" + (section != null ? section : "A");
        FacultyAllocation allocation = FacultyAllocation.builder()
                .id(id)
                .facultyId(facultyId)
                .courseId(courseId)
                .section(section != null ? section : "A")
                .batch(batch != null ? batch : "2026-27")
                .academicYear(academicYear != null ? academicYear : "2026-27")
                .assignedRole("PRIMARY_INSTRUCTOR")
                .build();
        FacultyAllocation saved = facultyAllocationRepository.save(allocation);
        auditService.logEvent("ADMIN", "ADMIN", "ADMIN_ALLOCATE_FACULTY", "ALLOCATION", id, "Assigned faculty " + facultyId + " to course " + courseId, null);
        return saved;
    }

    @Transactional
    public void initializeBcaDepartmentStructure(String departmentCode, String adminUser) {
        // Create Department
        if (departmentRepository.findByCode(departmentCode).isEmpty()) {
            createDepartment("Department of Computer Applications", departmentCode, "HOD_BCA");
        }

        // Create Academic Year
        if (academicYearRepository.findByName("2026-27").isEmpty()) {
            createAcademicYear("2026-27", LocalDate.of(2026, 7, 1), LocalDate.of(2027, 6, 30), 75.0);
        }

        // Create Semesters 1 to 6
        for (int i = 1; i <= 6; i++) {
            if (semesterRepository.findByNumber(i).isEmpty()) {
                int year = (i + 1) / 2;
                LocalDate start = (i % 2 == 1) ? LocalDate.of(2026, 7, 15) : LocalDate.of(2027, 1, 15);
                LocalDate end = (i % 2 == 1) ? LocalDate.of(2026, 12, 15) : LocalDate.of(2027, 5, 31);
                configureSemester(i, "Semester " + i, year, start, end, 24, 75.0);
            }
        }

        // Create Batches
        String[] batches = {"2024-2027", "2025-2028", "2026-2029"};
        for (String bName : batches) {
            if (batchRepository.findByName(bName).isEmpty()) {
                int sYear = Integer.parseInt(bName.substring(0, 4));
                int eYear = Integer.parseInt(bName.substring(5));
                Batch b = Batch.builder()
                        .id("batch-" + bName)
                        .name(bName)
                        .departmentId(departmentCode)
                        .academicYear("2026-27")
                        .startYear(sYear)
                        .endYear(eYear)
                        .section("A")
                        .active(true)
                        .build();
                batchRepository.save(b);
            }
        }


        // Create Standard Courses
        String[][] standardCourses = {
            {"BCA101", "Digital Fundamentals & Computer Architecture", "1", "4"},
            {"BCA102", "Programming in C and Data Structures", "1", "4"},
            {"BCA201", "Object Oriented Programming using Java", "2", "4"},
            {"BCA202", "Database Management Systems & SQL", "2", "4"},
            {"BCA301", "Python Programming & Data Analytics", "3", "4"},
            {"BCA302", "Computer Networks & Network Security", "3", "4"},
            {"BCA401", "Web Technologies & Full Stack Development", "4", "4"},
            {"BCA402", "Software Engineering & Agile Methodologies", "4", "4"},
            {"BCA501", "Cloud Computing & DevOps", "5", "4"},
            {"BCA502", "Machine Learning & AI Foundations", "5", "4"},
            {"BCA601", "Major Capstone Project & Viva", "6", "8"}
        };

        for (String[] crs : standardCourses) {
            if (courseRepository.findByCourseCode(crs[0]).isEmpty()) {
                createCourse(crs[0], crs[1], Integer.parseInt(crs[2]), Integer.parseInt(crs[3]), "Theory", 100, 40, 75.0);
            }
        }

        auditService.logEvent(adminUser, "ADMIN", "ADMIN_INIT_FULL_BCA", "DEPARTMENT", departmentCode, "Initialized 6-semester BCA curriculum", null);
    }
}
