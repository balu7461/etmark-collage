export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hod' | 'faculty';
  department?: string;
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
  department: string;
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
}

export interface LeaveApplication {
  id: string;
  facultyId: string;
  facultyName: string;
  startDate: string;
  endDate: string;
  leaveType: 'casual' | 'medical' | 'personal' | 'duty';
  subject: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  comments?: string;
  department?: string;
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
  room?: string;
  semester: string;
  academicYear: string;
}

export interface Timetable {
  id: string;
  class: string;
  semester: string;
  academicYear: string;
  timeSlots: TimeSlot[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
}