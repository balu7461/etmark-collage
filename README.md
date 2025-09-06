# Trinity Track - Complete Student & Faculty Management System

A comprehensive college management system built with React, TypeScript, and Firebase, designed specifically for Trinity College.

## 🎯 Overview

Trinity Track is a modern, full-featured management system that streamlines college operations including student management, faculty coordination, enhanced 4-status attendance tracking, leave management, achievement recognition, and comprehensive reporting.

## ✨ Key Features

### 📊 **Enhanced Attendance System**
- **4-Status Attendance Tracking**: 
  - **Present**: Student attended regular class
  - **Absent**: Student was absent from class
  - **Sports**: Student participating in sports activities (counts as excused)
  - **EC (Extra-Curricular)**: Student in extra-curricular activities (counts as excused)
- **Smart Percentage Calculation**: Sports and EC activities count positively towards attendance
- **Mobile-Responsive Interface**: Optimized for marking attendance on mobile devices
- **Activity Reason Tracking**: Optional reason/activity description for Sports and EC
- **Parent Portal Integration**: Parents can see all 4 attendance types in their dashboard

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
- **Enhanced Digital Attendance**: Mark attendance for entire classes with 4 status options
- **Multiple Attendance Types**: Present, Absent, Sports Activity, Extra-Curricular (EC)
- **Smart Attendance Calculation**: Sports and EC activities count as excused attendance
- **Real-time Tracking**: Live attendance statistics and reporting
- **Parent Notifications**: Automatic email notifications to parents for absent students
- **Attendance Reports**: Comprehensive attendance analytics and export
- **Student Attendance Search**: Search individual student attendance records by Sats No.
- **Activity Tracking**: Separate tracking for sports and extra-curricular activities
- **Mobile-Optimized Interface**: Touch-friendly attendance marking on all devices

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
- **Activity Reports**: Separate reporting for sports and extra-curricular participation
- **Leave Reports**: Faculty leave application summaries
- **Achievement Reports**: Faculty and student achievement analytics
- **Student Reports**: Complete student database exports
- **Excel Export**: All reports exportable to Excel format
- **Enhanced Attendance Metrics**: Comprehensive tracking including excused activities

