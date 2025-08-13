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

// Centralized function to get years for each class
export const getYearsForClass = (selectedClass: string): string[] => {
  if (['B.com', 'BBA', 'BCA'].includes(selectedClass)) {
    return ['1st Year', '2nd Year', '3rd Year'];
  } else if (['PCMB', 'PCMC', 'EBAC', 'EBAS'].includes(selectedClass)) {
    return ['1st Year', '2nd Year'];
  }
  return [];
};

// Centralized class list
export const classes = ['B.com', 'BBA', 'BCA', 'PCMB', 'PCMC', 'EBAC', 'EBAS'];

// Centralized subjects by class mapping
export const subjectsByClass = {
  'B.com': ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics', 'Computer Applications'],
  'BBA': ['Business Administration', 'Marketing', 'Finance', 'Human Resources', 'Operations Management', 'Business Ethics'],
  'BCA': ['Programming in C', 'Data Structures', 'Database Management', 'Web Development', 'Software Engineering', 'Computer Networks'],
  'PCMB': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  'PCMC': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
  'EBAC': ['Economics', 'Business Studies', 'Accountancy', 'Computer Science'],
  'EBAS': ['Economics', 'Business Studies', 'Accountancy', 'Statistics']
};

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