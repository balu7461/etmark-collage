import { LeaveApplication } from '../types';
import { differenceInDays, parseISO, getMonth, getYear } from 'date-fns';

export interface LeaveStats {
  totalLeavesUsed: number;
  remainingLeaves: number;
  totalLOP: number;
  monthlyBreakdown: Array<{
    month: number;
    monthName: string;
    leavesUsed: number;
    lopDays: number;
  }>;
  currentYearLeaves: LeaveApplication[];
}

export function calculateLeaveStats(approvedLeaves: LeaveApplication[]): LeaveStats {
  const ANNUAL_LEAVE_QUOTA = 12;
  const MONTHLY_LEAVE_LIMIT = 2;
  const currentYear = new Date().getFullYear();
  
  // Filter leaves for current year only
  const currentYearLeaves = approvedLeaves.filter(leave => {
    const leaveYear = getYear(parseISO(leave.startDate));
    return leaveYear === currentYear;
  });

  // Calculate leave days for each application
  const leavesWithDays = currentYearLeaves.map(leave => {
    const startDate = parseISO(leave.startDate);
    const endDate = parseISO(leave.endDate);
    const days = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end dates
    
    return {
      ...leave,
      days,
      month: getMonth(startDate) // 0-based month (0 = January)
    };
  });

  // Group leaves by month and calculate LOP
  const monthlyStats = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthLeaves = leavesWithDays.filter(leave => leave.month === monthIndex);
    const totalDaysInMonth = monthLeaves.reduce((sum, leave) => sum + leave.days, 0);
    
    // Calculate LOP: any days beyond the monthly limit of 2
    const lopDays = Math.max(0, totalDaysInMonth - MONTHLY_LEAVE_LIMIT);
    const validLeaveDays = Math.min(totalDaysInMonth, MONTHLY_LEAVE_LIMIT);
    
    return {
      month: monthIndex,
      monthName: new Date(currentYear, monthIndex, 1).toLocaleDateString('en-US', { month: 'long' }),
      leavesUsed: validLeaveDays,
      lopDays,
      totalDaysInMonth
    };
  });

  // Calculate totals
  const totalLeavesUsed = monthlyStats.reduce((sum, month) => sum + month.leavesUsed, 0);
  const totalLOP = monthlyStats.reduce((sum, month) => sum + month.lopDays, 0);
  const remainingLeaves = Math.max(0, ANNUAL_LEAVE_QUOTA - totalLeavesUsed);

  return {
    totalLeavesUsed,
    remainingLeaves,
    totalLOP,
    monthlyBreakdown: monthlyStats.filter(month => month.totalDaysInMonth > 0), // Only show months with leaves
    currentYearLeaves
  };
}

export function getLeaveStatusColor(remainingLeaves: number): string {
  if (remainingLeaves >= 8) return 'text-green-600';
  if (remainingLeaves >= 4) return 'text-yellow-600';
  return 'text-red-600';
}

export function getLOPStatusColor(lopDays: number): string {
  if (lopDays === 0) return 'text-green-600';
  if (lopDays <= 2) return 'text-yellow-600';
  return 'text-red-600';
}