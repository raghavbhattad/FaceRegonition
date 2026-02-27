import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ArrowLeft, Camera, UserPlus, RefreshCw, User, Award, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../api';

function RegisterMember() {
    const [formData, setFormData] = useState({
        name: '',
        member_id: '',
        membership_type: 'Silver',
        valid_until: '',
    });
    const [imageBlob, setImageBlob] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [focused, setFocused] = useState('');
    const [tierOpen, setTierOpen] = useState(false);

    const webcamRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Register';
    }, []);

    useEffect(() => {
        const calculateDate = () => {
            const today = new Date();
            let yearsToAdd = 0;
            switch (formData.membership_type) {
                case 'Silver': yearsToAdd = 1; break;
                case 'Gold': yearsToAdd = 2; break;
                case 'Platinum': yearsToAdd = 5; break;
                case 'Lifetime':
                    setFormData(prev => ({ ...prev, valid_until: '9999-12-31' }));
                    return;
                default: yearsToAdd = 0;
            }

            const futureDate = new Date(today.setFullYear(today.getFullYear() + yearsToAdd));
            const formattedDate = futureDate.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, valid_until: formattedDate }));
        };

        if (formData.membership_type !== 'Lifetime') {
            calculateDate();
        } else {
            setFormData(prev => ({ ...prev, valid_until: '9999-12-31' }));
        }
    }, [formData.membership_type]);

    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new Blob([u8arr], { type: mime });
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setImageBlob(dataURLtoBlob(imageSrc));
            setImagePreview(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setImageBlob(null);
        setImagePreview(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageBlob) { setMessage('error:Please capture a face photo first.'); return; }
        setLoading(true);
        setMessage('');
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('member_id', formData.member_id);
            payload.append('membership_type', formData.membership_type);
            payload.append('valid_until', formData.valid_until);
            payload.append('image', imageBlob, 'capture.jpg');
            const response = await api.post('/register', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage(`success:${response.data.message}`);
            setFormData({ name: '', member_id: '', membership_type: 'Silver', valid_until: '' });
            setImageBlob(null);
            setImagePreview(null);
        } catch (err) {
            setMessage(`error:${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const tierColors = {
        Silver: 'text-slate-300',
        Gold: 'text-yellow-400',
        Platinum: 'text-cyan-300',
        Lifetime: 'text-purple-400'
    };

    const isSuccess = message.startsWith('success:');
    const isError = message.startsWith('error:');
    const msgText = message.replace(/^(success:|error:)/, '');

    const inputClass = (name) =>
        `w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-all duration-300 ${focused === name ? 'border-blue-500/60 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/20'
        }`;

    return (
        <div className="min-h-screen bg-[#020817] text-gray-100 relative overflow-hidden">

            {/* Background layers */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-150px] right-[-150px] w-[700px] h-[700px] bg-blue-700/10 rounded-full blur-[130px]" />
                <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[100px]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            </div>
            <div className="fixed inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative max-w-5xl mx-auto px-6 py-8">

                {/* Back button */}
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-400 mb-8 text-sm transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Page header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-lg" />
                        <div className="relative bg-gray-950 border border-white/10 rounded-2xl overflow-hidden w-14 h-14 p-1.5 flex items-center justify-center">
                            <img src="/logo.png" alt="S" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Enroll New Member</h1>
                        <p className="text-gray-500 text-sm">Capture biometric data and create member profile</p>
                    </div>
                </div>

                {/* Alert message */}
                {message && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-6 ${isSuccess ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {isSuccess ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        {msgText}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left: Camera panel */}
                    <div className="bg-gray-950/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Biometric Capture</span>
                            {imageBlob && (
                                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    Face Captured
                                </span>
                            )}
                        </div>

                        {/* Camera / Preview */}
                        <div className="relative aspect-video bg-black overflow-hidden">
                            {!imageBlob ? (
                                <>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                        videoConstraints={{ facingMode: "user" }}
                                    />
                                    {/* Face guide overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-48 h-64 relative">
                                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-blue-400/70 rounded-tl-lg" />
                                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-blue-400/70 rounded-tr-lg" />
                                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-blue-400/70 rounded-bl-lg" />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-blue-400/70 rounded-br-lg" />
                                        </div>
                                    </div>
                                    {/* Bottom label */}
                                    <div className="absolute bottom-3 left-0 right-0 text-center">
                                        <span className="text-xs text-blue-300/60 font-mono tracking-widest">ALIGN FACE WITHIN FRAME</span>
                                    </div>
                                </>
                            ) : (
                                <img src={imagePreview} alt="Captured" className="w-full h-full object-cover" />
                            )}
                        </div>

                        {/* Capture / Retake button */}
                        <div className="p-4">
                            <button
                                onClick={(e) => { e.preventDefault(); imageBlob ? retake() : capture(); }}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${imageBlob
                                    ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'
                                    }`}
                            >
                                {imageBlob ? <><RefreshCw className="w-4 h-4" /> Retake Photo</> : <><Camera className="w-4 h-4" /> Capture Face</>}
                            </button>
                        </div>
                    </div>

                    {/* Right: Form panel */}
                    <div className="bg-gray-950/60 backdrop-blur-sm border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-white">Member Details</span>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">

                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                                    required placeholder="John Doe" className={inputClass('name')} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Member ID</label>
                                    <input type="text" name="member_id" value={formData.member_id} onChange={handleChange} onFocus={() => setFocused('member_id')} onBlur={() => setFocused('')}
                                        required placeholder="M10024" className={inputClass('member_id')} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Status Tier</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setTierOpen(!tierOpen)}
                                            className={`w-full flex items-center justify-between bg-white/5 border rounded-xl px-4 py-3 text-white text-sm transition-all duration-300 ${tierOpen ? 'border-blue-500/60 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/20'}`}
                                        >
                                            <span>{formData.membership_type === 'Lifetime' ? 'Lifetime First' : formData.membership_type}</span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${tierOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {tierOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                                                {[{ value: 'Silver', label: 'Silver' }, { value: 'Gold', label: 'Gold' }, { value: 'Platinum', label: 'Platinum' }, { value: 'Lifetime', label: 'Lifetime First' }].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => { setFormData({ ...formData, membership_type: opt.value }); setTierOpen(false); }}
                                                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 ${formData.membership_type === opt.value ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tier badge preview */}
                            <div className={`text-xs font-medium px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 inline-flex items-center gap-2 ${tierColors[formData.membership_type]}`}>
                                <Award className="w-3 h-3" />
                                {formData.membership_type} Member Tier
                            </div>

                            {formData.membership_type !== 'Lifetime' && (
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">
                                        Membership Duration
                                        <span className="ml-2 lowercase text-[10px] font-normal text-blue-400/60">(auto-calculated)</span>
                                    </label>
                                    <input type="date" name="valid_until" value={formData.valid_until} onChange={handleChange} onFocus={() => setFocused('date')} onBlur={() => setFocused('')}
                                        required className={inputClass('date')} />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !imageBlob}
                                className="relative w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-enabled:hover:from-blue-500 group-enabled:hover:to-indigo-500 transition-all duration-300" />
                                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing Biometrics…</>
                                    ) : (
                                        <><UserPlus className="w-4 h-4" /> Register Complete Profile</>
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterMember;
