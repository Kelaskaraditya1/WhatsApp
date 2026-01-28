import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { statusAPI } from '../services/statusAPI';
import {
  MdHome,
  MdChat,
  MdPeople,
  MdCall,
  MdSettings,
  MdLogout,
  MdSearch,
  MdAdd,
  MdClose,
  MdRefresh,
  MdArrowBack,
  MdArrowForward,
  MdImage,
  MdVideoLibrary,
  MdTextFields,
  MdCameraAlt,
  MdVisibility,
} from 'react-icons/md';
import { HiStatusOnline } from 'react-icons/hi';

const StatusPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // User state
  const [user, setUser] = useState(null);
  
  // Status state
  const [statuses, setStatuses] = useState([]); // Array of GetStatusResponse
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status viewer state
  const [selectedUserStatus, setSelectedUserStatus] = useState(null); // GetStatusResponse
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewedStatuses, setViewedStatuses] = useState(new Set()); // Track viewed status IDs
  
  // Viewers bottom sheet state
  const [showViewersSheet, setShowViewersSheet] = useState(false);
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('IMAGE'); // IMAGE, VIDEO, TEXT
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  // Load statuses when user is loaded
  useEffect(() => {
    if (!user?.userId) return;

    const loadStatuses = async () => {
      setIsLoadingStatuses(true);
      const response = await statusAPI.getAllStatuses(user.userId);
      if (response.success && response.data) {
        setStatuses(response.data);
      }
      setIsLoadingStatuses(false);
    };

    loadStatuses();
  }, [user?.userId]);

  // Progress timer for status viewer
  useEffect(() => {
    if (!selectedUserStatus) return;

    const currentStatus = selectedUserStatus.statusList[currentStatusIndex];
    if (!currentStatus) return;

    // Video progress is handled by video element
    if (currentStatus.statusType === 'VIDEO') return;

    // For images and text, auto-advance after 5 seconds
    setProgress(0);
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        clearInterval(progressIntervalRef.current);
        handleNextStatus();
      }
    }, interval);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [selectedUserStatus, currentStatusIndex]);

  // Track view count when viewing others' statuses
  useEffect(() => {
    if (!selectedUserStatus || !user) return;
    if (selectedUserStatus.isMine) return; // Don't track own views

    const currentStatus = selectedUserStatus.statusList[currentStatusIndex];
    if (!currentStatus) return;

    const statusId = currentStatus.id;
    if (viewedStatuses.has(statusId)) return; // Already tracked

    // Mark as viewed and call API
    setViewedStatuses(prev => new Set([...prev, statusId]));
    statusAPI.incrementViewCount(statusId, user.userId).catch(err => {
      console.error('Failed to increment view count:', err);
    });
  }, [selectedUserStatus, currentStatusIndex, user, viewedStatuses]);

  // Get my status from the list
  const myStatus = statuses.find(s => s.isMine);
  const otherStatuses = statuses.filter(s => !s.isMine && s.statusList?.length > 0);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setSelectedFile(file);

    // Determine type and create preview
    if (file.type.startsWith('image/')) {
      setUploadType('IMAGE');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setUploadType('VIDEO');
      setFilePreview(URL.createObjectURL(file));
    } else {
      setUploadError('Only images and videos are allowed for status');
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  // Clear file selection
  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload status
  const handleUploadStatus = async () => {
    if (uploadType === 'TEXT' && !caption.trim()) {
      setUploadError('Please enter some text for your status');
      return;
    }

    if (uploadType !== 'TEXT' && !selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      let mediaUrl = null;

      // Upload media first if not text status
      if (uploadType !== 'TEXT' && selectedFile) {
        const uploadResponse = await statusAPI.uploadMedia(selectedFile);
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error || 'Failed to upload media');
        }
        mediaUrl = uploadResponse.data['download-url'];
      }

      // Create status
      const statusData = {
        userId: user.userId,
        statusType: uploadType,
        mediaUrl: mediaUrl,
        caption: caption.trim() || null,
      };

      const response = await statusAPI.uploadStatus(statusData);
      
      if (response.success) {
        // Refresh statuses
        const refreshResponse = await statusAPI.getAllStatuses(user.userId);
        if (refreshResponse.success && refreshResponse.data) {
          setStatuses(refreshResponse.data);
        }
        
        // Close modal and reset
        setShowUploadModal(false);
        setSelectedFile(null);
        setFilePreview(null);
        setCaption('');
        setUploadType('IMAGE');
      } else {
        throw new Error(response.error || 'Failed to create status');
      }
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Open status viewer
  const handleViewStatus = (userStatus) => {
    console.log('Viewing status:', userStatus);
    console.log('isMine:', userStatus.isMine);
    setSelectedUserStatus(userStatus);
    setCurrentStatusIndex(0);
    setProgress(0);
  };

  // Close status viewer
  const handleCloseViewer = () => {
    setSelectedUserStatus(null);
    setCurrentStatusIndex(0);
    setProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  // Navigate to next status
  const handleNextStatus = () => {
    if (!selectedUserStatus) return;
    
    if (currentStatusIndex < selectedUserStatus.statusList.length - 1) {
      setCurrentStatusIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // No more statuses, close viewer
      handleCloseViewer();
    }
  };

  // Navigate to previous status
  const handlePrevStatus = () => {
    if (!selectedUserStatus) return;
    
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Filter statuses by search
  const filteredStatuses = otherStatuses.filter(s =>
    s.username?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <button 
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <MdHome className="text-xl" />
          </button>
          <button 
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <MdChat className="text-xl" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-slate-700 text-emerald-500 flex items-center justify-center">
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
        <div className="flex flex-col items-center gap-1">
          <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-colors">
            <MdSettings className="text-xl" />
          </button>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-700 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <MdLogout className="text-xl" />
          </button>
        </div>
      </div>

      {/* Status List Sidebar */}
      <div className="w-80 bg-slate-800 flex flex-col border-r border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Status</h1>
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <MdSettings className="text-xl" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts"
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* My Status */}
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={() => myStatus?.statusList?.length > 0 ? handleViewStatus(myStatus) : setShowUploadModal(true)}
            className="w-full flex items-center gap-3 hover:bg-slate-700/50 rounded-xl p-2 transition-colors"
          >
            <div className="relative">
              {user.profilePicUrl ? (
                <img
                  src={user.profilePicUrl}
                  alt="My Status"
                  className={`w-14 h-14 rounded-full object-cover ${myStatus?.statusList?.length > 0 ? 'ring-2 ring-emerald-500' : ''}`}
                />
              ) : (
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold ${myStatus?.statusList?.length > 0 ? 'ring-2 ring-emerald-500' : ''}`}>
                  {getInitials(user.name)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                <MdAdd className="text-white text-sm" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">My Status</p>
              <p className="text-slate-400 text-sm">
                {myStatus?.statusList?.length > 0 
                  ? `${myStatus.statusList.length} update${myStatus.statusList.length > 1 ? 's' : ''}`
                  : 'Tap to add status update'
                }
              </p>
            </div>
          </button>
        </div>

        {/* Status List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingStatuses ? (
            <div className="flex items-center justify-center h-32">
              <MdRefresh className="text-emerald-500 text-2xl animate-spin" />
            </div>
          ) : filteredStatuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 px-4">
              <HiStatusOnline className="text-4xl mb-2 opacity-50" />
              <p className="text-center text-sm">No status updates</p>
              <p className="text-center text-xs mt-1">Start chatting with people to see their status</p>
            </div>
          ) : (
            <>
              {/* Recent Updates */}
              <div className="p-4">
                <p className="text-emerald-500 text-xs font-semibold mb-3">RECENT UPDATES</p>
                {filteredStatuses.map((userStatus) => (
                  <button
                    key={userStatus.userId}
                    onClick={() => handleViewStatus(userStatus)}
                    className="w-full flex items-center gap-3 hover:bg-slate-700/50 rounded-xl p-2 mb-2 transition-colors"
                  >
                    {userStatus.profilePicUrl ? (
                      <img
                        src={userStatus.profilePicUrl}
                        alt={userStatus.username}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-emerald-500">
                        {getInitials(userStatus.username)}
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{userStatus.username}</p>
                      <p className="text-slate-400 text-sm">
                        {formatTimeAgo(userStatus.statusList[0]?.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-slate-900">
        {selectedUserStatus ? (
          /* Status Viewer - Phone-like container */
          <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center">
            {/* Phone-like container */}
            <div className="relative w-full max-w-md h-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col mx-4">
              {/* Progress Bars */}
              <div className="flex gap-1 p-3 pt-4">
                {selectedUserStatus.statusList.map((_, index) => (
                  <div key={index} className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-100"
                      style={{
                        width: index < currentStatusIndex 
                          ? '100%' 
                          : index === currentStatusIndex 
                            ? `${progress}%` 
                            : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-2">
                {selectedUserStatus.profilePicUrl ? (
                  <img
                    src={selectedUserStatus.profilePicUrl}
                    alt={selectedUserStatus.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold ring-2 ring-emerald-500">
                    {getInitials(selectedUserStatus.username)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedUserStatus.username}</p>
                  <p className="text-slate-400 text-sm">
                    {formatTimeAgo(selectedUserStatus.statusList[currentStatusIndex]?.createdAt)}
                  </p>
                </div>
                <button
                  onClick={handleCloseViewer}
                  className="p-2 text-white hover:bg-slate-800 rounded-full transition-colors"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>

              {/* Status Content */}
              <div className="flex-1 min-h-0 flex items-center justify-center relative bg-black overflow-hidden">
                {/* Status Media */}
                {selectedUserStatus.statusList[currentStatusIndex]?.statusType === 'VIDEO' ? (
                  <video
                    ref={videoRef}
                    src={selectedUserStatus.statusList[currentStatusIndex]?.mediaUrl}
                    className="max-w-full max-h-full object-contain"
                    autoPlay
                    onEnded={handleNextStatus}
                    onTimeUpdate={(e) => {
                      const video = e.target;
                      if (video.duration) {
                        setProgress((video.currentTime / video.duration) * 100);
                      }
                    }}
                  />
                ) : selectedUserStatus.statusList[currentStatusIndex]?.statusType === 'TEXT' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 p-8">
                    <p className="text-white text-2xl font-medium text-center">
                      {selectedUserStatus.statusList[currentStatusIndex]?.caption}
                    </p>
                  </div>
                ) : (
                  <img
                    src={selectedUserStatus.statusList[currentStatusIndex]?.mediaUrl}
                    alt="Status"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              {/* Caption (for non-text statuses) */}
              {selectedUserStatus.statusList[currentStatusIndex]?.statusType !== 'TEXT' && 
               selectedUserStatus.statusList[currentStatusIndex]?.caption && (
                <div className="px-4 py-3 bg-black/80 flex-shrink-0">
                  <p className="text-white text-center text-sm">
                    {selectedUserStatus.statusList[currentStatusIndex]?.caption}
                  </p>
                </div>
              )}

              {/* View count - Only show for logged-in user's own status */}
              {selectedUserStatus.userId === user?.userId && (
                <button
                  onClick={() => setShowViewersSheet(true)}
                  className="w-full px-4 py-4 flex justify-center bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer flex-shrink-0 border-t border-slate-700"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <MdVisibility className="text-xl" />
                    <span className="text-sm font-medium">
                      {selectedUserStatus.statusList[currentStatusIndex]?.views || 0} views
                    </span>
                    <span className="text-xs text-slate-400">• Tap to see viewers</span>
                  </div>
                </button>
              )}
            </div>

            {/* Navigation Buttons - Outside the phone container */}
            {currentStatusIndex > 0 && (
              <button
                onClick={handlePrevStatus}
                className="absolute left-4 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10"
              >
                <MdArrowBack className="text-white text-2xl" />
              </button>
            )}
            {currentStatusIndex < selectedUserStatus.statusList.length - 1 && (
              <button
                onClick={handleNextStatus}
                className="absolute right-4 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10"
              >
                <MdArrowForward className="text-white text-2xl" />
              </button>
            )}
          </div>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="relative mb-8">
              <div className="w-40 h-40 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-emerald-500/30 rounded-full flex items-center justify-center">
                  <MdCameraAlt className="text-4xl text-emerald-500" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Status Overview</h2>
            <p className="text-center max-w-md mb-8">
              Share text, photos, and videos that disappear after 24 hours. Select a contact from the sidebar to view their updates.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-2 font-medium transition-colors"
            >
              <MdAdd className="text-xl" />
              Click to add status
            </button>
            <p className="text-slate-500 text-sm mt-8">
              🔒 Your status updates are end-to-end encrypted
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add Status</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  handleClearFile();
                  setCaption('');
                  setUploadType('IMAGE');
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Status Type Selector */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setUploadType('IMAGE');
                    handleClearFile();
                  }}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
                    uploadType === 'IMAGE' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <MdImage className="text-xl" />
                  Image
                </button>
                <button
                  onClick={() => {
                    setUploadType('VIDEO');
                    handleClearFile();
                  }}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
                    uploadType === 'VIDEO' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <MdVideoLibrary className="text-xl" />
                  Video
                </button>
                <button
                  onClick={() => {
                    setUploadType('TEXT');
                    handleClearFile();
                  }}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
                    uploadType === 'TEXT' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <MdTextFields className="text-xl" />
                  Text
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
              {uploadType === 'TEXT' ? (
                /* Text Status */
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-8 min-h-[200px] flex items-center justify-center">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Type your status..."
                    className="w-full bg-transparent text-white text-2xl text-center placeholder-white/50 resize-none focus:outline-none"
                    rows={4}
                  />
                </div>
              ) : (
                /* Media Upload */
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={uploadType === 'IMAGE' ? 'image/*' : 'video/*'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {filePreview ? (
                    <div className="relative">
                      {uploadType === 'IMAGE' ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="w-full h-64 object-contain bg-slate-900 rounded-xl"
                        />
                      ) : (
                        <video
                          src={filePreview}
                          controls
                          className="w-full h-64 object-contain bg-slate-900 rounded-xl"
                        />
                      )}
                      <button
                        onClick={handleClearFile}
                        className="absolute top-2 right-2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
                      >
                        <MdClose className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors"
                    >
                      {uploadType === 'IMAGE' ? (
                        <MdImage className="text-4xl mb-2" />
                      ) : (
                        <MdVideoLibrary className="text-4xl mb-2" />
                      )}
                      <p>Click to select {uploadType.toLowerCase()}</p>
                    </button>
                  )}

                  {/* Caption input for media */}
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full mt-4 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </>
              )}

              {/* Error Message */}
              {uploadError && (
                <p className="text-red-400 text-sm mt-4 text-center">{uploadError}</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={handleUploadStatus}
                disabled={isUploading || (uploadType !== 'TEXT' && !selectedFile) || (uploadType === 'TEXT' && !caption.trim())}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isUploading ? (
                  <>
                    <MdRefresh className="text-xl animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <MdAdd className="text-xl" />
                    Share Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewers Bottom Sheet */}
      {showViewersSheet && selectedUserStatus && (
        <div 
          className="fixed inset-0 bg-black/70 z-[60] flex items-end justify-center"
          onClick={() => setShowViewersSheet(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-800 rounded-t-3xl max-h-[70vh] flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Viewed by</h3>
                <p className="text-slate-400 text-sm">
                  {selectedUserStatus.statusList[currentStatusIndex]?.views || 0} views
                </p>
              </div>
              <button
                onClick={() => setShowViewersSheet(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Viewers List */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedUserStatus.statusList[currentStatusIndex]?.viewers?.length > 0 ? (
                selectedUserStatus.statusList[currentStatusIndex].viewers.map((viewer, index) => (
                  <div key={index} className="flex items-center gap-3 py-3 px-2 hover:bg-slate-700/50 rounded-xl transition-colors">
                    {viewer.profilePicUrl ? (
                      <img
                        src={viewer.profilePicUrl}
                        alt={viewer.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                        {viewer.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium">{viewer.username}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <MdVisibility className="text-4xl mb-2 opacity-50" />
                  <p className="text-center">No views yet</p>
                  <p className="text-center text-sm text-slate-500 mt-1">
                    Views will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPage;
