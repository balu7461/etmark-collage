// Centralized constants for classes, years, and subjects
// This ensures consistency across the entire application

export const ALL_CLASSES = [
  'B.com', 
  'BBA', 
  'BCA', 
  'PCMB', 
  'PCMC',
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

export const subjectsByClassYearAndSemester = {
  'B.com': {
    '1st Year': {
      'Odd': [
        'Fundamentals of Financial Accounting',
        'Business Mathematics',
        'Banking Law and Practice',
        'Hindi',
        'Kannada',
        'English',
        'Constitutional Values with Reference to India'
      ],
      'Even': [
        'English',
        'Kannada',
        'Hindi',
        'Company Law and Practice',
        'Advanced Financial Accounting',
        'Fundamentals of Cost Accounting',
        'Environmental Studies'
      ]
    },
    '2nd Year': {
      'Odd': [
        'Fundamentals of Corporate Accounting',
        'Income Tax Law and Practice - I',
        'Advanced Cost Accounting',
        'Hindi',
        'Kannada',
        'English',
        'Financial Institutions and Markets',
        'Logistics and Supply Chain Management'
      ],
      'Even': [
        'English',
        'Kannada',
        'Hindi',
        'Advanced Corporate Accounting',
        'Income Tax Law & Practice – II',
        'Business Statistics',
        'International Business',
        'Entrepreneurship Development'
      ]
    },
    '3rd Year': {
      'Odd': [
        'Financial Management',
        'Income Tax Law and Practice-I',
        'Principles and Practice of Auditing',
        'Financial Institutions and Markets',
        'Retail Management',
        'Digital Marketing',
        'Employability Skills'
      ],
      'Even': [
        'E-Commerce',
        'Investment Management',
        'Advanced Financial Management',
        'Management Accounting',
        'Customer Relationship Management',
        'Income Tax Law and Practice – II',
        'Internship'
      ]
    }
  },
  'BBA': {
    '1st Year': {
      'Odd': [
        'Principles and Practices of Management',
        'Fundamentals of Business Accounting',
        'Business Economics',
        'Business Communication',
        'Hindi',
        'Kannada',
        'English',
        'Constitutional Values with Reference to India'
      ],
      'Even': [
        'Financial Accounting and Reporting',
        'Marketing Management',
        'Organizational Behaviour',
        'Business Statistics',
        'English',
        'Kannada',
        'Hindi',
        'French – II',
        'Environmental Studies'
      ]
    },
    '2nd Year': {
      'Odd': [
        'Cost Accounting',
        'Business Statistics II',
        'Business Environment',
        'French - III',
        'Hindi',
        'Kannada',
        'English',
        'Entrepreneurship and Startup Ecosystem',
        'Digital Marketing'
      ],
      'Even': [
        'English',
        'Kannada',
        'Hindi',
        'French',
        'Financial Management',
        'Human Resource Management',
        'Management Accounting',
        'Logistics and Supply Chain Management',
        'Information Technology for Business'
      ]
    },
    '3rd Year': {
      'Odd': [
        'Production and Operations Management',
        'Income Tax-I',
        'Banking Law and Practice',
        'Advanced Corporate Financial Management',
        'Fundamentals of Retail Management',
        'Digital Marketing',
        'Employability Skills'
      ],
      'Even': [
        'Income Tax – II',
        'Security Analysis and Portfolio Management',
        'Business Law',
        'International Business',
        'Retail Operations Management',
        'Goods and Services Tax (GST)',
        'Internship'
      ]
    }
  },
  'BCA': {
    '1st Year': {
      'Odd': [
        'Digital Computer Organization',
        'Problem Solving Using C++',
        'Mathematical and Statistical Computing',
        'Office Automation and HTML',
        'C++ Programming',
        'Mathematical and Statistical Computing Using R',
        'Hindi',
        'Kannada',
        'English',
        'Environmental Studies'
      ],
      'Even': [
        'English',
        'Kannada',
        'Hindi',
        'Data Structures',
        'Data Structures Using C++',
        'Programming with Java',
        'Object Oriented Programming with Java',
        'Shell Programming',
        'Operating Systems',
        'Constitutional Values with Reference to India'
      ]
    },
    '2nd Year': {
      'Odd': [
        'C.NET Programming',
        'Data Base Management System',
        'Web Technologies',
        'C.NET Programming Lab',
        'Data Base Management System Lab',
        'Web Technologies Lab',
        'Hindi',
        'Kannada',
        'English',
        'Cloud Computing',
        'Cyber Security'
      ],
      'Even': [
        'English',
        'Kannada',
        'Hindi',
        'Computer Networks',
        'Networking Lab',
        'Python Programming',
        'Python Programming Lab',
        'PHP & MySQL',
        'PHP & MySQL Lab',
        'Fundamentals of Data Science',
        'Digital Marketing'
      ]
    },
    '3rd Year': {
      'Odd': [
        'Design and Analysis of Algorithms',
        'Design and Analysis of Algorithms Lab',
        'Statistical Computing and R Programming',
        'R Programming Lab',
        'Software Engineering',
        'Cloud Computing',
        'Digital Marketing',
        'Employability Skills'
      ],
      'Even': [
        'Artificial Intelligence and Applications',
        'Artificial Intelligence and Applications Lab',
        'PHP & MySQL',
        'PHP & MySQL Lab',
        'Web Content Management System',
        'Fundamentals of Data Science',
        'Project Work',
        'Internship'
      ]
    }
  },
  'PCMB': {
    '1st Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology']
    },
    '2nd Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology']
    }
  },
  'PCMC': {
    '1st Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science']
    },
    '2nd Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science']
    }
  },
  'EBAC': {
    '1st Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Computer Science'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Computer Science']
    },
    '2nd Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Computer Science'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Computer Science']
    }
  },
  'EBAS': {
    '1st Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Statistics'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Statistics']
    },
    '2nd Year': {
      'Odd': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Statistics'],
      'Even': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Statistics']
    }
  }
};

