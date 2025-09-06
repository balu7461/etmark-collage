/**
 * Utility functions for normalizing user input to ensure consistent data handling
 * across the application, particularly for unique identifiers like Sats No.
 */

/**
 * Normalizes a roll number/Sats No. input by keeping only numeric characters and trimming whitespace
 * @param input - The raw input string
 * @returns Normalized string suitable for database queries
 */
export function normalizeRollNumber(input: string): string {
  return input.replace(/\D/g, '').trim();
}

/**
 * Validates if a roll number follows the expected format
 * @param rollNumber - The roll number to validate
 * @returns boolean indicating if the format is valid
 */
export function validateRollNumberFormat(rollNumber: string): boolean {
  // Basic validation: should be numeric, 6-12 digits
  const rollNumberRegex = /^\d{6,12}$/;
  return rollNumberRegex.test(rollNumber);
}

/**
 * Custom hook for normalized input handling
 * @param initialValue - Initial value for the input
 * @returns [value, setValue, normalizedValue]
 */
export function useNormalizedInput(initialValue: string = '') {
  const [value, setValue] = React.useState(initialValue);
  
  const setNormalizedValue = (newValue: string) => {
    setValue(normalizeRollNumber(newValue));
  };
  
  return [value, setNormalizedValue, normalizeRollNumber(value)] as const;
}

/**
 * Normalizes email input by converting to lowercase and trimming
 * @param email - The email input
 * @returns Normalized email string
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normalizes phone number by removing non-numeric characters except + and spaces
 * @param phone - The phone number input
 * @returns Normalized phone number
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+\s-()]/g, '').trim();
}