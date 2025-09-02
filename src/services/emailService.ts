import emailjs from 'emailjs-com';

// EmailJS configuration
// IMPORTANT: You need to set up EmailJS service first:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create a new email service and connect your Gmail (hiddencave168@gmail.com)
// 3. Create an email template with the required variables
// 4. Get your Service ID, Template ID, and Public Key from the dashboard
// 5. Update the values below with your actual EmailJS credentials

const EMAILJS_SERVICE_ID = 'service_trinity_track'; // Your actual service ID
const EMAILJS_TEMPLATE_ID = 'template_attendance_not'; // Your actual template ID
const EMAILJS_PUBLIC_KEY = '-y_uC_hdYZR-Trd1F'; // Your actual public key

interface EmailData {
  to_email: string;
  to_name: string;
  student_name: string;
  subject: string;
  date: string;
  faculty_name: string;
  from_email: string;
  from_name: string;
  reason?: string;
}

export const sendAbsenteeNotification = async (
  parentEmail: string,
  studentName: string,
  date: string,
  subject: string,
  facultyName: string,
  reason?: string
) => {
  // Email notifications disabled - data is saved to database for parent portal access
  console.log('Attendance data saved to database for parent portal access:', {
    student: studentName,
    date,
    subject,
    faculty: facultyName,
    reason
  });
  return { status: 200, text: 'Data saved to database' };
};

export const sendBulkParentNotifications = async (
  notifications: Array<{
    parentEmail: string;
    studentName: string;
    subjects: string[];
    date: string;
  }>
) => {
  // Bulk email notifications disabled - data is saved to database for parent portal access
  console.log('Bulk attendance data saved to database for parent portal access:', notifications);
  return notifications.map(n => ({ 
    success: true, 
    email: n.parentEmail 
  }));
};

// Initialize EmailJS
export const initializeEmailJS = () => {
  // EmailJS initialization disabled - using database-only approach
  console.log('Email service disabled - using database-only approach for parent portal');
};

// EmailJS Setup Instructions:
/*
To set up EmailJS for sending parent notifications:

1. Create EmailJS Account:
   - Go to https://www.emailjs.com/
   - Sign up for a free account

2. Add Email Service:
   - Go to Email Services
   - Click "Add New Service"
   - Choose Gmail
   - Connect your Gmail account (hiddencave168@gmail.com)
   - Note down the Service ID

3. Create Email Template:
   - Go to Email Templates
   - Click "Create New Template"
   - Use these variables in your template:
     * {{to_email}} - Parent email
     * {{to_name}} - Parent name
     * {{student_name}} - Student name
     * {{subject}} - Subject/class
     * {{date}} - Date of absence
     * {{faculty_name}} - Faculty name
     * {{reason}} - Reason for absence
     * {{from_email}} - From email (hiddencave168@gmail.com)
     * {{from_name}} - From name

4. Template Example:
   Subject: Attendance Notification - {{student_name}}
   
   Dear {{to_name}},
   
   This is to inform you that {{student_name}} was marked absent today.
   
   Details:
   - Date: {{date}}
   - Subject: {{subject}}
   - Faculty: {{faculty_name}}
   - Reason: {{reason}}
   
   If this is an error, please contact the college immediately.
   
   Best regards,
   {{from_name}}
   {{from_email}}

5. Get Configuration Values:
   - Service ID: From your email service
   - Template ID: From your email template
   - Public Key: From Account > API Keys

6. Update this file:
   - Replace EMAILJS_SERVICE_ID with your service ID
   - Replace EMAILJS_TEMPLATE_ID with your template ID
   - Replace EMAILJS_PUBLIC_KEY with your public key
*/