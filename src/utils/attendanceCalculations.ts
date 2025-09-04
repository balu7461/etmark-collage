import { AttendanceRecord } from '../types';
import { format, getMonth, getYear, getDaysInMonth } from 'date-fns';

export interface MonthlyAttendanceBreakdown {
  month: number;
  year: number;
  monthName: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  sportsCount: number;
  ecCount: number;
  attendancePercentage: number;
  excusedCount: number; // present + sports + ec
}

export function calculateMonthlyAttendance(records: AttendanceRecord[]): MonthlyAttendanceBreakdown[] {
  if (!records || records.length === 0) {
    return [];
  }

  // Group records by month and year
  const monthlyGroups = records.reduce((acc, record) => {
    const recordDate = new Date(record.date);
    const month = getMonth(recordDate); // 0-based month
    const year = getYear(recordDate);
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        records: []
      };
    }
    
    acc[key].records.push(record);
    return acc;
  }, {} as Record<string, { month: number; year: number; records: AttendanceRecord[] }>);

  // Calculate statistics for each month
  const monthlyBreakdown = Object.values(monthlyGroups).map(group => {
    const { month, year, records: monthRecords } = group;
    
    const totalClasses = monthRecords.length;
    const presentCount = monthRecords.filter(r => r.status === 'present').length;
    const absentCount = monthRecords.filter(r => r.status === 'absent').length;
    const sportsCount = monthRecords.filter(r => r.status === 'sports').length;
    const ecCount = monthRecords.filter(r => r.status === 'ec').length;
    
    // Sports and EC count as excused attendance (positive towards percentage)
    const excusedCount = presentCount + sportsCount + ecCount;
    const attendancePercentage = totalClasses > 0 ? Math.round((excusedCount / totalClasses) * 100) : 0;
    
    const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    return {
      month,
      year,
      monthName,
      totalClasses,
      presentCount,
      absentCount,
      sportsCount,
      ecCount,
      attendancePercentage,
      excusedCount
    };
  });

  // Sort by year and month (most recent first)
  return monthlyBreakdown.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.month - a.month;
  });
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 85) return 'text-green-600';
  if (percentage >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

export function getAttendanceBgColor(percentage: number): string {
  if (percentage >= 85) return 'bg-green-100 border-green-200';
  if (percentage >= 75) return 'bg-yellow-100 border-yellow-200';
  return 'bg-red-100 border-red-200';
}

export function getAttendanceStatus(percentage: number): string {
  if (percentage >= 85) return 'Excellent';
  if (percentage >= 75) return 'Good';
  return 'Needs Improvement';
}

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  
  // Academic year typically starts in June (month 5)
  if (currentMonth >= 5) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
}