import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Users, LogOut, CheckCircle, XCircle, ShieldCheck, TrendingUp, Clock, UserPlus, AlertCircle } from 'lucide-react';
import api from '../api';

function Dashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, granted: 0, denied: 0, spoof: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const clock = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(clock);
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs?limit=50');
            setLogs(response.data.logs);
            setStats(response.data.stats);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const recentLogs = logs.slice(0, 20);

    const StatCard = ({ icon: Icon, label, value, color, glow }) => (
        <div className={`relative bg-gray-950/60 border rounded-2xl p-5 backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${color}`}>
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glow} blur-2xl`} />
            <div className="relative">
                <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color.replace('border-', 'bg-').replace('/30', '/10')}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020817] flex text-gray-100">

            {/* Sidebar */}
            <div className="w-64 bg-gray-950/80 border-r border-white/5 backdrop-blur-xl flex flex-col h-screen sticky top-0 relative overflow-hidden">
                {/* Sidebar top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
                {/* Sidebar glow orb */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="px-6 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/40 rounded-xl blur-md" />
                            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white tracking-wider">SKYLOUNGE</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Clock */}
                <div className="px-6 py-4 border-b border-white/5">
                    <p className="text-2xl font-mono text-white font-semibold">{currentTime.toLocaleTimeString('en-IN')}</p>
                    <p className="text-xs text-gray-500">{currentTime.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <Link to="/dashboard" className="flex items-center gap-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-2.5 rounded-xl text-sm font-medium">
                        <Activity className="w-4 h-4" /> Live Monitor
                    </Link>
                    <Link to="/register" className="flex items-center gap-3 text-gray-400 hover:bg-white/5 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
                        <UserPlus className="w-4 h-4" /> Register Member
                    </Link>
                </nav>

                {/* Logout */}
                <div className="px-4 py-4 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 text-gray-500 hover:text-red-400 hover:bg-red-500/5 px-4 py-2.5 rounded-xl text-sm transition-all">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 overflow-y-auto relative">

                {/* === Rich Background Layers === */}
                {/* Deep ambient orbs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-100px] left-[200px] w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[100px]" />
                    <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-cyan-700/5 rounded-full blur-3xl" />
                </div>
                {/* Dot grid */}
                <div className="fixed inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                {/* Horizontal glowing lines */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                </div>

                <div className="relative p-8">

                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Live Access Monitor</h1>
                            <p className="text-gray-500 text-sm mt-1">Real-time biometric verification feed · Terminal 2</p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-xs font-mono">SYSTEM LIVE</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <StatCard icon={Activity} label="Total Scans" value={stats.total} color="border-blue-500/30 text-blue-400" glow="bg-blue-500/10" />
                        <StatCard icon={CheckCircle} label="Access Granted" value={stats.granted} color="border-green-500/30 text-green-400" glow="bg-green-500/10" />
                        <StatCard icon={XCircle} label="Access Denied" value={stats.denied} color="border-red-500/30 text-red-400" glow="bg-red-500/10" />
                        <StatCard icon={AlertCircle} label="Spoof Attacks" value={stats.spoof} color="border-orange-500/30 text-orange-400" glow="bg-orange-500/10" />
                    </div>

                    {/* Table */}
                    <div className="bg-gray-950/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-white">Recent Activity</span>
                            </div>
                            <span className="text-xs text-gray-500">Auto-refreshing every 5s</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-blue-400 animate-spin" />
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-600 text-xs uppercase tracking-widest border-b border-white/5">
                                        <th className="px-6 py-3 font-medium">Timestamp</th>
                                        <th className="px-6 py-3 font-medium">Member ID</th>
                                        <th className="px-6 py-3 font-medium">Confidence</th>
                                        <th className="px-6 py-3 text-right font-medium">Clearance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-12 text-gray-600 text-sm">
                                                No activity logged yet. System is scanning…
                                            </td>
                                        </tr>
                                    ) : recentLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                                {new Date(log.timestamp).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white text-sm">
                                                {log.member_id === 'unknown' ? (
                                                    <span className="text-gray-600 italic">Unidentified</span>
                                                ) : log.member_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.status === 'granted' ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 max-w-[100px] h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${(log.confidence * 100).toFixed(0)}%` }} />
                                                        </div>
                                                        <span className="text-xs text-green-400 font-mono">{(log.confidence * 100).toFixed(1)}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-600">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {log.status === 'granted' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                        <CheckCircle className="w-3 h-3" /> Granted
                                                    </span>
                                                ) : log.status === 'spoof' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                        <AlertCircle className="w-3 h-3" /> Spoof
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                        <XCircle className="w-3 h-3" /> Denied
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
