import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdChat, 
  MdSettings, 
  MdLogout, 
  MdSearch, 
  MdEdit, 
  MdFilterList,
  MdHome,
  MdPeople,
  MdCall,
  MdMoreVert,
  MdVideocam,
  MdSend,
  MdMic,
  MdAttachFile,
  MdInsertEmoticon,
  MdLock,
  MdDoneAll,
  MdDone,
  MdClose,
  MdPerson
} from 'react-icons/md';
import { HiStatusOnline } from 'react-icons/hi';

// Sample chat data for demonstration
const sampleChats = [
  {
    id: 1,
    name: 'Jane Doe',
    avatar: null,
    lastMessage: 'Hey, are we still meeting today?',
    time: '10:45 AM',
    unread: 0,
    online: true,
    isTyping: false,
  },
  {
    id: 2,
    name: 'Dev Team',
    avatar: null,
    isGroup: true,
    lastMessage: 'Alex: The latest build is ready...',
    time: 'Yesterday',
    unread: 3,
    online: false,
    isTyping: false,
  },
  {
    id: 3,
    name: 'Marcus Smith',
    avatar: null,
    lastMessage: 'Can you check the latest design updates?',
    time: 'Tue',
    unread: 0,
    online: false,
    isTyping: false,
  },
  {
    id: 4,
    name: 'Robert Fox',
    avatar: null,
    lastMessage: "I'll be OOO for the rest of the week.",
    time: 'Mon',
    unread: 0,
    online: false,
    isTyping: false,
  },
  {
    id: 5,
    name: 'Sarah Wilson',
    avatar: null,
    lastMessage: '✓ Thanks for the feedback!',
    time: 'Nov 12',
    unread: 0,
    online: true,
    isTyping: false,
  },
];

// Sample messages for selected chat
const sampleMessages = [
  {
    id: 1,
    text: "Hey there! I just finished reviewing the design documents you sent earlier. Everything looks fantastic.",
    time: '09:12 AM',
    isMine: false,
  },
  {
    id: 2,
    text: "That's great to hear! Did you have any questions about the component library or the new branding colors?",
    time: '09:15 AM',
    isMine: true,
    status: 'read',
  },
  {
    id: 3,
    text: "Just this one part of the sidebar navigation. Should we stick with the rounded corners or go for something more sharp?",
    time: '09:18 AM',
    isMine: false,
    hasImage: true,
  },
  {
    id: 4,
    text: "I think the rounded corners match our overall soft UI aesthetic better. Let's keep them! ✨",
    time: '09:20 AM',
    isMine: true,
    status: 'read',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredChats = sampleChats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 flex overflow-hidden">
      {/* Left Sidebar - Navigation Icons */}
      <div className="w-16 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-4">
        {/* Logo */}
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-8">
          <MdChat className="text-white text-xl" />
        </div>

        {/* Nav Icons */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <MdHome className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdChat className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <HiStatusOnline className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdPeople className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdCall className="text-xl" />
          </button>
        </nav>

        {/* Bottom Icons */}
        <div className="flex flex-col items-center gap-2">
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdSettings className="text-xl" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-colors"
          >
            <MdLogout className="text-xl" />
          </button>
          {/* User Avatar */}
          {user?.profilePicUrl ? (
            <img 
              src={user.profilePicUrl} 
              alt={user.name || 'User'} 
              className="w-10 h-10 rounded-full object-cover mt-2 border-2 border-emerald-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold mt-2">
              {user?.name ? getInitials(user.name) : <MdPerson />}
            </div>
          )}
        </div>
      </div>

      {/* Chat List Panel */}
      <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Chats</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <MdEdit className="text-xl" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <MdFilterList className="text-xl" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {['All', 'Unread', 'Groups', 'Personal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer border-l-4 transition-colors ${
                selectedChat?.id === chat.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  chat.isGroup ? 'bg-blue-500' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                }`}>
                  {chat.isGroup ? <MdPeople /> : getInitials(chat.name)}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {chat.name}
                  </h3>
                  <span className={`text-xs ${chat.unread ? 'text-emerald-500 font-semibold' : 'text-slate-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {chat.isTyping ? (
                      <span className="text-emerald-500">typing...</span>
                    ) : (
                      chat.lastMessage
                    )}
                  </p>
                  {chat.unread > 0 && (
                    <span className="ml-2 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {getInitials(selectedChat.name)}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">{selectedChat.name}</h2>
                  <p className="text-xs text-emerald-500">
                    {selectedChat.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MdSearch className="text-xl" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MdVideocam className="text-xl" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MdCall className="text-xl" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MdMoreVert className="text-xl" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Date Separator */}
              <div className="flex justify-center">
                <span className="px-4 py-1 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-full">
                  TODAY
                </span>
              </div>

              {sampleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md ${message.isMine ? 'order-2' : 'order-1'}`}>
                    {!message.isMine && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold mb-2">
                        {getInitials(selectedChat.name)}
                      </div>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.isMine
                          ? 'bg-emerald-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      {message.hasImage && (
                        <div className="mt-3 bg-slate-100 dark:bg-slate-700 rounded-lg p-4 h-32 flex items-center justify-center">
                          <div className="w-8 h-1 bg-slate-300 dark:bg-slate-500 rounded"></div>
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${message.isMine ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-slate-400">{message.time}</span>
                      {message.isMine && message.status === 'read' && (
                        <MdDoneAll className="text-emerald-500 text-sm" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MdInsertEmoticon className="text-xl" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MdAttachFile className="text-xl" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MdMic className="text-xl" />
                </button>
                <button className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-colors">
                  <MdSend className="text-xl" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected - Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {/* Chat Icon */}
            <div className="w-40 h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <MdChat className="text-white text-4xl" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              ChatConnect for Desktop
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
              Send and receive messages without keeping your phone online. 
              Use ChatConnect on up to 4 linked devices and 1 phone at the same time.
            </p>

            <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/25">
              Start a Conversation
            </button>

            {/* Encryption Notice */}
            <div className="flex items-center gap-2 mt-8 text-slate-400">
              <MdLock className="text-lg" />
              <span className="text-sm">End-to-end encrypted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
