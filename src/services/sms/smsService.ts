import { SmsMessage, SmsTemplate, SmsSettings, SmsType } from '../../types';
import { getSmsProvider } from './provider';

export const DEFAULT_SMS_SETTINGS: SmsSettings = {
  smsEnabled: true,
  provider: 'mock',
  senderId: 'BCAFLY',
  dailyLimit: 500,
  attendanceThresholdPct: 75
};

export const MASTER_SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: 'tpl-attendance-alert',
    key: 'ATTENDANCE_ALERT',
    name: 'Mandatory Attendance Shortage Alert',
    type: 'ATTENDANCE',
    body: 'Dear Parent/Guardian, ward {student_name} attendance in {subject} is {attendance_rate}%, below mandatory {threshold}% threshold. Contact academic mentor immediately.',
    variables: ['student_name', 'subject', 'attendance_rate', 'threshold'],
    isActive: true
  },
  {
    id: 'tpl-account-created',
    key: 'ACCOUNT_CREATED',
    name: 'New Student Portal Provisioning',
    type: 'ACCOUNT',
    body: 'Welcome to BcaFly, {student_name}! Your student portal account is active. Roll No: {roll_no}. Access: https://bcafly.edu/portal',
    variables: ['student_name', 'roll_no'],
    isActive: true
  },
  {
    id: 'tpl-announcement',
    key: 'ANNOUNCEMENT',
    name: 'Official Campus Circular Alert',
    type: 'ANNOUNCEMENT',
    body: 'BcaFly Circular: {title}. Action Deadline: {deadline}. Review complete directives in student academic workspace.',
    variables: ['title', 'deadline'],
    isActive: true
  },
  {
    id: 'tpl-result-published',
    key: 'RESULT_PUBLISHED',
    name: 'Continuous Internal Assessment (CIA) Release',
    type: 'ASSESSMENT',
    body: 'Dear {student_name}, marks for {assessment_name} in {subject} have been recorded ({score}/{max_marks}). Check your performance ledger.',
    variables: ['student_name', 'assessment_name', 'subject', 'score', 'max_marks'],
    isActive: true
  }
];

export const SEEDED_SMS_HISTORY: SmsMessage[] = [
  {
    id: 'sms-msg-101',
    studentId: 'student-2',
    studentName: 'Marcus Vance',
    recipientUserId: 'student-2',
    recipientPhone: '+1 (555) 301-9922',
    recipientType: 'Parent',
    messageType: 'ATTENDANCE',
    templateId: 'tpl-attendance-alert',
    body: 'Dear Parent/Guardian, ward Marcus Vance attendance in Web Application Architecture is 68.2%, below mandatory 75% threshold. Contact academic mentor immediately.',
    status: 'sent',
    sentAt: '2026-09-14 11:32 AM',
    providerMessageId: 'mock_sms_178940192',
    triggerReason: 'attendance_below_threshold',
    triggeredByUserId: 'faculty-1',
    createdAt: '2026-09-14 11:32 AM'
  },
  {
    id: 'sms-msg-102',
    studentId: 'student-3',
    studentName: 'Elena Rostova',
    recipientUserId: 'student-3',
    recipientPhone: '+1 (555) 301-9933',
    recipientType: 'Parent',
    messageType: 'ATTENDANCE',
    templateId: 'tpl-attendance-alert',
    body: 'Dear Parent/Guardian, ward Elena Rostova attendance in Cloud & Distributed Systems is 71.4%, below mandatory 75% threshold. Contact academic mentor immediately.',
    status: 'sent',
    sentAt: '2026-09-14 11:32 AM',
    providerMessageId: 'mock_sms_178940193',
    triggerReason: 'attendance_below_threshold',
    triggeredByUserId: 'faculty-1',
    createdAt: '2026-09-14 11:32 AM'
  },
  {
    id: 'sms-msg-103',
    studentId: 'student-1',
    studentName: 'Sarah Jenkins (Ward: Liam Vance)',
    recipientUserId: 'student-1',
    recipientPhone: '+1 (555) 301-9911',
    recipientType: 'Student',
    messageType: 'ANNOUNCEMENT',
    templateId: 'tpl-announcement',
    body: 'BcaFly Circular: CIA-2 Continuous Internal Assessment Schedule Published. Action Deadline: 2026-09-15. Review complete directives in student academic workspace.',
    status: 'sent',
    sentAt: '2026-09-12 09:15 AM',
    providerMessageId: 'mock_sms_178925410',
    triggerReason: 'admin_broadcast',
    triggeredByUserId: 'admin-1',
    createdAt: '2026-09-12 09:15 AM'
  }
];

export function renderTemplate(templateBody: string, variables: Record<string, string | number>): string {
  let rendered = templateBody;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}|\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, String(val));
  }
  return rendered;
}

export function isValidPhone(phone: string): boolean {
  // Accepts standard international/formatted telephone numbers e.g. +1 (555) 301-9911 or +91 9876543210
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15;
}

export async function executeSmsDispatch(
  recipientPhone: string,
  message: string,
  settings: SmsSettings = DEFAULT_SMS_SETTINGS
): Promise<{ success: boolean; providerMessageId?: string; error?: string }> {
  if (!settings.smsEnabled) {
    return { success: false, error: 'SMS service is currently disabled in system settings.' };
  }

  if (!isValidPhone(recipientPhone)) {
    return { success: false, error: `Invalid telephone destination: "${recipientPhone}".` };
  }

  const provider = getSmsProvider(settings.provider);
  try {
    const res = await provider.send(recipientPhone, message);
    return { success: true, providerMessageId: res.providerMessageId };
  } catch (err: any) {
    return { success: false, error: err.message || 'SMS transmission failed.' };
  }
}
