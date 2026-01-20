import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authAPI } from '../services/authAPI';
import { chatAPI, getChatRoomId } from '../services/chatAPI';
import {
  MdHome,
  MdChat,
  MdPeople,
  MdCall,
  MdSettings,
  MdLogout,
  MdPerson,
  MdSearch,
  MdSend,
  MdAdd,
  MdClose,
  MdRefresh,
  MdCheck,
  MdDoneAll,
  MdArrowBack,
  MdAttachFile,
  MdImage,
  MdVideoLibrary,
  MdPictureAsPdf,
  MdAudioFile,
} from 'react-icons/md';
import { HiStatusOnline } from 'react-icons/hi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Allowed file types for upload
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.mp4', '.pdf', '.mp3', '.docs'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const HomePage = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const currentSubscriptionRef = useRef(null);
  const fileInputRef = useRef(null);

  // User state
  const [user, setUser] = useState(null);
  
  // Chat state
  const [recentChats, setRecentChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Media attachment state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // New chat modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // WebSocket connection state
  const [isConnected, setIsConnected] = useState(false);

  // Check authentication on mount
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
      navigate('/login');
    }
  }, [navigate]);

  // Connect to WebSocket when user is loaded
  useEffect(() => {
    if (!user) return;

    const socket = new SockJS(`${API_BASE_URL}/chat`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('STOMP:', str);
      },
      onConnect: () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [user]);

  // Load recent chats when user is loaded
  useEffect(() => {
    if (!user?.userId) return;

    const loadRecentChats = async () => {
      setIsLoadingChats(true);
      const response = await chatAPI.getRecentChats(user.userId);
      if (response.success && response.data) {
        setRecentChats(response.data);
      }
      setIsLoadingChats(false);
    };

    loadRecentChats();
  }, [user?.userId]);

  // Subscribe to chat room when selected
  useEffect(() => {
    if (!selectedChat || !user || !stompClientRef.current || !isConnected) return;

    const chatRoomId = getChatRoomId(user.userId, selectedChat.userId);

    // Unsubscribe from previous chat
    if (currentSubscriptionRef.current) {
      currentSubscriptionRef.current.unsubscribe();
    }

    // Subscribe to new chat room
    currentSubscriptionRef.current = stompClientRef.current.subscribe(
      `/topic/dm/${chatRoomId}`,
      (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      }
    );

    return () => {
      if (currentSubscriptionRef.current) {
        currentSubscriptionRef.current.unsubscribe();
      }
    };
  }, [selectedChat, user, isConnected]);

  // Load messages when chat is selected
  useEffect(() => {
    if (!selectedChat || !user) return;

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      const chatRoomId = getChatRoomId(user.userId, selectedChat.userId);
      const response = await chatAPI.getMessages(chatRoomId);
      if (response.success && response.data) {
        setMessages(response.data);
      }
      setIsLoadingMessages(false);
    };

    loadMessages();
  }, [selectedChat, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Validate file
  const validateFile = (file) => {
    if (!file) return 'No file selected';
    
    const fileName = file.name.toLowerCase();
    const isValidType = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      return 'Invalid file type. Allowed: jpg, jpeg, png, mp4, pdf, mp3, docs';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size too large. Maximum 5MB allowed.';
    }
    
    return null;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }
    
    setUploadError('');
    setSelectedFile(file);
    
    // Create preview for images and videos
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({ type: 'image', url: reader.result, name: file.name });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setFilePreview({ type: 'video', url: URL.createObjectURL(file), name: file.name });
    } else if (file.type === 'application/pdf') {
      setFilePreview({ type: 'pdf', name: file.name });
    } else if (file.type.startsWith('audio/')) {
      setFilePreview({ type: 'audio', name: file.name });
    } else {
      setFilePreview({ type: 'file', name: file.name });
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine message type based on content
  const getMessageType = (hasText, hasMedia) => {
    if (hasText && hasMedia) return 'COMBINED';
    if (hasMedia) return 'MEDIA';
    return 'TEXT';
  };

  // Send message (with optional media)
  const handleSendMessage = useCallback(async () => {
    const hasText = newMessage.trim().length > 0;
    const hasMedia = selectedFile !== null;
    
    // Must have either text or media
    if (!hasText && !hasMedia) return;
    if (!selectedChat || !user || !stompClientRef.current || !isConnected) return;

    setIsSending(true);
    let mediaUrl = null;

    // Upload media first if selected
    if (hasMedia) {
      setIsUploading(true);
      const uploadResponse = await chatAPI.uploadMedia(selectedFile);
      setIsUploading(false);
      
      if (uploadResponse.success && uploadResponse.data) {
        mediaUrl = uploadResponse.data['download-url'];
      } else {
        setUploadError(uploadResponse.error || 'Failed to upload file');
        setIsSending(false);
        return;
      }
    }

    const messagePayload = {
      senderId: user.userId,
      reciverId: selectedChat.userId,
      message: hasText ? newMessage.trim() : '',
      mediaUrl: mediaUrl,
      chatType: 'DM',
      messageType: getMessageType(hasText, hasMedia),
    };

    stompClientRef.current.publish({
      destination: '/app/dm/message',
      body: JSON.stringify(messagePayload),
    });

    setNewMessage('');
    handleClearFile();
    setIsSending(false);
  }, [newMessage, selectedFile, selectedChat, user, isConnected]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load all users for new chat
  const handleOpenNewChat = async () => {
    setShowNewChatModal(true);
    setIsLoadingUsers(true);
    const response = await chatAPI.getAllUsers(user.userId);
    if (response.success && response.data) {
      setAllUsers(response.data);
    }
    setIsLoadingUsers(false);
  };

  // Start new chat with user
  const handleStartChat = (chatUser) => {
    setSelectedChat(chatUser);
    setShowNewChatModal(false);
    setMessages([]);
    
    // Add to recent chats if not already there
    if (!recentChats.find(c => c.userId === chatUser.userId)) {
      setRecentChats(prev => [chatUser, ...prev]);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');
    if (stompClientRef.current?.active) {
      stompClientRef.current.deactivate();
    }
    navigate('/login');
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Get file type icon
  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <MdImage className="text-2xl" />;
      case 'video': return <MdVideoLibrary className="text-2xl" />;
      case 'pdf': return <MdPictureAsPdf className="text-2xl" />;
      case 'audio': return <MdAudioFile className="text-2xl" />;
      default: return <MdAttachFile className="text-2xl" />;
    }
  };

  // Render media content in message
  const renderMedia = (msg) => {
    if (!msg.mediaUrl) return null;
    
    const url = msg.mediaUrl.toLowerCase();
    
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || url.includes('/image/')) {
      return (
        <img 
          src={msg.mediaUrl} 
          alt="Shared image" 
          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(msg.mediaUrl, '_blank')}
        />
      );
    }
    
    if (url.match(/\.(mp4|webm|ogg)$/i) || url.includes('/video/')) {
      return (
        <video 
          src={msg.mediaUrl} 
          controls 
          className="max-w-full rounded-lg"
        />
      );
    }
    
    if (url.match(/\.(mp3|wav|ogg)$/i) || url.includes('/audio/')) {
      return (
        <audio src={msg.mediaUrl} controls className="w-full" />
      );
    }
    
    if (url.match(/\.pdf$/i) || url.includes('/raw/')) {
      return (
        <a 
          href={msg.mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-slate-600/50 rounded-lg hover:bg-slate-600 transition-colors"
        >
          <MdPictureAsPdf className="text-2xl text-red-400" />
          <span className="text-sm">View PDF</span>
        </a>
      );
    }
    
    // Default file link
    return (
      <a 
        href={msg.mediaUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 bg-slate-600/50 rounded-lg hover:bg-slate-600 transition-colors"
      >
        <MdAttachFile className="text-2xl" />
        <span className="text-sm">Download File</span>
      </a>
    );
  };

  // Filter users by search
  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <MdRefresh className="text-emerald-500 text-4xl animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <div className="w-16 bg-slate-800 flex flex-col items-center py-4 gap-2 border-r border-slate-700">
        {/* Logo */}
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
          <MdChat className="text-white text-xl" />
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          <button className="w-10 h-10 rounded-xl bg-slate-700 text-emerald-500 flex items-center justify-center">
            <MdHome className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdChat className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <HiStatusOnline className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdPeople className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdCall className="text-xl" />
          </button>
        </nav>

        {/* Bottom Icons */}
        <div className="flex flex-col items-center gap-2">
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdSettings className="text-xl" />
          </button>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-colors"
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
      <div className="w-80 bg-slate-800 flex flex-col border-r border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white mb-3">Chats</h2>
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex items-center justify-center h-32">
              <MdRefresh className="text-emerald-500 text-2xl animate-spin" />
            </div>
          ) : recentChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 px-4">
              <MdChat className="text-4xl mb-2 opacity-50" />
              <p className="text-center text-sm">No chats yet</p>
              <p className="text-center text-xs mt-1">Click the + button to start a new chat</p>
            </div>
          ) : (
            recentChats.map((chat) => (
              <button
                key={chat.userId}
                onClick={() => {
                  setSelectedChat(chat);
                  setMessages([]);
                }}
                className={`w-full p-4 flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${
                  selectedChat?.userId === chat.userId ? 'bg-slate-700' : ''
                }`}
              >
                {/* Avatar */}
                {chat.profilePicUrl ? (
                  <img
                    src={chat.profilePicUrl}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {getInitials(chat.name)}
                  </div>
                )}
                {/* Chat Info */}
                <div className="flex-1 text-left">
                  <p className="text-white font-medium truncate">{chat.name}</p>
                  <p className="text-slate-400 text-sm truncate">@{chat.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <MdArrowBack className="text-slate-400" />
              </button>
              {selectedChat.profilePicUrl ? (
                <img
                  src={selectedChat.profilePicUrl}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                  {getInitials(selectedChat.name)}
                </div>
              )}
              <div>
                <p className="text-white font-medium">{selectedChat.name}</p>
                <p className="text-emerald-500 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <MdRefresh className="text-emerald-500 text-2xl animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MdChat className="text-6xl mb-4 opacity-30" />
                  <p className="text-lg">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSent = msg.senderId === user.userId;
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          isSent
                            ? 'bg-emerald-500 text-white rounded-br-md'
                            : 'bg-slate-700 text-white rounded-bl-md'
                        }`}
                      >
                        {/* Render media if present */}
                        {msg.mediaUrl && (
                          <div className="mb-2">
                            {renderMedia(msg)}
                          </div>
                        )}
                        {/* Render text message if present */}
                        {msg.message && (
                          <p className="break-words">{msg.message}</p>
                        )}
                        <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs opacity-70">{formatTime(msg.timeStamp)}</span>
                          {isSent && (
                            <MdDoneAll className="text-xs opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {filePreview && (
              <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
                <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-xl">
                  {filePreview.type === 'image' ? (
                    <img 
                      src={filePreview.url} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center text-slate-300">
                      {getFileIcon(filePreview.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{filePreview.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{filePreview.type}</p>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <MdClose className="text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="px-4 py-2 bg-red-900/20 border-t border-red-800">
                <p className="text-red-400 text-sm text-center">{uploadError}</p>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
              <div className="flex items-center gap-3">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.mp4,.pdf,.mp3,.docs"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* Attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  className="w-12 h-12 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl flex items-center justify-center transition-colors"
                >
                  <MdAttachFile className="text-slate-300 text-xl" />
                </button>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading || !isConnected}
                  className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                >
                  {isSending || isUploading ? (
                    <MdRefresh className="text-white text-xl animate-spin" />
                  ) : (
                    <MdSend className="text-white text-xl" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-slate-400">
            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <MdChat className="text-6xl text-emerald-500/50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to ChatConnect</h2>
            <p className="text-center max-w-md">
              Select a chat from the sidebar to start messaging, or click the button below to start a new conversation.
            </p>
            
            {/* FAB for new chat */}
            <button
              onClick={handleOpenNewChat}
              className="absolute bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <MdAdd className="text-white text-3xl" />
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <MdClose className="text-slate-400" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center h-32">
                  <MdRefresh className="text-emerald-500 text-2xl animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                filteredUsers.map((chatUser) => (
                  <button
                    key={chatUser.userId}
                    onClick={() => handleStartChat(chatUser)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-700/50 transition-colors"
                  >
                    {/* Avatar */}
                    {chatUser.profilePicUrl ? (
                      <img
                        src={chatUser.profilePicUrl}
                        alt={chatUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                        {getInitials(chatUser.name)}
                      </div>
                    )}
                    {/* User Info */}
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{chatUser.name}</p>
                      <p className="text-slate-400 text-sm">@{chatUser.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
