import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import transactionService from '../../../services/transactionService';
import { useAuth } from '../context/AuthContext';

export default function AdminTransactionHistoryPage() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [displayedTransactions, setDisplayedTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchId, setSearchId] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [typeFilter, setTypeFilter] = useState('All Types');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [transactions, searchId, statusFilter, typeFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getAllAdminTransactions();

            // Ensure data is an array
            const txnList = Array.isArray(data) ? data : [];

            // Sort by Date DESC (newest first) if possible
            // Assuming createdAt is ISO string
            txnList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTransactions(txnList);
        } catch (err) {
            console.error("Failed to fetch admin transactions", err);
            setError("Failed to load transactions.");
            // Set empty if fail
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };



    const applyFilters = () => {
        let filtered = [...transactions];

        // Filter by Search ID (Transaction ID or Wallet ID)
        if (searchId.trim()) {
            const term = searchId.toLowerCase().trim();
            filtered = filtered.filter(t =>
                (t.transactionId && t.transactionId.toLowerCase().includes(term)) ||
                (t.walletId && t.walletId.toLowerCase().includes(term))
            );
        }

        // Filter by Status
        if (statusFilter !== 'All Status') {
            const statusMap = {
                'Complete': 'COMPLETED',
                'Pending': 'PENDING',
                'Failed': 'FAILED'
            };
            const targetStatus = statusMap[statusFilter] || statusFilter.toUpperCase();
            filtered = filtered.filter(t => t.status === targetStatus);
        }

        // Filter by Type
        if (typeFilter !== 'All Types') {
            const typeMap = {
                'Deposit': 'DEPOSIT',
                'Withdraw': 'WITHDRAW',
                'Transfer In': 'TRANSFER_IN', // Adjust if API returns different enum
                'Transfer Out': 'TRANSFER_OUT' // Adjust if API returns different enum
            };
            // Note: API might return DEPOSIT, WITHDRAW, TRANSFER... 
            // We need to match loosely or strictly. Let's assume strict for now.
            // If Type in filter is "Transfer In", we look for generic TRANSFER or refine if API has specific direction.
            // Based on user request/mock: "Transfer In", "Transfer Out"
            // Backend commonly might just say "TRANSFER" + sender/receiver check.
            // But if API returns exact "TRANSFER_IN" etc., we use map.
            // Let's partial match nicely or check if data.type exists.

            // Adjusting logic for common cases:
            const targetKey = typeMap[typeFilter];
            if (targetKey) {
                filtered = filtered.filter(t => t.type === targetKey);
            }
        }

        setDisplayedTransactions(filtered);
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    const handleResetFilters = () => {
        setSearchId('');
        setStatusFilter('All Status');
        setTypeFilter('All Types');
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = displayedTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(displayedTransactions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Helper for currency format
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Helper for date format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
            case 'FAILED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-600 dark:bg-green-400';
            case 'PENDING':
                return 'bg-amber-600 dark:bg-amber-400';
            case 'FAILED':
                return 'bg-red-600 dark:bg-red-400';
            default:
                return 'bg-slate-600';
        }
    };

    const getTypeIcon = (type, amount) => {
        // Icon mapping
        if (type === 'DEPOSIT') return 'south_west'; // Money coming in
        if (type === 'WITHDRAW') return 'north_east'; // Money going out
        return 'sync_alt';
    };

    const getTypeColor = (type, amount) => {
        if (type === 'WITHDRAW') return 'text-red-500';
        if (type === 'DEPOSIT') return 'text-primary';
        return 'text-slate-400';
    };

    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
            {/* Side Navigation Bar - Mock Static for now or reuse existing Sidebar if componentized. 
                Since User gave full HTML including Sidebar, I will render it here as requested 
                OR better: reuse layout. But user request implies "Create a screen... serving admin".
                I will include the sidebar structure from the HTML for fidelity to the specific request.
            */}
            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 hidden lg:flex">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-primary size-10 rounded-xl flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">account_balance_wallet</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[#121617] dark:text-white text-base font-bold leading-tight">E-Wallet Admin</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Financial Management</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1">
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm font-semibold">Dashboard</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary" href="#">
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="text-sm font-bold">Transactions</span>
                        </a>
                        {/* Other links... */}
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-sm font-semibold">Users</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" href="#">
                            <span className="material-symbols-outlined">account_balance</span>
                            <span className="text-sm font-semibold">Wallets</span>
                        </a>
                    </nav>
                </div>
                {/* System Status Mock */}
                <div className="mt-auto p-6">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm font-semibold dark:text-slate-200">Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark h-screen overflow-y-auto w-full">
                {/* Top Navigation Bar */}
                <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">Transaction History</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button className="size-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            {/* Mobile Menu Toggle could go here */}
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Admin</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">System Administrator</p>
                            </div>
                            <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-500">person</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors ml-2"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 space-y-8 pb-20">
                    {/* Filter Section */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary">filter_list</span>
                            <h4 className="text-slate-900 dark:text-white font-bold">Filter Transactions</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search ID</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                    <input
                                        className="w-full pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10"
                                        placeholder="TXN or Wallet ID"
                                        type="text"
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option>All Status</option>
                                    <option>Complete</option>
                                    <option>Pending</option>
                                    <option>Failed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option>All Types</option>
                                    <option>Deposit</option>
                                    <option>Withdraw</option>
                                    <option>Transfer In</option>
                                    <option>Transfer Out</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors h-10"
                                    onClick={applyFilters}
                                >
                                    Apply Filters
                                </button>
                                <button
                                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 w-10 flex items-center justify-center"
                                    onClick={handleResetFilters}
                                >
                                    <span className="material-symbols-outlined">restart_alt</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">STT</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Transaction ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Wallet ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Created At</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                    <span>Loading transactions...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                                No transactions found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentItems.map((txn, index) => (
                                            <tr key={txn.transactionId || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-500 w-16">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900 dark:text-slate-200">
                                                    {txn.transactionId}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {txn.walletId}
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-extrabold text-right ${txn.amount >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                                                    {txn.amount >= 0 ? '' : ''}{formatCurrency(txn.amount)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(txn.status)}`}>
                                                        <span className={`size-1.5 rounded-full ${getStatusDotColor(txn.status)}`}></span>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`flex items-center gap-2 text-sm font-medium ${getTypeColor(txn.type, txn.amount)}`}>
                                                        <span className="material-symbols-outlined text-lg">{getTypeIcon(txn.type, txn.amount)}</span>
                                                        {txn.type}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    {formatDate(txn.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayedTransactions.length)} of {displayedTransactions.length} results
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                                </button>

                                {/* Simple Pagination Numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Handle logic for displaying page numbers smartly if many pages (e.g., 1, 2, ... 10)
                                    // For simplicity in this iteration: show first 5 or sliding window
                                    let p = i + 1;
                                    if (totalPages > 5) {
                                        if (currentPage > 3) {
                                            p = currentPage - 2 + i;
                                        }
                                        if (p > totalPages) return null;
                                    }

                                    return (
                                        <button
                                            key={p}
                                            onClick={() => paginate(p)}
                                            className={`size-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${currentPage === p
                                                ? 'bg-primary text-white'
                                                : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
