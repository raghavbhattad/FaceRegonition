import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../api';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Login';
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            localStorage.setItem('access_token', response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Access denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020817]">

            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
            </div>

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Glow border effect */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-blue-500/40 via-indigo-500/10 to-transparent pointer-events-none" />

                <div className="relative bg-gray-950/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="relative inline-flex mb-4">
                            <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl" />
                            <div className="relative bg-[#020817] border border-white/10 rounded-2xl overflow-hidden w-20 h-20 p-2 flex items-center justify-center">
                                <img src="/logo.png" alt="SkyLounge" className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
                        <p className="text-gray-500 text-sm mt-1">SkyLounge Premium · Secured Access</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">Username</label>
                            <div className={`relative group flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 transition-all duration-300 ${focused === 'username' ? 'border-blue-500/60 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/20'}`}>
                                <User className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${focused === 'username' ? 'text-blue-400' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    required
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocused('username')}
                                    onBlur={() => setFocused('')}
                                    className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">Password</label>
                            <div className={`relative group flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 transition-all duration-300 ${focused === 'password' ? 'border-blue-500/60 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/20'}`}>
                                <Lock className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${focused === 'password' ? 'text-blue-400' : 'text-gray-500'}`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused('')}
                                    className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {/* Button gradient bg */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:from-blue-500 group-hover:to-indigo-500" />
                            {/* Shine sweep */}
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Authenticating…
                                    </>
                                ) : 'Sign In to Portal'}
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-gray-600 text-xs font-mono tracking-widest">BIOMETRIC SYSTEM ONLINE</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
