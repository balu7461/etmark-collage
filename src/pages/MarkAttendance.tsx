import React from 'react';
import { AttendanceForm } from '../components/Attendance/AttendanceForm';

export function MarkAttendance() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Select your class and subject to mark student attendance.
            </p>
          </div>

          <AttendanceForm />
        </div>
      </main>
    </div>
  );
}