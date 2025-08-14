import React from 'react';
import { AttendanceForm } from '../components/Attendance/AttendanceForm';

export function MarkAttendance() {
  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Select your class and subject to mark student attendance.
            </p>
          </div>

          <AttendanceForm />
        </div>
      </main>
    </div>
  );
}