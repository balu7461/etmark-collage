export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'faculty' | 'timetable_committee' | 'examination_committee' | 'achievements_committee';
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
  status: 'present' | 'absent' | 'sports' | 'ec';
  subject: string;
  timeSlot: string;
  facultyId: string;
  facultyName: string;
  reason?: string;
  class: string;
  year: string;
  semesterType?: 'Odd' | 'Even';
}

export interface LeaveApplication {
  id: string;
  facultyId: string;
  facultyName: string;
  startDate: string;
  endDate: string;
  leaveType: 'OD' | 'casual';
  subject: string;
  description: string;
  status: 'pending_examination_committee_approval' | 'pending_timetable_committee_approval' | 'pending_principal_approval' | 'approved' | 'rejected_by_examination_committee' | 'rejected_by_timetable_committee' | 'rejected_by_principal';
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  comments?: string;
  // Examination Committee Review
  examCommitteeApproved?: boolean;
  examCommitteeReviewedBy?: string;
  examCommitteeReviewedDate?: string;
  examCommitteeComments?: string;
  // Timetable Committee Review
  timetableCommitteeApproved?: boolean;
  timetableCommitteeReviewedBy?: string;
  timetableCommitteeReviewedDate?: string;
  timetableCommitteeComments?: string;
  // Principal Review
  principalApproved?: boolean;
  principalReviewedBy?: string;
  principalReviewedDate?: string;
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

export interface StudentAchievement {
  id: string;
  studentId: string;
  studentName: string;
  firstName: string;
  lastName: string;
  category: 'Sports' | 'Cultural' | 'Academic' | 'Other';
  title: string;
  description: string;
  date: string;
  location: string;
  outcome: string;
  highlightPhotosLink: string;
  branch: string;
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
