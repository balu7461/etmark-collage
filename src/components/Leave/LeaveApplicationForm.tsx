import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { LeaveApplication, LeaveType, Department } from '../../types';
import { FileText, Calendar, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function LeaveApplicationForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: '' as LeaveType | '',
    subject: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const leaveTypes = [
    { value: 'OD', label: 'On Duty (OD) Leave' },
    { value: 'casual', label: 'Casual Leave' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.startDate || !formData.endDate || !formData.leaveType || !formData.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const leaveApplication: Omit<LeaveApplication, 'id'> = {
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        leaveType: formData.leaveType,
        subject: formData.subject,
        description: formData.description,
        status: 'pending_committee_approval',
        appliedDate: format(new Date(), 'yyyy-MM-dd'),
      };

      await addDoc(collection(db, 'leaveApplications'), leaveApplication);
      
      toast.success('Leave application submitted successfully!');
      
      // Reset form
      setFormData({
        startDate: '',
        endDate: '',
        leaveType: '',
        subject: '',
        description: ''
      });
      
    } catch (error) {
      console.error('Error submitting leave application:', error);
      toast.error('Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-[#002e5d]" />
        <h2 className="text-xl font-semibold text-gray-900">Apply for Leave</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={handleChange('endDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leave Type *
          </label>
          <select
            value={formData.leaveType}
            onChange={handleChange('leaveType')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={handleChange('subject')}
            placeholder="Brief subject for your leave request"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Detailed description of your leave request"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#002e5d] text-white py-3 px-4 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Application</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}