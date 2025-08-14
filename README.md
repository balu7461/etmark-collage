# Trinity Track - Complete Student & Faculty Management System

A comprehensive college management system built with React, TypeScript, and Firebase, designed specifically for Trinity College.

## 🎯 Overview

Trinity Track is a modern, full-featured management system that streamlines college operations including student management, faculty coordination, attendance tracking, leave management, achievement recognition, and comprehensive reporting.

## ✨ Key Features

### 👥 **User Management System**
- **Multi-Role Support**: Admin, Faculty, Timetable Committee, Examination Committee, Achievements Committee
- **Approval Workflow**: All new registrations require admin approval
- **Role-Based Access Control**: Different permissions and features for each role
- **User Profile Management**: Complete user information and contact details

### 🎓 **Student Management**
- **Student Registration**: Individual and bulk student registration
- **Excel Import/Export**: Bulk upload students via Excel files
- **Approval System**: Admin approval required for all new students
- **Parent Contact Management**: Store and manage parent email and phone information
- **Class & Year Organization**: Organized by classes (B.com, BBA, BCA, PCMB, PCMC, EBAC, EBAS)

### 📅 **Attendance Management**
- **Digital Attendance**: Mark attendance for entire classes
- **Real-time Tracking**: Live attendance statistics and reporting
- **Parent Notifications**: Automatic email notifications to parents for absent students
- **Attendance Reports**: Comprehensive attendance analytics and export
- **Student Attendance Search**: Search individual student attendance records by Sats No.

### 🏖️ **Leave Management System**
- **Multi-Level Approval**: Committee → Principal approval workflow
- **Leave Types**: On Duty (OD) and Casual leave categories
- **Status Tracking**: Real-time leave application status updates
- **Comment System**: Review comments at each approval level
- **Leave History**: Complete leave application history for faculty

### 🏆 **Achievement Tracking**
- **Faculty Achievements**: Certifications, publications, awards, training, workshops
- **Student Achievements**: Sports, Cultural, Academic, and Other categories
- **Top Performer Recognition**: Mark and highlight top performing faculty
- **Achievement Analytics**: Comprehensive achievement statistics and trends
- **Photo Integration**: Google Drive integration for achievement photos

### 📊 **Timetable Management**
- **Class Scheduling**: Create and manage class timetables
- **Faculty Assignment**: Assign faculty to subjects and time slots
- **Room Management**: Track and assign classroom locations
- **Semester Organization**: Organize by academic year and semester
- **Export Functionality**: Export timetables to Excel format

### 📈 **Reports & Analytics**
- **Attendance Reports**: Detailed attendance analytics with date range filtering
- **Leave Reports**: Faculty leave application summaries
- **Achievement Reports**: Faculty and student achievement analytics
- **Student Reports**: Complete student database exports
- **Excel Export**: All reports exportable to Excel format

### 📧 **Email Integration**
- **Automated Notifications**: Automatic parent notifications for student absences
- **EmailJS Integration**: Seamless email service integration
- **Custom Templates**: Configurable email templates
- **Bulk Notifications**: Send notifications to multiple parents simultaneously

## 🏗️ Technical Architecture

### **Frontend Technologies**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing and navigation
- **Lucide React**: Beautiful, customizable icons

### **Backend & Database**
- **Firebase Authentication**: Secure user authentication and authorization
- **Firestore Database**: NoSQL cloud database with real-time updates
- **Firebase Storage**: Cloud storage for files and documents
- **Security Rules**: Comprehensive Firestore security rules

### **Additional Libraries**
- **React Hot Toast**: Beautiful toast notifications
- **Date-fns**: Modern date utility library
- **XLSX**: Excel file processing and generation
- **EmailJS**: Client-side email service integration

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase account
- EmailJS account (for email notifications)

### **1. Clone Repository**
```bash
git clone <repository-url>
cd trinity-track
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Firebase Configuration**
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Copy your Firebase configuration
4. Update `src/lib/firebase.ts` with your configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### **4. Firestore Security Rules**
Set up the following security rules in your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Students collection
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
    }
    
    // Leave applications
    match /leaveApplications/{leaveId} {
      allow read, write: if request.auth != null;
    }
    
    // Achievements
    match /achievements/{achievementId} {
      allow read, write: if request.auth != null;
    }
    
    // Student achievements
    match /studentAchievements/{achievementId} {
      allow read, write: if request.auth != null;
    }
    
    // Time slots
    match /timeSlots/{slotId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📧 EmailJS Setup Guide

### **Step 1: Create EmailJS Account**
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### **Step 2: Add Email Service**
1. Go to **Email Services** in your EmailJS dashboard
2. Click **Add New Service**
3. Choose **Gmail** as your email service
4. Connect your Gmail account (use: hiddencave168@gmail.com)
5. Note down your **Service ID** (e.g., `service_trinity_track`)

### **Step 3: Create Email Template**
1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use the following template configuration:

#### **Template Settings:**
- **Template Name**: `Attendance Notification`
- **Template ID**: `template_attendance_notification`

#### **Email Template Content:**
```
Subject: Attendance Notification - {{student_name}}

