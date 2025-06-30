import React from 'react';
import { TimeSlot } from '../../types';
import { Clock, MapPin, User, BookOpen, Edit2, Trash2 } from 'lucide-react';

interface TimetableGridProps {
  timeSlots: TimeSlot[];
  selectedClass?: string;
  isAdmin?: boolean;
  onEdit?: (timeSlot: TimeSlot) => void;
  onDelete?: (timeSlotId: string) => void;
}

export function TimetableGrid({ timeSlots, selectedClass, isAdmin = false, onEdit, onDelete }: TimetableGridProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlotHours = [
    '09:00-10:00',
    '10:00-11:00',
    '11:15-12:15',
    '12:15-13:15',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  const getTimeSlotForDayAndTime = (day: string, timeRange: string) => {
    const [startTime, endTime] = timeRange.split('-');
    return timeSlots.find(slot => 
      slot.day === day && 
      slot.startTime === startTime && 
      slot.endTime === endTime &&
      (!selectedClass || slot.class === selectedClass)
    );
  };

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-red-100 border-red-300 text-red-800',
      'bg-orange-100 border-orange-300 text-orange-800'
    ];
    
    const hash = subject.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Time
              </th>
              {days.map(day => (
                <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlotHours.map(timeRange => (
              <tr key={timeRange} className="hover:bg-gray-50">
                <td className="px-4 py-6 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs">{timeRange}</span>
                  </div>
                </td>
                {days.map(day => {
                  const slot = getTimeSlotForDayAndTime(day, timeRange);
                  return (
                    <td key={`${day}-${timeRange}`} className="px-2 py-2 text-center">
                      {slot ? (
                        <div className={`p-3 rounded-lg border-2 ${getSubjectColor(slot.subject)} relative group`}>
                          <div className="text-sm font-semibold mb-1">{slot.subject}</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-center space-x-1">
                              <User className="h-3 w-3" />
                              <span className="truncate">{slot.facultyName}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{slot.class}</span>
                            </div>
                            {slot.room && (
                              <div className="flex items-center justify-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{slot.room}</span>
                              </div>
                            )}
                          </div>
                          
                          {isAdmin && (
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(slot)}
                                  className="p-1 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
                                >
                                  <Edit2 className="h-3 w-3 text-blue-600" />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete(slot.id)}
                                  className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-20 flex items-center justify-center text-gray-400 text-xs">
                          Free
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}