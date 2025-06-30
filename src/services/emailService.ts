import emailjs from 'emailjs-com';

// EmailJS configuration
// IMPORTANT: You need to set up EmailJS service first:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create a new email service and connect your Gmail (hiddencave168@gmail.com)
// 3. Create an email template with the required variables
// 4. Get your Service ID, Template ID, and Public Key from the dashboard
// 5. Update the values below with your actual EmailJS credentials

const EMAILJS_SERVICE_ID = 'service_college_connect'; // Replace with your actual service ID
const EMAILJS_TEMPLATE_ID = 'template_attendance_notification'; // Replace with your actual template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY_HERE'; // Replace with your actual public key

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
  // Check if EmailJS is properly configured
  if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY_HERE') {
    console.warn('EmailJS not configured. Please set up EmailJS credentials.');
    // For development, we'll just log the email instead of sending
    console.log('Email would be sent to:', {
      to: parentEmail,
      student: studentName,
      date,
      subject,
      faculty: facultyName,
      reason
    });
    return { status: 200, text: 'Email logged (EmailJS not configured)' };
  }

  const emailData: EmailData = {
    to_email: parentEmail,
    to_name: `Parent of ${studentName}`,
    student_name: studentName,
    subject: subject,
    date: date,
    faculty_name: facultyName,
    from_email: 'hiddencave168@gmail.com',
    from_name: 'CollegeConnect System',
    reason: reason || 'No reason provided'
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailData,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('Parent notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send parent notification:', error);
    throw error;
  }
};

export const sendBulkParentNotifications = async (
  notifications: Array<{
    parentEmail: string;
    studentName: string;
    subjects: string[];
    date: string;
  }>
) => {
  const results = [];
  
  for (const notification of notifications) {
    try {
      const subjectsList = notification.subjects.join(', ');
      await sendAbsenteeNotification(
        notification.parentEmail,
        notification.studentName,
        notification.date,
        subjectsList,
        'System Generated'
      );
      results.push({ success: true, email: notification.parentEmail });
    } catch (error) {
      results.push({ success: false, email: notification.parentEmail, error });
    }
  }
  
  return results;
};

// Initialize EmailJS
export const initializeEmailJS = () => {
  if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY_HERE') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized successfully');
  } else {
    console.warn('EmailJS not initialized - missing configuration');
  }
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