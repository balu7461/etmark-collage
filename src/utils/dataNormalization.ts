/**
 * Data normalization utilities for ensuring consistent class and year formatting
 * across the Trinity Track application. This prevents display and filtering issues
 * caused by inconsistent data formatting in the Firestore database.
 */

import { Student } from '../types';
import { ALL_CLASSES, getYearsForClass } from './constants';

/**
 * Normalizes class name to match the expected format in ALL_CLASSES
 * @param className - Raw class name from database
 * @returns Normalized class name or original if no match found
 */
export function normalizeClassName(className: string): string {
  if (!className) return '';
  
  const normalized = className.toUpperCase().trim();
  
  // Direct match check
  if (ALL_CLASSES.includes(normalized)) {
    return normalized;
  }
  
  // Handle common variations
  const classMap: Record<string, string> = {
    'BCOM': 'B.com',
    'B.COM': 'B.com',
    'BCOM.': 'B.com',
    'B COM': 'B.com',
    'BACHELOR OF COMMERCE': 'B.com',
    'COMMERCE': 'B.com',
    
    'BBA': 'BBA',
    'BACHELOR OF BUSINESS ADMINISTRATION': 'BBA',
    'BUSINESS ADMINISTRATION': 'BBA',
    
    'BCA': 'BCA',
    'BACHELOR OF COMPUTER APPLICATIONS': 'BCA',
    'COMPUTER APPLICATIONS': 'BCA',
    
    'PCMB': 'PCMB',
    'PC MB': 'PCMB',
    'PCM B': 'PCMB',
    'PHYSICS CHEMISTRY MATHS BIOLOGY': 'PCMB',
    
    'PCMC': 'PCMC',
    'PC MC': 'PCMC',
    'PCM C': 'PCMC',
    'PHYSICS CHEMISTRY MATHS COMPUTER': 'PCMC',
    
    'EBAC': 'EBAC',
    'EBA C': 'EBAC',
    'EB AC': 'EBAC',
    'ECONOMICS BUSINESS ACCOUNTANCY COMPUTER': 'EBAC',
    
    'EBAS': 'EBAS',
    'EBA S': 'EBAS',
    'EB AS': 'EBAS',
    'ECONOMICS BUSINESS ACCOUNTANCY STATISTICS': 'EBAS'
  };
  
  return classMap[normalized] || className.trim();
}

/**
 * Normalizes year format to match expected format
 * @param year - Raw year from database
 * @returns Normalized year format (e.g., "1st Year", "2nd Year", "3rd Year")
 */
export function normalizeYear(year: string): string {
  if (!year) return '';
  
  const normalized = year.toString().trim().toLowerCase();
  
  // Handle numeric and text variations
  const yearMap: Record<string, string> = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    'first': '1st Year',
    'second': '2nd Year',
    'third': '3rd Year',
    '1st': '1st Year',
    '2nd': '2nd Year',
    '3rd': '3rd Year',
    '1st year': '1st Year',
    '2nd year': '2nd Year',
    '3rd year': '3rd Year',
    'first year': '1st Year',
    'second year': '2nd Year',
    'third year': '3rd Year',
    'year 1': '1st Year',
    'year 2': '2nd Year',
    'year 3': '3rd Year',
    'i': '1st Year',
    'ii': '2nd Year',
    'iii': '3rd Year',
    'i year': '1st Year',
    'ii year': '2nd Year',
    'iii year': '3rd Year'
  };
  
  return yearMap[normalized] || year.trim();
}

/**
 * Normalizes a student object's class and year fields
 * @param student - Student object from Firestore
 * @returns Student object with normalized class and year
 */
export function normalizeStudentClassAndYear(student: Student): Student {
  return {
    ...student,
    class: normalizeClassName(student.class),
    year: normalizeYear(student.year || '')
  };
}

/**
 * Normalizes an array of student objects
 * @param students - Array of student objects from Firestore
 * @returns Array of students with normalized class and year fields
 */
export function normalizeStudentArray(students: Student[]): Student[] {
  return students.map(normalizeStudentClassAndYear);
}

/**
 * Validates if a normalized student belongs to a valid class and year combination
 * @param student - Normalized student object
 * @returns boolean indicating if the student data is valid
 */
export function isValidStudentData(student: Student): boolean {
  // Check if class is in our supported classes
  if (!ALL_CLASSES.includes(student.class)) {
    console.warn(`Invalid class detected: ${student.class} for student ${student.name}`);
    return false;
  }
  
  // Check if year is valid for the class
  const validYears = getYearsForClass(student.class);
  if (validYears.length > 0 && !validYears.includes(student.year)) {
    console.warn(`Invalid year detected: ${student.year} for class ${student.class} for student ${student.name}`);
    return false;
  }
  
  return true;
}

/**
 * Filters and normalizes student data in one operation
 * @param students - Raw student array from Firestore
 * @returns Array of all normalized students (no filtering)
 */
export function processStudentData(students: Student[]): Student[] {
  console.log('🔄 Processing student data...', {
    totalStudents: students.length,
    timestamp: new Date().toISOString()
  });
  
  const normalizedStudents = normalizeStudentArray(students);
  
  // Log validation warnings but don't filter out students
  const validationResults = normalizedStudents.map(student => ({
    student,
    isValid: isValidStudentData(student)
  }));
  
  const invalidStudents = validationResults.filter(result => !result.isValid);
  if (invalidStudents.length > 0) {
    console.warn('⚠️ Found students with validation issues (but still including them):', 
      invalidStudents.map(result => ({
        name: result.student.name,
        class: result.student.class,
        year: result.student.year,
        rollNumber: result.student.rollNumber
      }))
    );
  }
  
  console.log('✅ Student data processing complete:', {
    originalCount: students.length,
    normalizedCount: normalizedStudents.length,
    validCount: validationResults.filter(r => r.isValid).length,
    invalidCount: invalidStudents.length,
    totalReturned: normalizedStudents.length
  });
  
  // Return ALL normalized students, don't filter any out
  return normalizedStudents;
}