### 📧 **Email Integration**
- **Automated Notifications**: Automatic parent notifications for student absences
- **Activity Notifications**: Optional notifications for sports and EC activities
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
    
    // Attendance collection - supports 4 status types: present, absent, sports, ec
    match /attendance/{attendanceId} {
      allow read, write: if request.auth != null;
      // Validate attendance status values
      allow create, update: if request.auth != null && 
        resource.data.status in ['present', 'absent', 'sports', 'ec'];
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
| Mark Attendance (4-Status) | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Attendance | ✅ | ❌ | ❌ | ❌ | ❌ |
| Parent Attendance Portal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Timetable Management | ✅ | View Only | ✅ | View Only | ❌ |
| Leave Management | ✅ | Apply Only | Review & Apply | Review & Apply | Apply Only |
| Faculty Achievements | ✅ | Personal Only | Personal Only | Personal Only | Personal Only |
| Student Achievements | ❌ | ❌ | ❌ | ❌ | ✅ |
| Reports & Analytics | ✅ | ❌ | ❌ | ❌ | Limited |

### 📊 **Enhanced Attendance System**
- **4-Status Attendance Options**: Present, Absent, Sports Activity, Extra-Curricular (EC)
- **Smart Calculation**: Sports and EC activities count as excused attendance
- **Mobile-Optimized**: Touch-friendly interface for marking attendance on mobile devices
- **Parent Portal Integration**: Parents can view all attendance types including activities
- **Activity Tracking**: Optional descriptions for sports and EC activities
- **Enhanced Reports**: Excel exports include all 4 attendance status types

### 🎯 **Attendance Status Definitions**
- **Present**: Student attended regular class session
- **Absent**: Student was absent from class (counts negatively)
- **Sports**: Student participating in sports activities (counts as excused)
- **EC (Extra-Curricular)**: Student in extra-curricular activities (counts as excused)

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

---

## 📁 Detailed Project File Structure & Descriptions

This section provides comprehensive documentation of every file in the Trinity Track project, making it easier for hosting, maintenance, and development.

### 🏗️ **Root Configuration Files**

#### **package.json**
- **Purpose**: Node.js project configuration and dependency management
- **Contains**: Project metadata, scripts, dependencies, and dev dependencies
- **Key Dependencies**: React, Firebase, TypeScript, Tailwind CSS, Lucide React
- **Scripts**: `dev` (development server), `build` (production build), `preview` (preview build)
- **Hosting Note**: Essential for deployment - contains all package information

#### **vite.config.ts**
- **Purpose**: Vite bundler configuration
- **Contains**: React plugin setup, build optimizations
- **Hosting Note**: Required for proper build process during deployment

#### **tsconfig.json**
- **Purpose**: TypeScript configuration root file
- **Contains**: References to app and node TypeScript configurations
- **Dependencies**: Links to `tsconfig.app.json` and `tsconfig.node.json`

#### **tsconfig.app.json**
- **Purpose**: TypeScript configuration for application code
- **Contains**: Compiler options, module resolution, JSX settings
- **Target**: ES2020 with React JSX support

#### **tsconfig.node.json**
- **Purpose**: TypeScript configuration for Node.js tools (Vite)
- **Contains**: Node-specific compiler options
- **Target**: ES2022 for build tools

#### **tailwind.config.js**
- **Purpose**: Tailwind CSS configuration
- **Contains**: Content paths, theme extensions, plugins
- **Hosting Note**: Required for CSS generation during build

#### **postcss.config.js**
- **Purpose**: PostCSS configuration for CSS processing
- **Contains**: Tailwind CSS and Autoprefixer plugins
- **Hosting Note**: Essential for CSS build process

#### **eslint.config.js**
- **Purpose**: ESLint configuration for code quality
- **Contains**: TypeScript, React, and code quality rules
- **Development**: Ensures code consistency and quality

### 🌐 **HTML & Entry Files**

#### **index.html**
- **Purpose**: Main HTML template and application entry point
- **Contains**: Meta tags, favicon reference, root div, script imports
- **Key Elements**: Trinity logo favicon, responsive viewport, React root mounting point
- **Hosting Note**: This is the main file served to users

#### **src/main.tsx**
- **Purpose**: React application bootstrap and initialization
- **Contains**: React root creation, App component mounting, StrictMode wrapper
- **Hosting Note**: Entry point for the React application

#### **src/vite-env.d.ts**
- **Purpose**: Vite environment type definitions
- **Contains**: TypeScript declarations for Vite-specific features

### 🎨 **Styling Files**

#### **src/index.css**
- **Purpose**: Global CSS styles and Tailwind imports
- **Contains**: 
  - Tailwind CSS imports (@tailwind base, components, utilities)
  - Mobile-responsive utilities and breakpoints
  - Custom scrollbar styling
  - Print media styles
  - Accessibility improvements (focus states, skip links)
  - Loading animations and transitions
  - Trinity Track logo ink effect animations
- **Key Features**: 
  - Mobile-first responsive design
  - Touch-friendly interface optimizations
  - High contrast and reduced motion support
  - Custom scrollbar for better UX
- **Hosting Note**: Critical for application appearance and responsiveness

### 🔧 **Core Application Files**

#### **src/App.tsx**
- **Purpose**: Main application component with routing and layout
- **Contains**: 
  - React Router setup with all application routes
  - Authentication context integration
  - Role-based route protection
  - Sidebar and header layout management
  - Toast notification configuration
  - Splash screen integration
- **Key Features**:
  - Multi-role routing (Admin, Faculty, Committee members)
  - Mobile-responsive sidebar with backdrop
  - Protected route authentication
  - Public routes (Landing page, Parent portal)
- **Hosting Note**: Core application logic - essential for functionality

#### **src/types/index.ts**
- **Purpose**: TypeScript type definitions for the entire application
- **Contains**: 
  - User interface with role definitions
  - Student interface with approval workflow
  - AttendanceRecord with 4-status system (present, absent, sports, ec)
  - LeaveApplication with multi-stage approval workflow
  - Achievement and StudentAchievement interfaces
  - TimeSlot and Timetable interfaces
- **Key Types**:
  - Role-based user system
  - Enhanced attendance tracking
  - Multi-level leave approval
  - Achievement management
- **Hosting Note**: Ensures type safety across the application

### 🔐 **Authentication & Context**

#### **src/contexts/AuthContext.tsx**
- **Purpose**: Authentication state management and user context
- **Contains**: 
  - Firebase authentication integration
  - User login/logout functionality
  - Role-based access control
  - Main admin account handling (hiddencave168@gmail.com)
  - User approval status checking
- **Key Features**:
  - Persistent login state
  - Role-based welcome messages
  - Approval workflow integration
  - Local storage session management
- **Hosting Note**: Critical for user authentication and security

#### **src/lib/firebase.ts**
- **Purpose**: Firebase configuration and service initialization
- **Contains**: 
  - Firebase project configuration
  - Authentication, Firestore, Storage, Analytics initialization
  - Service exports for use throughout the application
- **Configuration**: 
  - Project ID: etmark-collage
  - Auth domain: etmark-collage.firebaseapp.com
  - Storage bucket: etmark-collage.firebasestorage.app
- **Hosting Note**: Essential for database connectivity - contains live credentials

### 📱 **Page Components**

#### **src/pages/Dashboard.tsx**
- **Purpose**: Main dashboard with role-specific statistics and overview
- **Contains**: 
  - Real-time statistics fetching
  - Role-based dashboard content
  - Leave status calculations
  - System status overview
  - Danger zone for admin operations
- **Key Features**:
  - Multi-role dashboard views
  - Live data statistics
  - Leave balance tracking
  - Student deletion functionality (admin only)
- **Hosting Note**: Primary landing page after login

#### **src/pages/LandingPage.tsx**
- **Purpose**: Public welcome page with portal selection
- **Contains**: 
  - Management portal access
  - Parent portal access
  - Animated background elements
  - Company branding (Doutly & Sugarsaltmedia)
- **Key Features**:
  - Responsive design with animations
  - Dual portal access
  - Trinity Track branding
- **Hosting Note**: First page users see - important for user experience

#### **src/pages/MarkAttendance.tsx**
- **Purpose**: Faculty interface for marking student attendance
- **Contains**: AttendanceForm component integration
- **Key Features**: 4-status attendance system (Present, Absent, Sports, EC)
- **Hosting Note**: Core functionality for daily attendance tracking

#### **src/pages/Students.tsx**
- **Purpose**: Complete student management interface
- **Contains**: 
  - Student CRUD operations
  - Excel import/export functionality
  - Bulk upload with validation
  - Search and filtering
  - Data normalization
- **Key Features**:
  - Individual and bulk student management
  - Excel template download
  - Data validation and normalization
  - Parent contact management
- **Hosting Note**: Critical for student data management

#### **src/pages/Attendance.tsx**
- **Purpose**: Admin view of all attendance records
- **Contains**: 
  - Attendance record viewing and filtering
  - Excel export functionality
  - Class-wise statistics
  - Date range filtering
- **Key Features**:
  - Comprehensive attendance overview
  - Multi-class support
  - Export capabilities
- **Hosting Note**: Important for attendance monitoring and reporting

#### **src/pages/StudentOverallAttendance.tsx**
- **Purpose**: Individual student attendance lookup by Sats No.
- **Contains**: 
  - Numeric Sats No. search functionality
  - Monthly attendance breakdown
  - Attendance statistics calculation
  - Student information display
- **Key Features**:
  - Comprehensive student search
  - Monthly attendance analysis
  - Visual attendance statistics
- **Hosting Note**: Essential for individual student tracking

#### **src/pages/ParentAttendanceCheck.tsx**
- **Purpose**: Public parent portal for checking child's attendance
- **Contains**: 
  - Public access (no login required)
  - Numeric Sats No. search
  - Daily attendance viewing
  - Student information display
- **Key Features**:
  - Parent-friendly interface
  - Date-specific attendance checking
  - Contact information display
- **Hosting Note**: Public-facing feature for parent engagement

#### **src/pages/Timetable.tsx**
- **Purpose**: Admin timetable management interface
- **Contains**: 
  - Time slot creation and management
  - Timetable grid display
  - Faculty assignment
  - Excel export functionality
- **Key Features**:
  - Visual timetable grid
  - Subject and faculty management
  - Room assignment
- **Hosting Note**: Important for academic scheduling

#### **src/pages/MyTimetable.tsx**
- **Purpose**: Faculty personal timetable view
- **Contains**: 
  - Personal class schedule
  - Upcoming classes display
  - Timetable statistics
  - Export functionality
- **Key Features**:
  - Faculty-specific view
  - Today's schedule highlighting
  - Personal statistics
- **Hosting Note**: Faculty daily planning tool

#### **src/pages/LeaveManagement.tsx**
- **Purpose**: Multi-stage leave approval system
- **Contains**: 
  - Leave application review
  - Multi-stage approval workflow
  - Comment system
  - Status tracking
- **Key Features**:
  - Three-stage approval process
  - Role-based review access
  - Comprehensive leave tracking
- **Hosting Note**: Critical for faculty leave management

#### **src/pages/MyLeaves.tsx**
- **Purpose**: Faculty personal leave management
- **Contains**: 
  - Leave application form
  - Personal leave history
  - Leave balance tracking
  - LOP calculation
- **Key Features**:
  - Personal leave dashboard
  - Leave quota management
  - Application status tracking
- **Hosting Note**: Faculty self-service leave management

#### **src/pages/Achievements.tsx**
- **Purpose**: Admin view of all faculty achievements
- **Contains**: 
  - Achievement review and management
  - Top performer marking
  - Achievement statistics
  - Filtering and categorization
- **Key Features**:
  - Faculty achievement oversight
  - Performance recognition
  - Achievement analytics
- **Hosting Note**: Faculty performance tracking

#### **src/pages/MyAchievements.tsx**
- **Purpose**: Faculty personal achievement management
- **Contains**: 
  - Achievement submission form
  - Personal achievement history
  - Certificate link management
- **Key Features**:
  - Self-service achievement entry
  - Professional development tracking
  - Document management
- **Hosting Note**: Faculty professional development tool

#### **src/pages/StudentAchievements.tsx**
- **Purpose**: Student achievement management for Achievements Committee
- **Contains**: 
  - Student achievement CRUD operations
  - Category-based filtering
  - Photo link management
  - Achievement statistics
- **Key Features**:
  - Student recognition management
  - Multi-category achievements
  - Photo documentation
- **Hosting Note**: Student recognition and awards system

#### **src/pages/AchievementsCommitteeDashboard.tsx**
- **Purpose**: Specialized dashboard for Achievements Committee members
- **Contains**: 
  - Achievement-focused statistics
  - Recent achievements display
  - Category overview
  - Committee-specific metrics
- **Key Features**:
  - Achievement-centric dashboard
  - Student recognition overview
  - Committee workflow
- **Hosting Note**: Specialized committee interface

#### **src/pages/UserManagement.tsx**
- **Purpose**: Admin interface for managing all system users
- **Contains**: 
  - User CRUD operations
  - Role management
  - User statistics
  - Search and filtering
- **Key Features**:
  - Complete user administration
  - Role-based management
  - User statistics and analytics
- **Hosting Note**: Critical for system administration

#### **src/pages/FacultyApproval.tsx**
- **Purpose**: Admin interface for approving faculty and committee registrations
- **Contains**: 
  - Pending faculty review
  - Approval/rejection workflow
  - Role-based prioritization
  - Approval history
- **Key Features**:
  - Faculty onboarding workflow
  - Committee member approval
  - Priority-based processing
- **Hosting Note**: Essential for user onboarding

#### **src/pages/StudentApproval.tsx**
- **Purpose**: Admin interface for approving student registrations
- **Contains**: 
  - Student approval workflow
  - Parent contact verification
  - Bulk approval operations
  - Registration validation
- **Key Features**:
  - Student onboarding process
  - Parent information management
  - Data validation
- **Hosting Note**: Critical for student enrollment

#### **src/pages/Reports.tsx**
- **Purpose**: Comprehensive reporting and analytics interface
- **Contains**: 
  - Excel export functionality
  - Date range filtering
  - Multiple report types
  - Data aggregation
- **Key Features**:
  - Attendance reports
  - Leave reports
  - Achievement reports
  - Student database exports
- **Hosting Note**: Important for administrative reporting

#### **src/pages/Settings.tsx**
- **Purpose**: System configuration and user preferences
- **Contains**: 
  - Profile management
  - Email notification settings
  - System information display
- **Key Features**:
  - User profile updates
  - Notification preferences
  - System status monitoring
- **Hosting Note**: User customization and system monitoring

### 🧩 **Component Files**

#### **src/components/Layout/Header.tsx**
- **Purpose**: Top navigation header with user information
- **Contains**: 
  - Role-based title display
  - Mobile menu toggle
  - User profile display
  - Search functionality
- **Key Features**:
  - Responsive design
  - Role-specific branding
  - Mobile-friendly navigation
- **Hosting Note**: Core navigation component

#### **src/components/Layout/Sidebar.tsx**
- **Purpose**: Main navigation sidebar with role-based menu
- **Contains**: 
  - Role-specific navigation links
  - User information display
  - Logout functionality
  - Mobile responsive behavior
- **Key Features**:
  - Dynamic menu based on user role
  - Trinity Track branding
  - Mobile slide-out functionality
- **Hosting Note**: Primary navigation interface

#### **src/components/Auth/AuthContainer.tsx**
- **Purpose**: Authentication flow container
- **Contains**: Login and signup form switching logic
- **Key Features**: Seamless auth flow management
- **Hosting Note**: Entry point for user authentication

#### **src/components/Auth/LoginForm.tsx**
- **Purpose**: User login interface
- **Contains**: 
  - Email/password authentication
  - Main admin login handling
  - Form validation
  - Trinity Track branding
- **Key Features**:
  - Secure authentication
  - Role-based login
  - Responsive design
- **Hosting Note**: Primary user entry point

#### **src/components/Auth/SignupForm.tsx**
- **Purpose**: New user registration interface
- **Contains**: 
  - Multi-role registration
  - Form validation
  - Approval workflow integration
  - Role-specific information
- **Key Features**:
  - Faculty and committee registration
  - Approval requirement notification
  - Role-based form fields
- **Hosting Note**: User onboarding interface

#### **src/components/Auth/SplashScreen.tsx**
- **Purpose**: Application loading screen with Trinity branding
- **Contains**: 
  - Animated Trinity Track logo
  - Progress bar animation
  - Company branding
  - Loading animations
- **Key Features**:
  - Professional loading experience
  - Brand reinforcement
  - Smooth transitions
- **Hosting Note**: First impression component

#### **src/components/Dashboard/StatsCard.tsx**
- **Purpose**: Reusable statistics display component
- **Contains**: 
  - Configurable stat display
  - Icon integration
  - Color theming
  - Trend indicators
- **Key Features**:
  - Consistent stat presentation
  - Multiple color themes
  - Responsive design
- **Hosting Note**: Core UI component for dashboards

#### **src/components/Attendance/AttendanceForm.tsx**
- **Purpose**: Faculty interface for marking daily attendance
- **Contains**: 
  - 4-status attendance system (Present, Absent, Sports, EC)
  - Class and subject selection
  - Student list management
  - Real-time statistics
  - Mobile-optimized interface
- **Key Features**:
  - Enhanced attendance tracking
  - Activity reason capture
  - Mobile-friendly design
  - Real-time feedback
- **Hosting Note**: Core daily operation component

#### **src/components/Timetable/TimetableForm.tsx**
- **Purpose**: Interface for creating new timetable entries
- **Contains**: 
  - Time slot creation
  - Faculty assignment
  - Subject selection
  - Room assignment
- **Key Features**:
  - Comprehensive scheduling
  - Faculty integration
  - Validation logic
- **Hosting Note**: Academic scheduling tool

#### **src/components/Timetable/TimetableGrid.tsx**
- **Purpose**: Visual timetable display component
- **Contains**: 
  - Grid-based timetable layout
  - Color-coded subjects
  - Faculty information display
  - Edit/delete functionality
- **Key Features**:
  - Visual schedule representation
  - Interactive grid interface
  - Subject color coding
- **Hosting Note**: Visual scheduling interface

#### **src/components/Leave/LeaveApplicationForm.tsx**
- **Purpose**: Faculty leave application submission interface
- **Contains**: 
  - Leave type selection
  - Date range picker
  - Description and subject fields
  - Multi-stage submission
- **Key Features**:
  - Comprehensive leave application
  - Validation logic
  - Multi-stage workflow
- **Hosting Note**: Faculty leave request tool

#### **src/components/Achievements/AchievementForm.tsx**
- **Purpose**: Faculty achievement submission interface
- **Contains**: 
  - Achievement type selection
  - Description and documentation
  - File URL management
  - Date tracking
- **Key Features**:
  - Professional development tracking
  - Document management
  - Category-based organization
- **Hosting Note**: Faculty achievement tracking

#### **src/components/Achievements/StudentAchievementForm.tsx**
- **Purpose**: Student achievement entry interface for committee members
- **Contains**: 
  - Student selection
  - Achievement categorization
  - Photo link management
  - Outcome tracking
- **Key Features**:
  - Student recognition system
  - Google Drive integration
  - Multi-category support
- **Hosting Note**: Student recognition tool

### 🛠️ **Utility Files**

#### **src/utils/constants.ts**
- **Purpose**: Centralized application constants and configuration
- **Contains**: 
  - Class definitions (B.com, BBA, BCA, PCMB, PCMC, EBAC, EBAS)
  - Time slot configurations
  - Subject mappings by class and year
  - Helper functions for data validation
- **Key Features**:
  - Consistent data structure
  - Academic program support
  - Subject-class mapping
- **Hosting Note**: Core configuration for academic structure

#### **src/utils/dataNormalization.ts**
- **Purpose**: Data consistency and normalization utilities
- **Contains**: 
  - Class name normalization
  - Year format standardization
  - Student data validation
  - Data processing functions
- **Key Features**:
  - Handles data inconsistencies
  - Ensures display consistency
  - Validation without filtering
- **Hosting Note**: Critical for data integrity

#### **src/utils/inputNormalization.ts**
- **Purpose**: User input normalization and validation
- **Contains**: 
  - Roll number normalization
  - Email formatting
  - Phone number formatting
  - Input validation functions
- **Key Features**:
  - Consistent data entry
  - Format validation
  - User input cleaning
- **Hosting Note**: Ensures data quality

#### **src/utils/leaveCalculations.ts**
- **Purpose**: Leave balance and LOP calculation logic
- **Contains**: 
  - Annual leave quota management (12 leaves)
  - Monthly leave limits (2 per month)
  - LOP (Loss of Pay) calculations
  - Leave statistics generation
- **Key Features**:
  - Accurate leave tracking
  - LOP calculation
  - Monthly breakdown
- **Hosting Note**: Critical for leave management accuracy

#### **src/utils/attendanceCalculations.ts**
- **Purpose**: Attendance percentage and statistics calculations
- **Contains**: 
  - Monthly attendance breakdown
  - 4-status attendance calculations
  - Percentage calculations (Sports and EC count as excused)
  - Color coding functions
- **Key Features**:
  - Enhanced attendance metrics
  - Activity tracking
  - Visual feedback
- **Hosting Note**: Core attendance analytics

#### **src/services/emailService.ts**
- **Purpose**: Email notification service configuration
- **Contains**: 
  - EmailJS configuration
  - Parent notification functions
  - Email template management
  - Service initialization
- **Key Features**:
  - Automated parent notifications
  - Email template system
  - Bulk notification support
- **Current Status**: Email notifications disabled - using database-only approach
- **Hosting Note**: Email service integration (currently disabled)

### 🎯 **Hosting-Specific Information**

#### **Build Process**
- **Command**: `npm run build`
- **Output**: `dist/` directory
- **Assets**: Optimized JavaScript, CSS, and static files
- **Entry Point**: `dist/index.html`

#### **Environment Requirements**
- **Node.js**: Version 16 or higher
- **Package Manager**: npm or yarn
- **Build Tool**: Vite
- **Framework**: React 18 with TypeScript

#### **External Dependencies**
- **Firebase**: Authentication, Firestore database, Storage
- **EmailJS**: Email notification service (currently disabled)
- **Lucide React**: Icon library
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling framework

#### **Static Assets**
- **Trinity Logo**: `/public/trinity-logo.png`
- **Favicon**: Referenced in `index.html`
- **Build Assets**: Generated in `dist/assets/`

#### **Deployment Configuration**
- **SPA Routing**: Requires server-side routing configuration
- **Public Routes**: `/welcome`, `/parent-attendance`
- **Protected Routes**: All other routes require authentication
- **API Integration**: Firebase services (external)

### 🔒 **Security & Configuration**

#### **Firebase Configuration**
- **Project**: etmark-collage
- **Authentication**: Email/password with role-based access
- **Database**: Firestore with security rules
- **Storage**: Firebase Storage for file uploads

#### **User Roles**
- **Admin**: Full system access (hiddencave168@gmail.com)
- **Faculty**: Attendance marking, personal management
- **Timetable Committee**: Leave review, timetable management
- **Examination Committee**: Leave review, examination management
- **Achievements Committee**: Student achievement management

#### **Data Security**
- **Authentication Required**: All management features
- **Role-Based Access**: Different permissions per role
- **Approval Workflows**: Multi-stage approval for users and students
- **Data Validation**: Client and server-side validation

### 📊 **Key Features Summary**

#### **Enhanced Attendance System**
- 4-status tracking: Present, Absent, Sports, EC
- Sports and EC count as excused attendance
- Mobile-optimized marking interface
- Parent portal integration

#### **Multi-Role Management**
- Admin: Complete system control
- Faculty: Daily operations
- Committees: Specialized workflows
- Public: Parent attendance checking

#### **Comprehensive Reporting**
- Excel export capabilities
- Date range filtering
- Multi-class support
- Real-time statistics

#### **Modern Technology Stack**
- React 18 with TypeScript
- Firebase backend services
- Tailwind CSS for styling
- Vite for fast development and building

---

## 🚀 **Hosting Deployment Guide**

### **Pre-Deployment Checklist**
1. ✅ All dependencies installed (`npm install`)
2. ✅ Firebase configuration verified
3. ✅ Build process tested (`npm run build`)
4. ✅ Environment variables configured
5. ✅ Static assets available

### **Build Command**
```bash
npm run build
```

### **Output Directory**
```
dist/
```

### **Server Configuration**
- **SPA Routing**: Configure server to serve `index.html` for all routes
- **Static Assets**: Serve files from `dist/assets/` directory
- **MIME Types**: Ensure proper MIME types for `.js`, `.css`, `.png` files

### **Environment Variables**
- **Firebase Config**: Embedded in build (no environment variables needed)
- **Public Access**: No API keys exposed in frontend
- **Security**: All sensitive data handled by Firebase

---

This comprehensive file documentation ensures that anyone hosting, maintaining, or developing Trinity Track has complete understanding of the project structure and each component's purpose.