import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface DashboardStats {
  totalContacts: number;
  recentContacts: number;
  pendingTasks: number;
  completedTasks: number;
  totalNotes: number;
  recentInteractions: number;
}

interface RecentActivity {
  id: string;
  type: 'contact' | 'task' | 'note' | 'interaction';
  title: string;
  description: string;
  timestamp: string;
  contactName?: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  contactName?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    recentContacts: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    recentInteractions: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts for stats
      const contactsResponse = await apiService.getContacts();
      const contacts = contactsResponse.contacts || [];
      
      // Calculate stats
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentContacts = contacts.filter((contact: any) => 
        new Date(contact.createdAt) > lastWeek
      ).length;

      // Demo data for now (replace with real API calls later)
      const demoStats: DashboardStats = {
        totalContacts: contacts.length,
        recentContacts,
        pendingTasks: 12,
        completedTasks: 8,
        totalNotes: 24,
        recentInteractions: 15
      };

      const demoRecentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'contact',
          title: 'New Contact Added',
          description: 'John Doe from Tech Corp',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          contactName: 'John Doe'
        },
        {
          id: '2',
          type: 'task',
          title: 'Task Completed',
          description: 'Follow up on proposal',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          contactName: 'Jane Smith'
        },
        {
          id: '3',
          type: 'note',
          title: 'Note Added',
          description: 'Meeting notes from conference',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          contactName: 'Mike Johnson'
        },
        {
          id: '4',
          type: 'interaction',
          title: 'Email Sent',
          description: 'Follow-up email sent',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          contactName: 'Sarah Wilson'
        }
      ];

      const demoUpcomingTasks: UpcomingTask[] = [
        {
          id: '1',
          title: 'Follow up on proposal',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'HIGH',
          contactName: 'John Doe'
        },
        {
          id: '2',
          title: 'Schedule meeting',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'MEDIUM',
          contactName: 'Jane Smith'
        },
        {
          id: '3',
          title: 'Send contract',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'URGENT',
          contactName: 'Mike Johnson'
        }
      ];

      setStats(demoStats);
      setRecentActivity(demoRecentActivity);
      setUpcomingTasks(demoUpcomingTasks);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'contact':
        return '👤';
      case 'task':
        return '✅';
      case 'note':
        return '📝';
      case 'interaction':
        return '💬';
      default:
        return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleActivityClick = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'contact':
        // Navigate to contact detail page if we have contact info
        if (activity.contactName) {
          // For now, navigate to contacts page - we could enhance this to find the specific contact
          navigate('/contacts');
        }
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'note':
        navigate('/notes');
        break;
      case 'interaction':
        navigate('/interactions');
        break;
      default:
        navigate('/contacts');
    }
  };

  const handleTaskClick = (task: UpcomingTask) => {
    // Navigate to tasks page - could be enhanced to show specific task
    navigate('/tasks');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/contacts/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Contact
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/contacts')}
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/notes')}
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/contacts')}
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentContacts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex-shrink-0">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.contactName && (
                      <p className="text-xs text-blue-600">Contact: {activity.contactName}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="border-l-4 border-blue-500 pl-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      {task.contactName && (
                        <p className="text-xs text-blue-600">Contact: {task.contactName}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/tasks')}
                className="w-full text-sm text-blue-600 hover:text-blue-800"
              >
                View All Tasks →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/contacts')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium text-gray-900">View Contacts</p>
            </button>
            <button
              onClick={() => navigate('/interactions')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">💬</div>
              <p className="text-sm font-medium text-gray-900">Interactions</p>
            </button>
            <button
              onClick={() => navigate('/notes')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm font-medium text-gray-900">Notes</p>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-sm font-medium text-gray-900">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 