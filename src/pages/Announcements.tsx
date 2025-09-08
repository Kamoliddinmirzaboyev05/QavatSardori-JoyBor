import React, { useState } from 'react';
import { Plus, Megaphone, AlertTriangle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AnnouncementForm from '../components/announcements/AnnouncementForm';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/storage';

const Announcements: React.FC = () => {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);

  const sortedAnnouncements = [...state.announcements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
          <p className="text-sm text-gray-600">
            {state.role === 'warden' ? 'Manage announcements' : 'Latest news and updates'}
          </p>
        </div>
        {state.role === 'warden' && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedAnnouncements.length > 0 ? (
          sortedAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {announcement.isImportant ? (
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Megaphone className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    {announcement.isImportant && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Important
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{announcement.content}</p>
                  
                  <p className="text-xs text-gray-500">
                    {formatDateTime(announcement.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-8">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No announcements yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {state.role === 'warden' 
                ? 'Create your first announcement to communicate with students'
                : 'Check back later for updates'
              }
            </p>
          </Card>
        )}
      </div>

      {showForm && (
        <AnnouncementForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Announcements;