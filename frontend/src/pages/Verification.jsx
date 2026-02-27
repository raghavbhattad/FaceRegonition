import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import api from '../api';

function Verification() {
    const webcamRef = useRef(null);
    const [status, setStatus] = useState('idle');
    const [memberData, setMemberData] = useState(null);
    const [scanError, setScanError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live clock tick
    useEffect(() => {
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(clockInterval);
    }, []);

    // Auto-scan continuously when idle
    useEffect(() => {
        let interval;
        if (status === 'idle') {
            interval = setInterval(captureAndVerify, 2500);
        }
        return () => clearInterval(interval);
    }, [status]);

    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    const captureAndVerify = useCallback(async () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setStatus('scanning');
        setScanError('');
        setMemberData(null);

        try {
            const blob = dataURLtoBlob(imageSrc);
            const formData = new FormData();
            formData.append('image', blob, 'verify.jpg');

            const response = await api.post('/verify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'granted') {
                setStatus('granted');
                setMemberData(response.data);
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('denied');
                setScanError('Face not recognized.');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (err) {
            setStatus('idle');
        }
    }, [webcamRef]);

    const stateColors = {
        idle: 'border-blue-500/30 text-blue-400 bg-gray-900',
        scanning: 'border-yellow-500 text-yellow-500 bg-gray-900',
        granted: 'border-green-500 text-green-100 bg-green-900/40',
        denied: 'border-red-500 text-red-100 bg-red-900/40'
    };

    const headerTextColor = {
        idle: 'text-white',
        scanning: 'text-yellow-300',
        granted: 'text-emerald-950 drop-shadow-none',
        denied: 'text-rose-950 drop-shadow-none'
    };

    const timeStr = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${stateColors[status]}`}>

            {/* Top Header — lounge name + live clock only */}
            <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-10 py-4 z-20">
                <div>
                    <p className={`text-xl font-bold tracking-widest transition-colors duration-500 ${headerTextColor[status]}`}>SKYLOUNGE PREMIUM</p>
                    <p className={`text-xs tracking-wider uppercase transition-colors duration-500 opacity-70 ${headerTextColor[status]}`}>AI Terminal · Face Recognition Access</p>
                </div>
                <div className="text-right">
                    <p className={`text-2xl font-mono font-semibold transition-colors duration-500 ${headerTextColor[status]}`}>{timeStr}</p>
                    <p className={`text-xs transition-colors duration-500 opacity-70 ${headerTextColor[status]}`}>{dateStr}</p>
                </div>
            </div>

            {/* Kiosk Mode Container */}
            <div className={`relative p-2 rounded-3xl border-4 shadow-2xl transition-all duration-500 bg-gray-950 ${stateColors[status].split(' ')[0]} ${status !== 'idle' ? 'scale-[1.02]' : 'scale-100'}`}>

                <div className="w-[800px] h-[600px] rounded-2xl overflow-hidden relative">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{ facingMode: "user" }}
                    />

                    {/* Biometric Scanning Overlay Graphics */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* Center target UI */}
                        <div className={`w-64 h-80 border-2 rounded-3xl transition-all duration-[2s] ${status === 'scanning' ? 'border-yellow-500 scale-110 shadow-[0_0_30px_rgba(234,179,8,0.5)]' : status === 'granted' ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)] bg-green-500/10' : status === 'denied' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] bg-red-500/10' : 'border-blue-500/50'}`}>

                            {/* Corner brackets */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-inherit rounded-tl-xl"></div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-inherit rounded-tr-xl"></div>
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-inherit rounded-bl-xl"></div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-inherit rounded-br-xl"></div>

                            {/* Scanning laser line effect */}
                            {status === 'scanning' && (
                                <div className="absolute left-0 right-0 h-1 bg-yellow-400 shadow-[0_0_15px_#facc15] animate-[scan_2s_ease-in-out_infinite]"></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Overlay Footer */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                    <div className={`backdrop-blur-md px-10 py-5 rounded-2xl border ${stateColors[status].split('bg-')[0]} bg-gray-950/80 shadow-2xl text-center transform transition-transform ${status !== 'idle' ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>

                        {status === 'scanning' && (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div>
                                <h1 className="text-3xl font-bold tracking-widest text-yellow-500">ANALYZING BIOMETRICS</h1>
                            </div>
                        )}

                        {status === 'granted' && (
                            <div>
                                <h1 className="text-5xl font-black tracking-widest text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] mb-2">ACCESS GRANTED</h1>
                                <p className="text-xl text-green-100 font-medium">Welcome, <span className="font-bold">{memberData?.member_name}</span></p>
                                <div className="text-sm mt-3 font-mono opacity-60">Match Confidence: {(memberData?.confidence * 100).toFixed(2)}%</div>
                            </div>
                        )}

                        {status === 'denied' && (
                            <div>
                                <h1 className="text-5xl font-black tracking-widest text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-2">ACCESS DENIED</h1>
                                <p className="text-lg text-red-200 mt-2 font-medium bg-red-950/50 py-1 px-4 rounded-full inline-block border border-red-500/20">{scanError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-6 text-gray-500 text-sm font-mono tracking-widest flex items-center gap-4">
                <span>PREMIUM LOUNGE AI SYSTEM</span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span>TERMINAL 2 KIOSK</span>
            </div>

            {/* Global override animation for the scanning line */}
            <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    );
}

export default Verification;
