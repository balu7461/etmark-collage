// Centralized constants for classes, years, and subjects
// This ensures consistency across the entire application

export const ALL_CLASSES = [
  'B.com', 
  'BBA', 
  'BCA', 
  'PCMB', 
  'PCMC', 
  'PCMCS', 
  'COMMERCE', 
  'ARTS', 
  'EBAC', 
  'EBAS'
];

export const TIME_SLOTS = [
  { start: '09:30', end: '10:25', label: '09:30 - 10:25' },
  { start: '10:25', end: '11:20', label: '10:25 - 11:20' },
  { start: '11:35', end: '12:30', label: '11:35 - 12:30' },
  { start: '12:30', end: '13:15', label: '12:30 - 1:15' },
  { start: '13:15', end: '14:10', label: '1:15 - 2:10' },
  { start: '14:10', end: '15:05', label: '2:10 - 3:05' },
  { start: '15:05', end: '16:00', label: '3:05 - 4:00' }
];

export const getYearsForClass = (className: string): string[] => {
  const undergradClasses = ['B.com', 'BBA', 'BCA'];
  const plus2Classes = ['PCMB', 'PCMC', 'PCMCS', 'COMMERCE', 'ARTS', 'EBAC', 'EBAS'];
  
  if (undergradClasses.includes(className)) {
    return ['1st Year', '2nd Year', '3rd Year'];
  } else if (plus2Classes.includes(className)) {
    return ['1st Year', '2nd Year'];
  }
  return [];
};

export const subjectsByClassAndYear = {
  'B.com': {
    '1st Year': [
      'Fundamentals of Financial Accounting',
      'Business Communication',
      'Business Mathematics',
      'Banking Law and Practice',
      'Kannada/Hindi',
      'Constitutional Values with Reference to India',
      'English'
    ],
    '2nd Year': [
      'Fundamentals of Corporate Accounting',
      'Logistics and Supply Chain Management',
      'Advanced Cost Accounting',
      'Income Tax Law & Practice',
      'English',
      'Financial Institutions and Markets',
      'Kannada/Hindi'
    ],
    '3rd Year': [
      'Financial Management',
      'Financial Institutions and Markets',
      'Employability Skills',
      'Income Tax Law and Practice – I',
      'Principles and Practice of Auditing'
    ]
  },
  'BBA': {
    '1st Year': [
      'Fundamentals of Business Accounting',
      'Business Economics',
      'Principles and Practices of Management',
      'Kannada/Hindi/French',
      'Constitutional Values with Reference to India',
      'English'
    ],
    '2nd Year': [
      'Cost Accounting',
      'Entrepreneurship and Startup Ecosystem',
      'Business Environment',
      'Business Statistics II',
      'English',
      'Financial Institutions and Markets',
      'Kannada/Hindi'
    ],
    '3rd Year': [
      'Retail Management',
      'Advanced Corporate Financial Management',
      'Digital Marketing',
      'Income Tax – I',
      'Banking Law and Practice',
      'Employability Skills'
    ]
  },
  'BCA': {
    '1st Year': [
      'Digital Computer Organization',
      'Mathematical and Statistical Computing',
      'Problem Solving Using C++',
      'Kannada/Hindi',
      'Environmental Studies',
      'English'
    ],
    '2nd Year': [
      'C#.Net Programming',
      'Cloud Computing',
      'Web Technologies',
      'Data Base Management System',
      'Cyber Security',
      'Kannada/Hindi',
      'English'
    ],
    '3rd Year': [
      'Design and Analysis of Algorithms',
      'Software Engineering',
      'Statistical Computing and R Programming',
      'Cloud Computing',
      'Employability Skills',
      'Digital Marketing'
    ]
  },
  'PCMB': {
    '1st Year': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    '2nd Year': ['Physics', 'Chemistry', 'Mathematics', 'Biology']
  },
  'PCMC': {
    '1st Year': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    '2nd Year': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science']
  },
  'PCMCS': {
    '1st Year': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Statistics'],
    '2nd Year': ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Statistics']
  },
  'COMMERCE': {
    '1st Year': ['Business Studies', 'Accountancy', 'Economics', 'English', 'Kannada/Hindi'],
    '2nd Year': ['Business Studies', 'Accountancy', 'Economics', 'English', 'Kannada/Hindi']
  },
  'ARTS': {
    '1st Year': ['History', 'Political Science', 'Economics', 'English', 'Kannada/Hindi'],
    '2nd Year': ['History', 'Political Science', 'Economics', 'English', 'Kannada/Hindi']
  },
  'EBAC': {
    '1st Year': ['Economics', 'Business Studies', 'Accountancy', 'Computer Science'],
    '2nd Year': ['Economics', 'Business Studies', 'Accountancy', 'Computer Science']
  },
  'EBAS': {
    '1st Year': ['Economics', 'Business Studies', 'Accountancy', 'Statistics'],
    '2nd Year': ['Economics', 'Business Studies', 'Accountancy', 'Statistics']
  }
};

export const SEMESTERS = ['1', '2', '3', '4', '5', '6'];

// Helper function to get all subjects for a class (across all years)
export const getAllSubjectsForClass = (className: string): string[] => {
  const classSubjects = subjectsByClassAndYear[className as keyof typeof subjectsByClassAndYear];
  if (!classSubjects) return [];
  
  const allSubjects = new Set<string>();
  Object.values(classSubjects).forEach(yearSubjects => {
    yearSubjects.forEach(subject => allSubjects.add(subject));
  });
  
  return Array.from(allSubjects).sort();
};

// Helper function to get subjects for a specific class and year
export const getSubjectsForClassAndYear = (className: string, year: string): string[] => {
  const classSubjects = subjectsByClassAndYear[className as keyof typeof subjectsByClassAndYear];
  if (!classSubjects) return [];
  
  return (classSubjects as any)[year] || [];
};