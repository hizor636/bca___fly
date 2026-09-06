package edu.bcafly.core.controller;

import edu.bcafly.core.entity.*;
import edu.bcafly.core.repository.AuditLogRepository;
import edu.bcafly.core.service.CsvBatchImportService;
import edu.bcafly.core.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/master")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminMasterDataController {

    private final MasterDataService masterDataService;
    private final CsvBatchImportService csvBatchImportService;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "bcafly-core-java",
                "engine", "Spring Boot 3.4.3 / Java 21",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(masterDataService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(
            @RequestBody Map<String, String> req,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        String name = req.get("name");
        String code = req.get("code");
        String headId = req.getOrDefault("deptHeadId", "HOD");
        return ResponseEntity.ok(masterDataService.createDepartment(name, code, headId));
    }

    @PostMapping("/initialize-bca-setup")
    public ResponseEntity<Map<String, Object>> initializeBcaFullSetup(
            @RequestParam(defaultValue = "BCA") String departmentCode,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        masterDataService.initializeBcaDepartmentStructure(departmentCode, adminUser);
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Institutional BCA 6-semester structure and curriculum initialized.",
                "departmentCode", departmentCode
        ));
    }

    @GetMapping("/semesters/{deptCode}")
    public ResponseEntity<List<Semester>> getSemesters(@PathVariable String deptCode) {
        return ResponseEntity.ok(masterDataService.getSemestersByDepartment(deptCode));
    }

    @GetMapping("/courses/{deptCode}")
    public ResponseEntity<List<Course>> getCourses(@PathVariable String deptCode) {
        return ResponseEntity.ok(masterDataService.getCoursesByDepartment(deptCode));
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        String code = (String) req.get("courseCode");
        String name = (String) req.get("courseName");
        int semester = req.containsKey("semester") ? ((Number) req.get("semester")).intValue() : 1;
        int credits = req.containsKey("credits") ? ((Number) req.get("credits")).intValue() : 4;
        String type = (String) req.getOrDefault("courseType", "Theory");
        int maxMarks = req.containsKey("maxMarks") ? ((Number) req.get("maxMarks")).intValue() : 100;
        int passMarks = req.containsKey("passMarks") ? ((Number) req.get("passMarks")).intValue() : 40;
        double minAtt = req.containsKey("attendanceRequired") ? ((Number) req.get("attendanceRequired")).doubleValue() : 75.0;

        Course course = masterDataService.createCourse(code, name, semester, credits, type, maxMarks, passMarks, minAtt);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/students/{deptCode}")
    public ResponseEntity<List<StudentProfile>> getStudents(@PathVariable String deptCode) {
        return ResponseEntity.ok(masterDataService.getStudentsByDepartment(deptCode));
    }

    @PostMapping("/students")
    public ResponseEntity<StudentProfile> createStudent(
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        String studentId = (String) req.get("studentId");
        String name = (String) req.get("name");
        String email = (String) req.get("email");
        String phone = (String) req.get("phone");
        String parentPhone = (String) req.get("parentPhone");
        int semester = req.containsKey("semester") ? ((Number) req.get("semester")).intValue() : 1;
        String section = (String) req.getOrDefault("section", "A");

        StudentProfile student = masterDataService.createStudent(studentId, name, email, phone, parentPhone, semester, section);
        return ResponseEntity.ok(student);
    }

    @PostMapping("/students/batch-csv")
    public ResponseEntity<CsvBatchImportService.ImportSummary> importStudentsCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "BCA") String departmentCode,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        CsvBatchImportService.ImportSummary summary = csvBatchImportService.importStudentsCsv(file, departmentCode, adminUser);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/faculty/{deptCode}")
    public ResponseEntity<List<FacultyProfile>> getFaculty(@PathVariable String deptCode) {
        return ResponseEntity.ok(masterDataService.getFacultyByDepartment(deptCode));
    }

    @PostMapping("/faculty")
    public ResponseEntity<FacultyProfile> createFaculty(
            @RequestBody Map<String, String> req,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        String name = req.get("name");
        String email = req.get("email");
        String designation = req.getOrDefault("designation", "Assistant Professor");
        String department = req.getOrDefault("department", "BCA");
        String phone = req.get("phone");

        FacultyProfile faculty = masterDataService.createFaculty(name, email, designation, department, phone);
        return ResponseEntity.ok(faculty);
    }

    @PostMapping("/faculty/batch-csv")
    public ResponseEntity<CsvBatchImportService.ImportSummary> importFacultyCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "BCA") String departmentCode,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        CsvBatchImportService.ImportSummary summary = csvBatchImportService.importFacultyCsv(file, departmentCode, adminUser);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/allocations")
    public ResponseEntity<FacultyAllocation> createAllocation(
            @RequestBody Map<String, String> req,
            @RequestHeader(value = "X-Admin-User", defaultValue = "SYSTEM_ADMIN") String adminUser) {
        String facultyId = req.get("facultyId");
        String courseId = req.get("courseId");
        String section = req.getOrDefault("section", "A");
        String batch = req.getOrDefault("batch", "2026-27");
        String academicYear = req.getOrDefault("academicYear", "2026-27");

        FacultyAllocation allocation = masterDataService.allocateFaculty(facultyId, courseId, section, batch, academicYear);
        return ResponseEntity.ok(allocation);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        Page<AuditLog> logs = auditLogRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"))
        );
        return ResponseEntity.ok(logs);
    }
}
