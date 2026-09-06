package edu.bcafly.core.service;

import com.opencsv.CSVReader;
import edu.bcafly.core.entity.*;
import edu.bcafly.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CsvBatchImportService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;

    public record ImportSummary(int totalRows, int successful, int skipped, List<String> errors) {}

    @Transactional
    public ImportSummary importStudentsCsv(MultipartFile file, String departmentCode, String performedBy) {
        int total = 0;
        int success = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        if (departmentCode != null && departmentRepository.findByCode(departmentCode).isEmpty()) {
            errors.add("Warning: Department code " + departmentCode + " not recognized. Proceeding with default.");
        }

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);

             CSVReader csvReader = new CSVReader(reader)) {

            String[] header = csvReader.readNext();
            if (header == null) {
                return new ImportSummary(0, 0, 0, List.of("Empty CSV file."));
            }

            Map<String, Integer> colMap = new HashMap<>();
            for (int i = 0; i < header.length; i++) {
                colMap.put(header[i].trim().toLowerCase(), i);
            }

            String[] line;
            while ((line = csvReader.readNext()) != null) {
                total++;
                try {
                    String rollNo = getCol(line, colMap, "roll_number", "rollnumber", "roll_no", "student_id", "reg_no");
                    String name = getCol(line, colMap, "full_name", "fullname", "name", "student_name");
                    String email = getCol(line, colMap, "email", "student_email");
                    String phone = getCol(line, colMap, "phone", "phone_number", "mobile");
                    String parentPhone = getCol(line, colMap, "guardian_phone", "parent_phone");
                    String semesterStr = getCol(line, colMap, "semester", "sem", "current_semester");
                    String sectionStr = getCol(line, colMap, "section", "sec");

                    if (rollNo == null || rollNo.isBlank() || name == null || name.isBlank()) {
                        skipped++;
                        errors.add("Row " + total + ": Missing required roll number or full name.");
                        continue;
                    }

                    if (studentRepository.findByStudentId(rollNo.trim()).isPresent()) {
                        skipped++;
                        errors.add("Row " + total + ": Student roll number " + rollNo + " already exists. Skipped.");
                        continue;
                    }

                    int semester = 1;
                    if (semesterStr != null && !semesterStr.isBlank()) {
                        try {
                            semester = Integer.parseInt(semesterStr.replaceAll("[^0-9]", ""));
                        } catch (Exception ignored) {}
                    }

                    String id = "stu-" + rollNo.toLowerCase().replaceAll("[^a-z0-9]", "");
                    StudentProfile student = StudentProfile.builder()
                            .id(id)
                            .studentId(rollNo.trim())
                            .name(name.trim())
                            .email(email != null && !email.isBlank() ? email.trim() : rollNo.trim().toLowerCase() + "@student.bcafly.edu")
                            .phone(phone != null ? phone.trim() : null)
                            .parentPhone(parentPhone != null ? parentPhone.trim() : null)
                            .semester(semester)
                            .section(sectionStr != null && !sectionStr.isBlank() ? sectionStr.trim().toUpperCase() : "A")
                            .course(departmentCode != null ? departmentCode : "BCA")
                            .active(true)
                            .build();

                    studentRepository.save(student);
                    success++;
                } catch (Exception ex) {
                    skipped++;
                    errors.add("Row " + total + ": " + ex.getMessage());
                }
            }

            auditService.logEvent(
                    performedBy,
                    "ADMIN",
                    "STUDENT_BATCH_CSV_IMPORT",
                    "STUDENT",
                    departmentCode,
                    "Imported " + success + " students from CSV file: " + file.getOriginalFilename(),
                    "127.0.0.1"
            );

        } catch (Exception e) {
            log.error("Failed to process student CSV batch import", e);
            throw new RuntimeException("CSV Batch import failed: " + e.getMessage(), e);
        }

        return new ImportSummary(total, success, skipped, errors);
    }

    @Transactional
    public ImportSummary importFacultyCsv(MultipartFile file, String departmentCode, String performedBy) {
        int total = 0;
        int success = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVReader csvReader = new CSVReader(reader)) {

            String[] header = csvReader.readNext();
            if (header == null) {
                return new ImportSummary(0, 0, 0, List.of("Empty CSV file."));
            }

            Map<String, Integer> colMap = new HashMap<>();
            for (int i = 0; i < header.length; i++) {
                colMap.put(header[i].trim().toLowerCase(), i);
            }

            String[] line;
            while ((line = csvReader.readNext()) != null) {
                total++;
                try {
                    String name = getCol(line, colMap, "full_name", "name", "faculty_name");
                    String email = getCol(line, colMap, "email", "faculty_email");
                    String phone = getCol(line, colMap, "phone", "mobile", "contact");
                    String designation = getCol(line, colMap, "designation", "role", "title");

                    if (email == null || email.isBlank() || name == null || name.isBlank()) {
                        skipped++;
                        errors.add("Row " + total + ": Missing faculty email or name.");
                        continue;
                    }

                    if (facultyRepository.findByEmail(email.trim()).isPresent()) {
                        skipped++;
                        errors.add("Row " + total + ": Faculty email " + email + " already exists. Skipped.");
                        continue;
                    }

                    String id = "fac-" + UUID.randomUUID().toString().substring(0, 8);
                    FacultyProfile faculty = FacultyProfile.builder()
                            .id(id)
                            .name(name.trim())
                            .email(email.trim())
                            .phone(phone != null ? phone.trim() : null)
                            .designation(designation != null && !designation.isBlank() ? designation.trim() : "Assistant Professor")
                            .department(departmentCode != null ? departmentCode : "BCA")
                            .active(true)
                            .build();

                    facultyRepository.save(faculty);
                    success++;
                } catch (Exception ex) {
                    skipped++;
                    errors.add("Row " + total + ": " + ex.getMessage());
                }
            }

            auditService.logEvent(
                    performedBy,
                    "ADMIN",
                    "FACULTY_BATCH_CSV_IMPORT",
                    "FACULTY",
                    departmentCode,
                    "Imported " + success + " faculty members from CSV file: " + file.getOriginalFilename(),
                    "127.0.0.1"
            );

        } catch (Exception e) {
            log.error("Failed to process faculty CSV batch import", e);
            throw new RuntimeException("CSV Batch import failed: " + e.getMessage(), e);
        }

        return new ImportSummary(total, success, skipped, errors);
    }

    private String getCol(String[] line, Map<String, Integer> colMap, String... keys) {
        for (String key : keys) {
            Integer idx = colMap.get(key.toLowerCase());
            if (idx != null && idx < line.length) {
                String val = line[idx];
                if (val != null && !val.trim().isEmpty()) {
                    return val.trim();
                }
            }
        }
        return null;
    }
}
