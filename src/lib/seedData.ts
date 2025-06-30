import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { User, Student } from '../types';

export const seedInitialData = async () => {
  try {
    console.log('Starting to seed initial data...');

    // Create admin user
    try {
      const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@college.edu', 'admin123');
      const adminUser: User = {
        id: adminCredential.user.uid,
        email: 'admin@college.edu',
        name: 'System Administrator',
        role: 'admin',
        department: 'Administration',
        phone: '+1234567890'
      };
      await setDoc(doc(db, 'users', adminCredential.user.uid), adminUser);
      console.log('Admin user created successfully');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin user already exists');
      } else {
        console.error('Error creating admin user:', error);
      }
    }

    // Create faculty user
    try {
      const facultyCredential = await createUserWithEmailAndPassword(auth, 'faculty@college.edu', 'faculty123');
      const facultyUser: User = {
        id: facultyCredential.user.uid,
        email: 'faculty@college.edu',
        name: 'Dr. John Smith',
        role: 'faculty',
        department: 'BCA',
        phone: '+1234567891'
      };
      await setDoc(doc(db, 'users', facultyCredential.user.uid), facultyUser);
      console.log('Faculty user created successfully');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Faculty user already exists');
      } else {
        console.error('Error creating faculty user:', error);
      }
    }

    // Create sample students
    const sampleStudents: Omit<Student, 'id'>[] = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@student.edu',
        rollNumber: 'BCA001',
        class: 'BCA-A',
        department: 'BCA',
        parentEmail: 'alice.parent@email.com',
        parentPhone: '+1234567890'
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@student.edu',
        rollNumber: 'BCA002',
        class: 'BCA-A',
        department: 'BCA',
        parentEmail: 'bob.parent@email.com',
        parentPhone: '+1234567891'
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@student.edu',
        rollNumber: 'BBA001',
        class: 'BBA-A',
        department: 'BBA',
        parentEmail: 'carol.parent@email.com',
        parentPhone: '+1234567892'
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@student.edu',
        rollNumber: 'BCOM001',
        class: 'BCOM-A',
        department: 'BCOM',
        parentEmail: 'david.parent@email.com',
        parentPhone: '+1234567893'
      },
      {
        name: 'Eva Brown',
        email: 'eva.brown@student.edu',
        rollNumber: 'MCOM001',
        class: 'MCOM-A',
        department: 'MCOM',
        parentEmail: 'eva.parent@email.com',
        parentPhone: '+1234567894'
      }
    ];

    for (const student of sampleStudents) {
      try {
        await addDoc(collection(db, 'students'), student);
        console.log(`Student ${student.name} added successfully`);
      } catch (error) {
        console.error(`Error adding student ${student.name}:`, error);
      }
    }

    console.log('Initial data seeding completed!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};