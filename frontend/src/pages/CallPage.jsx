import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { MdArrowBack } from 'react-icons/md';

const CallPage = () => {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const zpRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [error, setError] = useState(null);

    // Get call parameters from URL
    const callType = searchParams.get('type') || 'video'; // 'audio' or 'video'
    const calleeName = searchParams.get('calleeName') || 'User';
    const isGroup = searchParams.get('isGroup') === 'true'; // Check if it's a group call

    useEffect(() => {
        // Get user info from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userData);
        const userId = user.userId || user.id;
        const userName = user.username || user.name || 'User';

        // Zego Cloud credentials
        const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        console.log('Zego Config:', { 
          appID, 
          serverSecretLength: serverSecret?.length,
          rawAppId: import.meta.env.VITE_ZEGO_APP_ID,
          isGroup: isGroup
        });

        if (!appID || !serverSecret) {
            setError('Zego Cloud credentials not configured');
            return;
        }

        // Generate kit token for authentication
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomId,
            userId,
            userName
        );

        // Create Zego instance
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        // Join the room with appropriate mode
        zp.joinRoom({
            container: containerRef.current,
            scenario: {
                // Use GroupCall for group calls, OneONoneCall for 1-on-1 calls
                mode: isGroup ? ZegoUIKitPrebuilt.GroupCall : ZegoUIKitPrebuilt.OneONoneCall,
            },
            showPreJoinView: false, // Skip preview, join directly
            turnOnCameraWhenJoining: callType === 'video',
            turnOnMicrophoneWhenJoining: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: isGroup, // Enable screen sharing for group calls
            showTextChat: isGroup, // Enable text chat for group calls
            showUserList: isGroup, // Show user list for group calls
            maxUsers: isGroup ? 50 : 2, // More users for group calls
            layout: 'Auto',
            showLayoutButton: isGroup, // Layout button for group calls
            onJoinRoom: () => {
                setIsJoined(true);
            },
            onLeaveRoom: () => {
                navigate(-1); // Go back to previous page
            },
            onUserJoin: (users) => {
                console.log('User joined:', users);
            },
            onUserLeave: (users) => {
                console.log('User left:', users);
            },
        });

        // Cleanup on unmount
        return () => {
            if (zpRef.current) {
                zpRef.current.destroy();
            }
        };
    }, [roomId, callType, isGroup, navigate]);

    const handleGoBack = () => {
        if (zpRef.current) {
            zpRef.current.destroy();
        }
        navigate(-1);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Header - Only show before joining */}
            {!isJoined && (
                <div className="p-4 flex items-center gap-4 bg-slate-800 border-b border-slate-700">
                    <button
                        onClick={handleGoBack}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <MdArrowBack className="text-2xl" />
                    </button>
                    <div>
                        <h1 className="text-white font-semibold">
                            {callType === 'video' ? 'Video' : 'Audio'} Call
                        </h1>
                        <p className="text-slate-400 text-sm">Connecting to {calleeName}...</p>
                    </div>
                </div>
            )}

            {/* Call Container */}
            <div
                ref={containerRef}
                className="flex-1 w-full"
                style={{ minHeight: isJoined ? '100vh' : 'calc(100vh - 72px)' }}
            />
        </div>
    );
};

export default CallPage;
