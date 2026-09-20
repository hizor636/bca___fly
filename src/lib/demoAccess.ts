import { CounselingReferral, FacultyMember, Student, User, UserRole } from '../types';

export function getFacultyScopedStudents(
  currentRole: UserRole,
  activeFaculty: FacultyMember | null | undefined,
  students: Student[],
): Student[] {
  if (currentRole === 'admin' || currentRole === 'super_admin') return students;
  if (currentRole !== 'faculty' || !activeFaculty?.id) return [];

  return students.filter(
    (student) =>
      student.assignedFacultyId === activeFaculty.id ||
      student.assignedFaculty?.toLowerCase() === activeFaculty.name.toLowerCase(),
  );
}

export function findStudentForLogin(students: Student[], loginInput?: string, studentId?: string): Student | null {
  const normalizedInput = loginInput?.trim().toLowerCase();
  if (!normalizedInput && !studentId) return null;

  return (
    students.find(
      (student) =>
        (studentId && student.studentId === studentId) ||
        (normalizedInput &&
          (student.id.toLowerCase() === normalizedInput ||
            student.studentId.toLowerCase() === normalizedInput ||
            student.email.toLowerCase() === normalizedInput)),
    ) || null
  );
}

export function canCreateCounselingReferral(params: {
  currentRole: UserRole;
  currentUser?: User | null;
  activeFaculty?: FacultyMember | null;
  activeStudent?: Student | null;
  student?: Student | null;
}): boolean {
  const { currentRole, currentUser, activeFaculty, activeStudent, student } = params;
  if (!student) return false;

  if (currentRole === 'faculty') {
    return Boolean(
      activeFaculty?.id &&
        (student.assignedFacultyId === activeFaculty.id ||
          student.assignedFaculty?.toLowerCase() === activeFaculty.name.toLowerCase()),
    );
  }

  if (currentRole === 'student') {
    return Boolean(
      currentUser?.studentId &&
        (student.studentId === currentUser.studentId || student.id === activeStudent?.id),
    );
  }

  return false;
}

export function isCounselingReferralVisibleToRole(
  referral: CounselingReferral,
  role: UserRole,
  currentUser?: User | null,
  activeFaculty?: FacultyMember | null,
): boolean {
  if (role === 'admin' || role === 'super_admin' || role === 'counselor') return true;
  if (role === 'faculty') return referral.referredByFacultyId === activeFaculty?.id;
  if (role === 'student') return referral.studentId === currentUser?.id || referral.studentId === currentUser?.studentId;
  return false;
}

export function getAssignedMentor(
  student: Student,
  facultyList: FacultyMember[],
): FacultyMember | null {
  if (!student.assignedFacultyId && !student.assignedFaculty) return null;
  return (
    facultyList.find(
      (faculty) =>
        faculty.id === student.assignedFacultyId ||
        faculty.name.toLowerCase() === student.assignedFaculty?.toLowerCase(),
    ) || null
  );
}