// Backward compatibility - keep old structure but mark as deprecated
export const subjectsByClassAndYear = {
  'B.com': {
    '1st Year': [
      'Fundamentals of Financial Accounting',
      'Business Mathematics',
      'Banking Law and Practice',
      'Hindi',
      'Kannada',
      'English',
      'Constitutional Values with Reference to India'
    ],
    '2nd Year': [
      'Fundamentals of Corporate Accounting',
      'Income Tax Law and Practice - I',
      'Advanced Cost Accounting',
      'Hindi',
      'Kannada',
      'English',
      'Financial Institutions and Markets',
      'Logistics and Supply Chain Management'
    ],
    '3rd Year': [
      'Financial Management',
      'Income Tax Law and Practice-I',
      'Principles and Practice of Auditing',
      'Financial Institutions and Markets',
      'Retail Management',
      'Digital Marketing',
      'Employability Skills'
    ]
  },
  'BBA': {
    '1st Year': [
      'Principles and Practices of Management',
      'Fundamentals of Business Accounting',
      'Business Economics',
      'Business Communication',
      'Hindi',
      'Kannada',
      'English',
      'Constitutional Values with Reference to India'
    ],
    '2nd Year': [
      'Cost Accounting',
      'Business Statistics II',
      'Business Environment',
      'French - III',
      'Hindi',
      'Kannada',
      'English',
      'Entrepreneurship and Startup Ecosystem',
      'Digital Marketing'
    ],
    '3rd Year': [
      'Production and Operations Management',
      'Income Tax-I',
      'Banking Law and Practice',
      'Advanced Corporate Financial Management',
      'Fundamentals of Retail Management',
      'Digital Marketing',
      'Employability Skills'
    ]
  },
  'BCA': {
    '1st Year': [
      'Digital Computer Organization',
      'Problem Solving Using C++',
      'Mathematical and Statistical Computing',
      'Office Automation and HTML',
      'C++ Programming',
      'Mathematical and Statistical Computing Using R',
      'Hindi',
      'Kannada',
      'English',
      'Environmental Studies'
    ],
    '2nd Year': [
      'C.NET Programming',
      'Data Base Management System',
      'Web Technologies',
      'C.NET Programming Lab',
      'Data Base Management System Lab',
      'Web Technologies Lab',
      'Hindi',
      'Kannada',
      'English',
      'Cloud Computing',
      'Cyber Security'
    ],
    '3rd Year': [
      'Design and Analysis of Algorithms',
      'Design and Analysis of Algorithms Lab',
      'Statistical Computing and R Programming',
      'R Programming Lab',
      'Software Engineering',
      'Cloud Computing',
      'Digital Marketing',
      'Employability Skills'
    ]
  },
  'PCMB': {
    '1st Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology'],
    '2nd Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Biology']
  },
  'PCMC': {
    '1st Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
    '2nd Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science']
  },
  'EBAC': {
    '1st Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Computer Science'],
    '2nd Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Computer Science']
  },
  'EBAS': {
    '1st Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Statistics'],
    '2nd Year': ['Kannada', 'Hindi', 'Sanskrit', 'English', 'Economics', 'Business Studies', 'Accountancy', 'Statistics']
  }
};

export const SEMESTERS = ['1', '2', '3', '4', '5', '6'];

export const SEMESTER_TYPES = ['Odd', 'Even'] as const;
export type SemesterType = typeof SEMESTER_TYPES[number];

// New helper function to get subjects for class, year, and semester
export const getSubjectsForClassYearAndSemester = (
  className: string,
  year: string,
  semester: SemesterType
): string[] => {
  const classData = subjectsByClassYearAndSemester[className as keyof typeof subjectsByClassYearAndSemester];
  if (!classData) return [];

  const yearData = (classData as any)[year];
  if (!yearData) return [];

  return yearData[semester] || [];
};

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

// Helper function to get subjects for a specific class and year (backward compatibility)
export const getSubjectsForClassAndYear = (className: string, year: string): string[] => {
  const classSubjects = subjectsByClassAndYear[className as keyof typeof subjectsByClassAndYear];
  if (!classSubjects) return [];

  return (classSubjects as any)[year] || [];
};

// Helper function to check if a class has predefined subjects
export const hasSubjectDefinitions = (className: string): boolean => {
  return className in subjectsByClassAndYear;
};

// Helper function to get all available subjects across all classes
export const getAllAvailableSubjects = (): string[] => {
  const allSubjects = new Set<string>();

  Object.values(subjectsByClassAndYear).forEach(classData => {
    Object.values(classData).forEach(yearSubjects => {
      yearSubjects.forEach(subject => allSubjects.add(subject));
    });
  });

  return Array.from(allSubjects).sort();
};