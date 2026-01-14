import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import walletService from '../../../services/walletService';
import { useAuth } from '../context/AuthContext';
import SidebarAdmin from '../../../components/common/SidebarAdmin';

export default function AdminWalletPage() {
    const navigate = useNavigate();
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination (Client-side now since we fetch 1000)
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10); // Display 10 per page

    // Fetch large batch for client-side search
    const FETCH_SIZE = 1000;

    useEffect(() => {
        fetchWallets();
    }, []); // Run once

    const fetchWallets = async () => {
        try {
            setLoading(true);
            const data = await walletService.getAllWallets(0, FETCH_SIZE);
            // Check if response is array or page object
            const list = Array.isArray(data) ? data : (data.content || []);
            setWallets(list);
        } catch (err) {
            console.error("Failed to fetch wallets", err);
            setError("Failed to load wallets.");
            setWallets([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredWallets = wallets.filter(wallet => {
        const term = searchText.toLowerCase().trim();
        const matchesSearch =
            !term ||
            (wallet.id && wallet.id.toString().includes(term)) ||
            (wallet.userId && wallet.userId.toString().includes(term)) ||
            (wallet.accountNumber && wallet.accountNumber.toLowerCase().includes(term));

        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && wallet.status === 'ACTIVE') ||
            (statusFilter === 'LOCKED' && (wallet.status === 'LOCKED' || wallet.status === 'FROZEN')) ||
            wallet.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const pageCount = Math.ceil(filteredWallets.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentWallets = filteredWallets.slice(offset, offset + itemsPerPage);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-GB');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
            case 'INACTIVE':
            case 'LOCKED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleLockUnlock = async (wallet) => {
        if (!wallet || !wallet.id) return;
        const isLocked = wallet.status === 'FROZEN' || wallet.status === 'LOCKED';
        const action = isLocked ? 'Unlock' : 'Lock';

        if (!window.confirm(`Are you sure you want to ${action} wallet ${wallet.accountNumber}?`)) {
            return;
        }

        try {
            if (isLocked) {
                await walletService.unlockWallet(wallet.id);
            } else {
                await walletService.lockWallet(wallet.id);
            }
            // Refresh list
            fetchWallets();
        } catch (err) {
            console.error(`Failed to ${action} wallet`, err);
            alert(`Failed to ${action} wallet. Please try again.`);
        }
    };

    const isLocked = (status) => status === 'FROZEN' || status === 'LOCKED';

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
            <SidebarAdmin />

            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark h-screen overflow-y-auto w-full">
                <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">Wallet Management</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Admin</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-2"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </header>

                <div className="p-8 space-y-8 pb-20">
                    {/* FILTERS */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
                        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
                            {/* SEARCH */}
                            <div className="flex-1">
                                <label className="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Search by ID, UserID, Account
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        search
                                    </span>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-12 pl-11 pr-4 focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                        placeholder="Enter ID, User ID or Account Number..."
                                        value={searchText}
                                        onChange={(e) => {
                                            setSearchText(e.target.value);
                                            setCurrentPage(0);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* STATUS FILTER */}
                            {/* STATUS FILTER - Copy style từ phần không lỗi */}
                            <div className="space-y-1.5 w-full sm:w-48">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="LOCKED">Locked / Frozen</option>
                                </select>
                            </div>
                        </div>
                        {/* RESET */}
                        <div className="flex items-end h-full pt-6">
                            <button
                                onClick={() => {
                                    setSearchText('');
                                    setStatusFilter('ALL');
                                    setCurrentPage(0);
                                }}
                                className="h-12 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Account Number</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">User ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Balance</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Created At</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">Loading...</td>
                                        </tr>
                                    ) : currentWallets.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">No wallets found matching your criteria.</td>
                                        </tr>
                                    ) : (
                                        currentWallets.map((wallet) => (
                                            <tr key={wallet.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-sm text-slate-500">{wallet.id}</td>
                                                <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900 dark:text-slate-200">{wallet.accountNumber}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{wallet.userId}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-right text-slate-900 dark:text-white">
                                                    {formatCurrency(wallet.availableBalance)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(wallet.status)}`}>
                                                        {wallet.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    {formatDate(wallet.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleLockUnlock(wallet)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isLocked(wallet.status)
                                                            ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                            }`}
                                                    >
                                                        {isLocked(wallet.status) ? 'Unlock' : 'Lock'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination controls */}
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                className="px-3 py-1 rounded border disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm">Page {currentPage + 1} of {pageCount || 1}</span>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= pageCount - 1}
                                className="px-3 py-1 rounded border disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