Dear {{to_name}},

This is to inform you that {{student_name}} was marked absent today.

Details:
- Date: {{date}}
- Subject: {{subject}}
- Faculty: {{faculty_name}}
- Reason: {{reason}}

If this is an error, please contact Trinity College immediately.

Best regards,
{{from_name}}
Trinity Track System
{{from_email}}
```

#### **Template Variables:**
Make sure to include these variables in your template:
- `{{to_email}}` - Parent email address
- `{{to_name}}` - Parent name
- `{{student_name}}` - Student's full name
- `{{subject}}` - Subject/class information
- `{{date}}` - Date of absence
- `{{faculty_name}}` - Faculty member's name
- `{{from_email}}` - Sender email (hiddencave168@gmail.com)
- `{{from_name}}` - Sender name (Trinity Track System)
- `{{reason}}` - Reason for absence (optional)

### **Step 4: Get API Keys**
1. Go to **Account** → **API Keys**
2. Copy your **Public Key** (e.g., `user_abc123def456`)

### **Step 5: Update Configuration**
Update `src/services/emailService.ts` with your EmailJS credentials:

```javascript
const EMAILJS_SERVICE_ID = 'service_trinity_track'; // Your Service ID
const EMAILJS_TEMPLATE_ID = 'template_attendance_notification'; // Your Template ID
const EMAILJS_PUBLIC_KEY = 'user_abc123def456'; // Your Public Key
```

### **Step 6: Test Email Service**
1. Start your application: `npm run dev`
2. Login as faculty and mark a student absent
3. Check if parent receives the email notification
4. Verify email content and formatting

## 👤 Default Login Credentials

### **Main Administrator**
- **Email**: hiddencave168@gmail.com
- **Password**: Test@123
- **Role**: Admin (Full system access)

### **Test Faculty** (if created)
- **Email**: faculty@college.edu
- **Password**: faculty123
- **Role**: Faculty

## 🎭 User Roles & Permissions

### **🔧 Administrator**
- Complete system access and control
- User management and approval
- Student management and approval
- All reports and analytics
- System settings and configuration

### **👨‍🏫 Faculty**
- Mark student attendance
- View personal timetable
- Apply for leave
- Manage personal achievements
- View assigned classes

### **📅 Timetable Committee**
- Review and approve leave applications
- Manage timetables and schedules
- Personal leave and achievement management
- Committee-level permissions

### **📝 Examination Committee**
- Review and approve leave applications
- Examination scheduling
- Personal leave and achievement management
- Committee-level permissions

### **🏆 Achievements Committee**
- Manage student achievements
- Achievement analytics and reporting
- Personal leave and achievement management
- Student recognition programs

## 📱 Mobile Responsiveness

Trinity Track is fully responsive and optimized for:
- **Mobile Devices**: iPhone, Android phones
- **Tablets**: iPad, Android tablets
- **Desktop**: All screen sizes and resolutions
- **Touch-Friendly**: Optimized touch targets and interactions

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **Role-Based Access**: Different permissions for each user role
- **Approval Workflows**: Admin approval required for new users
- **Data Validation**: Client and server-side data validation
- **Secure API**: Protected API endpoints and database rules

## 🚀 Deployment

### **Netlify Deployment**
1. Build the project: `npm run build`
2. Deploy to Netlify: Connect your repository
3. Set environment variables if needed
4. Deploy automatically on code changes

### **Environment Variables**
No environment variables needed - Firebase configuration is included in the build.

## 📊 Features by Role

| Feature | Admin | Faculty | Timetable Committee | Examination Committee | Achievements Committee |
|---------|-------|---------|-------------------|---------------------|----------------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Student Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mark Attendance | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Attendance | ✅ | ❌ | ❌ | ❌ | ❌ |
| Timetable Management | ✅ | View Only | ✅ | View Only | ❌ |
| Leave Management | ✅ | Apply Only | Review & Apply | Review & Apply | Apply Only |
| Faculty Achievements | ✅ | Personal Only | Personal Only | Personal Only | Personal Only |
| Student Achievements | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reports & Analytics | ✅ | ❌ | ❌ | ❌ | Limited |

## 🛠️ Development

### **Run Development Server**
```bash
npm run dev
```

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

## 📞 Support & Contact

For technical support, feature requests, or questions:
- **Email**: hiddencave168@gmail.com
- **System**: Trinity Track Management System
- **Institution**: Trinity College

## 🏢 Developed By

**Trinity Track** is developed by:
- **[Doutly](https://doutly.com)** - Technical Development
- **[Sugarsaltmedia](https://sugarsaltmedia.com)** - Design & Strategy

---

**Trinity Track** - Empowering Educational Excellence Through Technology 🎓