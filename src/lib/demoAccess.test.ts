import { describe, expect, it } from 'vitest';
import {
  canCreateCounselingReferral,
  getAssignedMentor,
  getFacultyScopedStudents,
  isCounselingReferralVisibleToRole,
} from './demoAccess';
import { FacultyMember, Student, User } from '../types';

const faculty: FacultyMember = {
  id: 'faculty-a',
  name: 'Dr. Asha Rao',
  designation: 'Faculty Mentor',
  department: 'BCA',
  email: 'asha@bcafly.edu',
  phone: '555-0100',
  office: 'Room 101',
  assignedStudentsCount: 1,
  specialization: 'Systems',
  courses: ['BCA-101'],
};

const otherFaculty: FacultyMember = { ...faculty, id: 'faculty-b', name: 'Dr. Ben Shah' };
const student: Student = {
  id: 'student-a',
  studentId: 'BCA-001',
  name: 'Student A',
  initials: 'SA',
  course: 'BCA',
  semester: 2,
  section: 'A',
  email: 'student@bcafly.edu',
  phone: '555-0200',
  attendanceRate: 82,
  mentoringStatus: 'Regular',
  cgpa: 8.1,
  assignedFaculty: faculty.name,
  assignedFacultyId: faculty.id,
  mentoringNotes: [],
  subjectGrades: [],
  weeklyAttendance: [],
};
const otherStudent: Student = { ...student, id: 'student-b', studentId: 'BCA-002', assignedFaculty: otherFaculty.name, assignedFacultyId: otherFaculty.id };
const facultyUser: User = { id: faculty.id, name: faculty.name, email: faculty.email, role: 'faculty', phone: faculty.phone || '', departmentId: 'dept-bca', isActive: true, createdAt: '2026-01-01' };

const referral = {
  id: 'ref-1',
  studentId: student.id,
  studentName: student.name,
  semester: student.semester,
  referredByFacultyId: faculty.id,
  referredByFacultyName: faculty.name,
  counselorId: 'counselor-1',
  counselorName: 'Counselor',
  reasonCode: 'academic_stress' as const,
  facultyRemarks: 'Needs support',
  status: 'pending' as const,
  mentorVisibleStatus: 'Under Review' as const,
  createdAt: '2026-09-20',
  notesCount: 0,
};

describe('Faculty-Mentor demo model', () => {
  it('returns only students assigned to the active faculty across all semesters', () => {
    const semesterSixStudent = { ...student, id: 'student-c', studentId: 'BCA-003', semester: 6 };
    const scoped = getFacultyScopedStudents('faculty', faculty, [student, otherStudent, semesterSixStudent]);
    expect(scoped.map((item) => item.id)).toEqual(['student-a', 'student-c']);
  });

  it('does not expose all students when faculty scope is unavailable', () => {
    expect(getFacultyScopedStudents('faculty', null, [student, otherStudent])).toEqual([]);
    expect(getFacultyScopedStudents('student', faculty, [student, otherStudent])).toEqual([]);
  });

  it('allows administrators to inspect the complete student population', () => {
    expect(getFacultyScopedStudents('admin', null, [student, otherStudent])).toHaveLength(2);
  });
});

describe('Counseling access permissions', () => {
  it('allows a faculty mentor to refer only an assigned student', () => {
    expect(canCreateCounselingReferral({ currentRole: 'faculty', currentUser: facultyUser, activeFaculty: faculty, student })).toBe(true);
    expect(canCreateCounselingReferral({ currentRole: 'faculty', currentUser: facultyUser, activeFaculty: faculty, student: otherStudent })).toBe(false);
  });

  it('allows a student to refer only themselves and blocks parent access', () => {
    const studentUser: User = { ...facultyUser, id: student.id, email: student.email, name: student.name, role: 'student', studentId: student.studentId };
    expect(canCreateCounselingReferral({ currentRole: 'student', currentUser: studentUser, activeStudent: student, student })).toBe(true);
    expect(canCreateCounselingReferral({ currentRole: 'student', currentUser: studentUser, activeStudent: student, student: otherStudent })).toBe(false);
    expect(canCreateCounselingReferral({ currentRole: 'parent', currentUser: studentUser, student })).toBe(false);
  });

  it('limits referral visibility to counselor/admin, referring faculty, or the referred student', () => {
    expect(isCounselingReferralVisibleToRole(referral, 'counselor')).toBe(true);
    expect(isCounselingReferralVisibleToRole(referral, 'faculty', facultyUser, faculty)).toBe(true);
    expect(isCounselingReferralVisibleToRole(referral, 'faculty', facultyUser, otherFaculty)).toBe(false);
    expect(isCounselingReferralVisibleToRole(referral, 'student', { ...facultyUser, id: student.id, role: 'student', studentId: student.studentId })).toBe(true);
    expect(isCounselingReferralVisibleToRole(referral, 'parent', { ...facultyUser, role: 'parent' })).toBe(false);
  });
});

describe('Parent mentor contact card model', () => {
  it('returns no mentor instead of leaking the first faculty record', () => {
    const unassigned = { ...student, assignedFaculty: '', assignedFacultyId: undefined };
    expect(getAssignedMentor(unassigned, [faculty, otherFaculty])).toBeNull();
    expect(getAssignedMentor(student, [faculty, otherFaculty])).toEqual(faculty);
  });
});
