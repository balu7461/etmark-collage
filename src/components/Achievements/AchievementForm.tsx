import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Achievement } from '../../types';
import { Award, Upload, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function AchievementForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '' as 'certification' | 'publication' | 'award' | 'training' | 'workshop' | '',
    date: '',
    fileUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const achievementTypes = [
    { value: 'certification', label: 'Certification' },
    { value: 'publication', label: 'Publication' },
    { value: 'award', label: 'Award' },
    { value: 'training', label: 'Training' },
    { value: 'workshop', label: 'Workshop' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.title || !formData.type || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const achievement: Omit<Achievement, 'id'> = {
        facultyId: currentUser.id,
        facultyName: currentUser.name,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        fileUrl: formData.fileUrl,
        isTopPerformer: false,
        submittedDate: format(new Date(), 'yyyy-MM-dd')
      };

      await addDoc(collection(db, 'achievements'), achievement);
      
      toast.success('Achievement submitted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        date: '',
        fileUrl: ''
      });
      
    } catch (error) {
      console.error('Error submitting achievement:', error);
      toast.error('Failed to submit achievement');
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
        <Award className="h-6 w-6 text-[#002e5d]" />
        <h2 className="text-xl font-semibold text-gray-900">Add Achievement</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Achievement Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="Enter achievement title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={handleChange('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Type</option>
              {achievementTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={handleChange('date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Describe your achievement"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificate/Document URL (Optional)
          </label>
          <div className="relative">
            <Upload className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              value={formData.fileUrl}
              onChange={handleChange('fileUrl')}
              placeholder="https://example.com/certificate.pdf"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload your certificate to cloud storage and paste the public URL here
          </p>
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
              <Plus className="h-5 w-5" />
              <span>Add Achievement</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}