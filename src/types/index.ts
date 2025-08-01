export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'faculty' | 'timetable_committee' | 'examination_committee';
  phone?: string;
  isApproved?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  registrationDate?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  year: string;
  parentEmail?: string;
  parentPhone?: string;
  isApproved?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  registrationDate?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
  subject: string;
  facultyId: string;
  facultyName: string;
  reason?: string;
  class: string;
  year: string;
}

export interface LeaveApplication {
  id: string;
  facultyId: string;
  facultyName: string;
  startDate: string;
  endDate: string;
  leaveType: 'medical' | 'personal';
  subject: string;
  description: string;
  status: 'pending_committee_approval' | 'pending_principal_approval' | 'approved' | 'rejected';
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  comments?: string;
  committeeApproved?: boolean;
  principalApproved?: boolean;
  committeeReviewedBy?: string;
  committeeReviewedDate?: string;
  principalReviewedBy?: string;
  principalReviewedDate?: string;
  committeeComments?: string;
  principalComments?: string;
}

export interface Achievement {
  id: string;
  facultyId: string;
  facultyName: string;
  title: string;
  description: string;
  type: 'certification' | 'publication' | 'award' | 'training' | 'workshop';
  date: string;
  fileUrl?: string;
  isTopPerformer: boolean;
  submittedDate: string;
}

export interface TimeSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subject: string;
  facultyId: string;
  facultyName: string;
  class: string;
  year: string;
  room?: string;
  semester: string;
  academicYear: string;
}

export interface Timetable {
  id: string;
  class: string;
  year: string;
  semester: string;
  academicYear: string;
  timeSlots: TimeSlot[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}
