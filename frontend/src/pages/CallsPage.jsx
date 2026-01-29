import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdCall,
  MdVideoCall,
  MdArrowBack,
  MdCallMade,
  MdCallReceived,
  MdRefresh,
  MdPerson,
  MdGroup,
} from 'react-icons/md';
import { chatAPI } from '../services/chatAPI';

const CallsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and load user
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]);

  // Load call history
  useEffect(() => {
    if (user?.userId) {
      loadCalls();
    }
  }, [user]);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const response = await chatAPI.getCalls(user.userId);
      if (response.success && Array.isArray(response.data)) {
        // Sort by timestamp (newest first)
        const sortedCalls = response.data.sort((a, b) => b.timeStamp - a.timeStamp);
        setCalls(sortedCalls);
      }
    } catch (err) {
      console.error('Error loading calls:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && date.getDate() === now.getDate()) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 2 * oneDay && date.getDate() === now.getDate() - 1) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if call is outgoing
  const isOutgoing = (call) => {
    return call.callerId === user?.userId;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-4">
        <button
          onClick={() => navigate('/home')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <h1 className="text-xl font-semibold text-white">Calls</h1>
        <button
          onClick={loadCalls}
          className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
          title="Refresh"
        >
          <MdRefresh className="text-xl" />
        </button>
      </div>

      {/* Call List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <MdRefresh className="text-emerald-500 text-3xl animate-spin" />
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <MdCall className="text-6xl mb-4 opacity-30" />
            <p className="text-lg">No calls yet</p>
            <p className="text-sm">Your call history will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {calls.map((call) => (
              <div
                key={call.callId}
                className="p-4 hover:bg-slate-800 transition-colors flex items-center gap-3"
              >
                {/* Profile Picture */}
                {call.profilePicUrl ? (
                  <img
                    src={call.profilePicUrl}
                    alt={call.receiverName || call.groupName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    call.callType === 'GROUP'
                      ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                      : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                  }`}>
                    {call.callType === 'GROUP' ? (
                      <MdGroup className="text-xl" />
                    ) : (
                      getInitials(call.receiverName)
                    )}
                  </div>
                )}

                {/* Call Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {call.callType === 'GROUP' ? call.groupName : call.receiverName}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    {/* Call Direction Arrow */}
                    {isOutgoing(call) ? (
                      <MdCallMade className="text-emerald-500" />
                    ) : (
                      <MdCallReceived className="text-blue-500" />
                    )}
                    {/* Call Type */}
                    <span className="text-slate-400">
                      {call.callMediaType === 'VIDEO' ? 'Video' : 'Audio'}
                    </span>
                    <span className="text-slate-500">•</span>
                    {/* Timestamp */}
                    <span className="text-slate-500">{formatTime(call.timeStamp)}</span>
                  </div>
                </div>

                {/* Call Button */}
                <button
                  onClick={() => {
                    // For individual calls, navigate to call page
                    if (call.callType === 'INDIVISUAL') {
                      const otherUserId = isOutgoing(call) 
                        ? call.receiverId // If outgoing, call the receiver again
                        : call.callerId; // If incoming, call back the caller
                      
                      // Since we don't have receiverId in response, we need to handle this differently
                      // For now, just show the call icon without action for re-calling
                      // The user can initiate calls from the chat page
                    }
                  }}
                  className="p-3 text-emerald-500 hover:bg-slate-700 rounded-full transition-colors"
                >
                  {call.callMediaType === 'VIDEO' ? (
                    <MdVideoCall className="text-2xl" />
                  ) : (
                    <MdCall className="text-xl" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallsPage;
