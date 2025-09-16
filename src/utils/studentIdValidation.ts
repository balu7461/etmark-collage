/**
 * Student ID standardization and validation utilities
 * Handles both numeric-only and alphanumeric student identification numbers
 */

export interface StudentIdProcessingResult {
  originalInput: string;
  formatType: 'Numeric-only' | 'Alphanumeric' | 'Invalid';
  standardizedVersion: string;
  status: 'Valid' | 'Invalid';
  notes: string;
}

/**
 * Processes and standardizes a student identification number
 * @param input - Raw student ID input
 * @returns Processing result with standardized ID and validation status
 */
export function processStudentId(input: string): StudentIdProcessingResult {
  // Handle non-string inputs by converting to string
  if (typeof input !== 'string') {
    if (input === null || input === undefined) {
      return {
        originalInput: String(input),
        formatType: 'Invalid',
        standardizedVersion: 'N/A',
        status: 'Invalid',
        notes: 'Input is null or undefined'
      };
    }
    input = String(input);
  }
  
  const originalInput = input;
  let notes: string[] = [];
  
  // Step 1: Remove leading/trailing whitespace
  let processed = input.trim();
  if (input !== processed) {
    notes.push('Removed whitespace');
  }
  
  // Step 2: Convert to uppercase
  const uppercased = processed.toUpperCase();
  if (processed !== uppercased) {
    notes.push('converted to uppercase');
  }
  processed = uppercased;
  
  // Step 3: Check for empty input
  if (!processed) {
    return {
      originalInput,
      formatType: 'Invalid',
      standardizedVersion: 'N/A',
      status: 'Invalid',
      notes: notes.length > 0 ? notes.join(', ') + '; ID is empty or contains only whitespace' : 'ID is empty or contains only whitespace'
    };
  }
  
  // Step 4: Check for special characters or internal spaces
  if (/[^A-Z0-9]/.test(processed)) {
    return {
      originalInput,
      formatType: 'Invalid',
      standardizedVersion: 'N/A',
      status: 'Invalid',
      notes: 'Contains special characters or internal spaces'
    };
  }
  
  // Step 5: Check length constraints
  if (processed.length < 6 || processed.length > 15) {
    return {
      originalInput,
      formatType: 'Invalid',
      standardizedVersion: 'N/A',
      status: 'Invalid',
      notes: `Length out of bounds (min 6, max 15, current: ${processed.length})`
    };
  }
  
  // Step 6: Determine format type
  const isNumericOnly = /^\d+$/.test(processed);
  const hasLetters = /[A-Z]/.test(processed);
  const hasDigits = /\d/.test(processed);
  
  let formatType: 'Numeric-only' | 'Alphanumeric' | 'Invalid';
  
  if (isNumericOnly) {
    formatType = 'Numeric-only';
  } else if (hasLetters && hasDigits) {
    formatType = 'Alphanumeric';
  } else {
    return {
      originalInput,
      formatType: 'Invalid',
      standardizedVersion: 'N/A',
      status: 'Invalid',
      notes: 'Must be either numeric-only or contain both letters and digits'
    };
  }
  
  return {
    originalInput,
    formatType,
    standardizedVersion: processed,
    status: 'Valid',
    notes: notes.length > 0 ? notes.join(', ') : 'None'
  };
}

/**
 * Standardizes a student ID for database queries and display
 * @param input - Raw student ID input
 * @returns Standardized ID or null if invalid
 */
export function standardizeStudentId(input: string): string | null {
  const result = processStudentId(input);
  return result.status === 'Valid' ? result.standardizedVersion : null;
}

/**
 * Validates if a student ID is in acceptable format
 * @param input - Student ID to validate
 * @returns Boolean indicating if the ID is valid
 */
export function isValidStudentId(input: string): boolean {
  const result = processStudentId(input);
  return result.status === 'Valid';
}

/**
 * Creates multiple search terms for flexible student ID matching
 * @param input - Raw student ID input
 * @returns Array of search terms to try in database queries
 */
export function generateSearchTerms(input: string): string[] {
  const standardized = standardizeStudentId(input);
  if (!standardized) return [];
  
  const searchTerms = [standardized];
  
  // For numeric IDs, also try with leading zeros removed
  if (/^\d+$/.test(standardized)) {
    const withoutLeadingZeros = standardized.replace(/^0+/, '');
    if (withoutLeadingZeros && withoutLeadingZeros !== standardized) {
      searchTerms.push(withoutLeadingZeros);
    }
  }
  
  // Add original input if different from standardized
  const originalStandardized = input.trim().toUpperCase();
  if (originalStandardized !== standardized && originalStandardized.length >= 6) {
    searchTerms.push(originalStandardized);
  }
  
  return [...new Set(searchTerms)]; // Remove duplicates
}

/**
 * Formats a student ID for display purposes
 * @param input - Student ID to format
 * @returns Formatted ID for consistent display
 */
export function formatStudentIdForDisplay(input: string): string {
  const standardized = standardizeStudentId(input);
  return standardized || input;
}