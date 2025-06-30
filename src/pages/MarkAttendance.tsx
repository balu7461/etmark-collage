import React from 'react';
import { Header } from '../components/Layout/Header';
import { AttendanceForm } from '../components/Attendance/AttendanceForm';

export function MarkAttendance() {
  return (
    <div className="flex-1 flex flex-col">
      <Header />
      
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
            <p className="text-gray-600">
              Select your class and subject to mark student attendance.
            </p>
          </div>

          <AttendanceForm />
        </div>
      </main>
    </div>
  );
}