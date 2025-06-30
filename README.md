# CollegeConnect - Student & Faculty Management System

A comprehensive college management system built with React, TypeScript, and Firebase.

## Features

- **User Management**: Admin, HOD, and Faculty roles with approval system
- **Student Management**: Student registration, approval, and bulk upload via Excel
- **Attendance Tracking**: Mark attendance with automatic parent notifications
- **Leave Management**: Faculty leave applications with approval workflow
- **Achievement Tracking**: Faculty achievement management with top performer recognition
- **Timetable Management**: Class scheduling and timetable generation
- **Reports & Analytics**: Export data to Excel with comprehensive reporting
- **Email Notifications**: Automatic parent notifications for student absences

## Email Integration Setup

This application uses EmailJS for sending email notifications. To set up email notifications:

### 1. Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/) and create a free account
2. Create a new email service and connect your Gmail account (hiddencave168@gmail.com)

### 2. Create Email Template
Create a template with the following variables:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Recipient name
- `{{student_name}}` - Student name
- `{{subject}}` - Subject/class
- `{{date}}` - Date of absence
- `{{faculty_name}}` - Faculty name
- `{{from_email}}` - Sender email (hiddencave168@gmail.com)
- `{{from_name}}` - Sender name

### 3. Update Configuration
Update the following values in `src/services/emailService.ts`:
- `EMAILJS_SERVICE_ID`: Your EmailJS service ID
- `EMAILJS_TEMPLATE_ID`: Your EmailJS template ID
- `EMAILJS_PUBLIC_KEY`: Your EmailJS public key

### 4. Email Template Example
```
Subject: Attendance Notification - {{student_name}}

Dear {{to_name}},

This is to inform you that {{student_name}} was marked absent today.

Details:
- Date: {{date}}
- Subject: {{subject}}
- Faculty: {{faculty_name}}

If this is an error, please contact the college immediately.

Best regards,
{{from_name}}
{{from_email}}
```

## Default Login Credentials

### Main Admin
- Email: hiddencave168@gmail.com
- Password: Test@123

### Test Faculty (if seeded)
- Email: faculty@college.edu
- Password: faculty123

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase configuration in `src/lib/firebase.ts`
4. Set up EmailJS configuration in `src/services/emailService.ts`
5. Run the development server: `npm run dev`

## Deployment

The application is configured for deployment on Netlify. Simply connect your repository to Netlify for automatic deployments.

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Email Service**: EmailJS
- **Icons**: Lucide React
- **File Processing**: XLSX for Excel import/export
- **Notifications**: React Hot Toast

## Key Features

### Attendance Management
- Mark attendance for entire classes
- Automatic parent email notifications for absent students
- Export attendance reports to Excel
- Filter and search attendance records

### User Approval System
- All new faculty and HOD registrations require admin approval
- Clear approval workflow with notifications
- Role-based access control

### Student Management
- Bulk student upload via Excel
- Individual student management
- Parent contact information management
- Class and department organization

### Leave Management
- Faculty leave application system
- HOD and admin approval workflow
- Leave status tracking and notifications

### Achievement Tracking
- Faculty achievement submission
- Top performer recognition
- Achievement categorization and filtering

### Timetable Management
- Create and manage class schedules
- Faculty-wise timetable views
- Export timetables to Excel

## Support

For support and questions, contact the development team.