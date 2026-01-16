import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import userService from "../../../services/userService";
import walletService from "../../../services/walletService";
import cardService from "../../../services/cardService";
import contactService from "../../../services/contactService";
import TransferService from "../../../services/transfer/transferService";

export default function DashboardPage() {
    const [isDark, setIsDark] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [cards, setCards] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [transferAmount, setTransferAmount] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);

    // Phone search state
    const [phoneSearch, setPhoneSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [walletSummary, setWalletSummary] = useState({ income: 0, expense: 0 });
    const [spendingData, setSpendingData] = useState([]);

    // Notification state
    const [incomingTransactions, setIncomingTransactions] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // New State for Modals
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [newCard, setNewCard] = useState({
        cardNumber: "",
        holderName: "",
        expiryDate: "",
        cvv: "",
        type: "Debit",
        bankName: ""
    });
    const [topupData, setTopupData] = useState({
        amount: "",
        sourceCardId: ""
    });

    // Helper to refresh data
    // Helper to refresh data
    const refreshData = async () => {
        try {
            console.log("Fetching dashboard data...");

            // First fetch user to get wallet ID
            const currentUser = await userService.getCurrentUser();
            setProfile(currentUser);

            const walletId = currentUser?.wallet?.id;

            // Use Promise.allSettled to prevent one failure from blocking all data
            const results = await Promise.allSettled([
                walletService.getBalance(),
                cardService.getCards(),
                contactService.getFrequentContacts(),
                walletId ? TransferService.getTransferHistory(walletId, { page: 0, size: 10, filter: 'LAST_30_DAYS' }) : Promise.reject('No wallet ID'),
                walletService.getWalletSummary()
            ]);

            // Destructure results
            const [
                balanceStatsResult,
                cardsResult,
                contactsResult,
                transferHistoryResult,
                summaryResult
            ] = results;

            // Log errors for debugging
            results.forEach((res, index) => {
                if (res.status === 'rejected') {
                    console.error(`API call ${index} failed:`, res.reason);
                }
            });

            // Process Wallet
            let mergedWallet = { ...currentUser.wallet };
            if (balanceStatsResult.status === 'fulfilled') {
                const balanceStats = balanceStatsResult.value;
                mergedWallet.monthlyChangePercent = balanceStats.monthlyChangePercent;
                if (balanceStats.balance !== undefined && balanceStats.balance !== null) {
                    mergedWallet.balance = balanceStats.balance;
                }
            }
            console.log("Final Merged Wallet:", mergedWallet);
            setWallet(mergedWallet);

            // Process Cards
            if (cardsResult.status === 'fulfilled') {
                setCards(cardsResult.value);
            } else {
                console.warn("Cards failed to load");
            }

            // Process Contacts (fallback)
            if (contactsResult.status === 'fulfilled') {
                setContacts(contactsResult.value);
            }

            // Process Transfer History
            if (transferHistoryResult.status === 'fulfilled') {
                const historyData = transferHistoryResult.value;
                const txList = historyData.content || [];

                // CHỈ lấy các giao dịch thành công (success: true)
                const successfulTxs = txList.filter(tx => tx.success === true);

                // Set recent transactions (limit to 5 for dashboard) - CHỈ HIỂN THỊ GIAO DỊCH THÀNH CÔNG
                setTransactions(successfulTxs.slice(0, 5));

                // Extract incoming transactions for notifications - CHỈ LẤY GIAO DỊCH THÀNH CÔNG
                const incomingTxs = successfulTxs.filter(tx => tx.direction === 'IN' && tx.type === 'TRANSFER_IN');
                setIncomingTransactions(incomingTxs);

                // Extract unique recent contacts from TRANSFER_OUT transactions - CHỈ LẤY GIAO DỊCH THÀNH CÔNG
                const recentContactsMap = new Map();
                successfulTxs
                    .filter(tx => tx.direction === 'OUT' && tx.type === 'TRANSFER_OUT')
                    .forEach(tx => {
                        // Use note as identifier if available, otherwise use partnerName
                        const contactKey = tx.note || tx.partnerName;
                        if (!recentContactsMap.has(contactKey) && contactKey && contactKey !== 'Sent money') {
                            recentContactsMap.set(contactKey, {
                                id: tx.id,
                                name: tx.note || tx.partnerName,
                                avatarUrl: null,
                                phone: null,
                                userId: null,
                                lastTransactionDate: tx.createdAt,
                                amount: tx.amount
                            });
                        }
                    });

                // If no contacts from API, use transfer history contacts (limited functionality)
                if (contactsResult.status === 'rejected' && recentContactsMap.size > 0) {
                    const recentContactsList = Array.from(recentContactsMap.values()).slice(0, 5);
                    setContacts(recentContactsList);
                }

                // TÍNH TOÁN WALLET SUMMARY TỪ GIAO DỊCH THÀNH CÔNG
                const calculatedSummary = {
                    income: 0,
                    expense: 0
                };

                successfulTxs.forEach(tx => {
                    if (tx.direction === 'IN') {
                        calculatedSummary.income += tx.amount;
                    } else if (tx.direction === 'OUT') {
                        calculatedSummary.expense += tx.amount;
                    }
                });

                // Kết hợp với summary từ API (nếu có) hoặc chỉ dùng calculatedSummary
                let finalSummary = calculatedSummary;

                // Nếu muốn giữ summary từ API, comment dòng trên và sử dụng:
                // if (summaryResult.status === 'fulfilled') {
                //     finalSummary = summaryResult.value;
                // }

                setWalletSummary(finalSummary);

                // Process data for Spending Analytics (Last 7 days) - CHỈ TÍNH GIAO DỊCH THÀNH CÔNG
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Get last 7 days including today
                const last7DaysData = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    last7DaysData.push({
                        date: date,
                        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        spending: 0
                    });
                }

                // Calculate spending for each day (chỉ từ các giao dịch thành công)
                successfulTxs.forEach(tx => {
                    const txDate = new Date(tx.createdAt);
                    txDate.setHours(0, 0, 0, 0);

                    // Find matching day in last 7 days
                    const dayData = last7DaysData.find(d => d.date.getTime() === txDate.getTime());

                    if (dayData && tx.direction === 'OUT') {
                        dayData.spending += tx.amount;
                    }
                });

                // Find max spending for scaling
                const maxSpending = Math.max(...last7DaysData.map(d => d.spending), 1);

                // Convert to chart format with proper scaling
                const chartData = last7DaysData.map(day => ({
                    label: day.dayLabel,
                    value: (day.spending / maxSpending) * 100, // Percentage of max
                    amount: day.spending // Actual amount for tooltip
                }));

                setSpendingData(chartData);
            } else {
                // Nếu không có transfer history, vẫn xử lý summary từ API
                if (summaryResult.status === 'fulfilled') {
                    setWalletSummary(summaryResult.value);
                }
            }

        } catch (error) {
            console.error("Critical error in refreshData:", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await refreshData();
            setLoading(false);
        };
        init();
    }, []);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest('.notification-dropdown')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handlePhoneSearch = async () => {
        if (!phoneSearch || phoneSearch.trim().length < 10) {
            alert("Please enter a valid phone number (minimum 10 digits)");
            return;
        }

        setSearching(true);
        try {
            const results = await TransferService.getTargetWallets(phoneSearch.trim());
            setSearchResults(results);

            if (results.length === 0) {
                alert("No wallet found with this phone number");
            } else if (results.length === 1) {
                // Auto-select if only one result
                setSelectedContact({
                    userId: results[0].userId,
                    walletId: results[0].walletId,
                    fullName: results[0].fullName,
                    name: results[0].fullName,
                    phone: results[0].accountNumber
                });
            }
        } catch (error) {
            console.error("Phone search failed:", error);
            alert("Failed to search: " + (error.response?.data?.message || error.message));
        } finally {
            setSearching(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedContact || !selectedContact.userId) {
            alert("Please select a contact or search by phone number");
            return;
        }
        if (!transferAmount || isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        try {
            const result = await TransferService.transfer({
                toUserId: selectedContact.userId,
                amount: parseFloat(transferAmount),
                note: "Quick Transfer from Dashboard"
            });

            if (result.data?.success || result.data?.status === 'COMPLETED') {
                alert(`Transfer successful! \nSent $${transferAmount} to ${selectedContact.fullName || selectedContact.name}`);
                setTransferAmount("");
                setSelectedContact(null);
                setPhoneSearch("");
                setSearchResults([]);
                // Refresh data
                await refreshData();
            }
        } catch (error) {
            console.error("Transfer failed:", error);
            const errorMsg = error.response?.data?.note || error.response?.data?.message || error.message;
            alert("Transfer failed: " + errorMsg);
        }
    };

    const handleAddCardSubmit = async (e) => {
        e.preventDefault();
        try {
            await cardService.createCard(newCard);
            alert("Card added successfully!");
            setShowAddCardModal(false);
            setNewCard({ cardNumber: "", holderName: "", expiryDate: "", cvv: "", type: "Debit", bankName: "" });

            // Refresh cards list
            const cardsRes = await cardService.getCards();
            setCards(cardsRes);
        } catch (error) {
            console.error("Add card failed:", error);
            alert("Failed to add card: " + (error.response?.data?.message || error.message));
        }
    };

    const handleTopupSubmit = async (e) => {
        e.preventDefault();
        if (!topupData.amount || !topupData.sourceCardId) {
            alert("Please enter amount and select a card");
            return;
        }
        try {
            // Updated to use cardService.depositFromCard as per API requirement
            const res = await cardService.depositFromCard({
                cardId: topupData.sourceCardId,
                amount: parseFloat(topupData.amount),
                description: "Topup from Dashboard"
            });

            if (res.status === 'FAILED' || res.status === 'ERROR') {
                throw new Error(res.message || "Transaction failed");
            }

            alert("Topup successful!");
            setShowTopupModal(false);
            setTopupData({ amount: "", sourceCardId: "" });

            // Refresh data
            await refreshData();
        } catch (error) {
            console.error("Topup failed:", error);
            alert("Failed to topup: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className={`min-h-screen bg-background-light ${isDark ? "dark bg-background-dark" : ""} font-display text-text-main dark:text-white overflow-hidden`}>
            {/* Tailwind CDN + Config */}
            <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            tailwind.config = {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    primary: "#36e27b",
                    "background-light": "#f6f8f7",
                    "background-dark": "#112217",
                    "text-main": "#111714",
                    "text-sub": "#648772",
                  },
                  fontFamily: {
                    display: ["Spline Sans", "sans-serif"]
                  },
                  borderRadius: {
                    DEFAULT: "1rem",
                    lg: "2rem",
                    xl: "3rem",
                    full: "9999px"
                  }
                }
              }
            }
          `,
                }}
            />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <div className="flex h-screen w-full">
                {/* Sidebar */}
                <Sidebar activeRoute="dashboard" />

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-main dark:text-white mb-1">Welcome back, {profile?.fullName || 'User'}! 👋</h1>
                            <p className="text-text-sub dark:text-gray-400">Here's what's happening with your account today</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-[#1a2c22] px-4 py-2 rounded-full border border-gray-200 dark:border-[#2a3c32]">
                                <span className="material-symbols-outlined text-text-sub dark:text-gray-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-sm w-32 text-text-main dark:text-white placeholder:text-text-sub"
                                />
                            </div>
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#1a2c22] border border-gray-200 dark:border-[#2a3c32] hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors"
                            >
                                <span className="material-symbols-outlined text-text-sub dark:text-gray-400">
                                    {isDark ? "light_mode" : "dark_mode"}
                                </span>
                            </button>
                            {/* Notifications */}
                            <div className="relative notification-dropdown">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#1a2c22] border border-gray-200 dark:border-[#2a3c32] hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-text-sub dark:text-gray-400">notifications</span>
                                    {incomingTransactions.length > 0 && (
                                        <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {incomingTransactions.length}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1a2c22] border border-gray-200 dark:border-[#2a3c32] rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                                        <div className="p-4 border-b border-gray-200 dark:border-[#2a3c32]">
                                            <h3 className="font-bold text-text-main dark:text-white">Incoming Transactions</h3>
                                            <p className="text-xs text-text-sub dark:text-gray-400">Recent money received</p>
                                        </div>

                                        {incomingTransactions.length > 0 ? (
                                            <div className="divide-y divide-gray-100 dark:divide-[#2a3c32]">
                                                {incomingTransactions.slice(0, 5).map((tx) => (
                                                    <div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">arrow_downward</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-text-main dark:text-white truncate">
                                                                    {tx.partnerName || 'Received money'}
                                                                </p>
                                                                <p className="text-xs text-text-sub dark:text-gray-400 mt-0.5">
                                                                    {tx.note || 'No note'}
                                                                </p>
                                                                <p className="text-xs text-text-sub dark:text-gray-400 mt-1">
                                                                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                                    +${tx.amount.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">notifications_off</span>
                                                <p className="text-sm text-text-sub dark:text-gray-400">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#1a2c22] border border-gray-200 dark:border-[#2a3c32] hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-colors group"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined text-text-sub dark:text-gray-400 group-hover:text-red-500">logout</span>
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {/* Balance Card */}
                            <div className="bg-gradient-to-br from-primary via-emerald-400 to-teal-400 dark:from-primary/90 dark:via-emerald-500/90 dark:to-teal-500/90 rounded-xl p-8 text-text-main shadow-lg shadow-primary/20">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-sm opacity-80 mb-2">Total Balance</p>
                                        <h2 className="text-4xl font-bold">${(wallet?.availableBalance ?? wallet?.balance)?.toLocaleString() || '0.00'}</h2>
                                        <p className="text-xs opacity-70 mt-2 font-mono">Acc: {user?.phone || user?.username || '@user'}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="material-symbols-outlined text-3xl mb-1">account_balance</span>
                                        {wallet?.monthlyChangePercent && (
                                            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${wallet.monthlyChangePercent >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {wallet.monthlyChangePercent >= 0 ? '+' : ''}{wallet.monthlyChangePercent}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-xs opacity-80 mb-1">Income</p>
                                        <p className="text-lg font-semibold text-white">+$
                                            {walletSummary.income?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-xs opacity-80 mb-1">Expense</p>
                                        <p className="text-lg font-semibold text-white">-$
                                            {walletSummary.expense?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowTopupModal(true)} className="flex-1 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm rounded-lg p-4 flex flex-col justify-center items-center gap-1 group">
                                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_card</span>
                                        <span className="text-sm font-semibold">Top Up</span>
                                    </button>
                                    <button onClick={() => navigate('/receive-money')} className="flex-1 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm rounded-lg p-4 flex flex-col justify-center items-center gap-1 group">
                                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">qr_code_scanner</span>
                                        <span className="text-sm font-semibold">Receive</span>
                                    </button>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white dark:bg-[#1a2c22] rounded-xl p-6 border border-gray-100 dark:border-[#2a3c32]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-text-main dark:text-white">Spending Analytics</h3>
                                    <select className="bg-gray-50 dark:bg-[#25382e] border border-gray-200 dark:border-[#2a3c32] text-text-main dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50">
                                        <option>Last 7 days</option>
                                        <option>Last 30 days</option>
                                        <option>Last 90 days</option>
                                    </select>
                                </div>
                                <div className="h-64 flex items-end justify-around gap-2">
                                    {spendingData.length > 0 ? spendingData.map((item, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div
                                                className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg hover:from-primary/80 hover:to-primary/40 transition-all cursor-pointer relative"
                                                style={{ height: `${item.value || 5}%`, minHeight: item.value > 0 ? '8px' : '2px' }}
                                                title={`${item.label}: $${item.amount?.toLocaleString() || '0'}`}
                                            >
                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    ${item.amount?.toLocaleString() || '0'}
                                                </div>
                                            </div>
                                            <span className="text-xs text-text-sub dark:text-gray-400">
                                                {item.label}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="w-full text-center py-8">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2 block">trending_up</span>
                                            <p className="text-sm text-text-sub dark:text-gray-400">No spending data</p>
                                            <p className="text-xs text-text-sub dark:text-gray-500 mt-1">Make transactions to see analytics</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white dark:bg-[#1a2c22] rounded-xl p-6 border border-gray-100 dark:border-[#2a3c32]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-text-main dark:text-white">Recent Transactions</h3>
                                    <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">View All</a>
                                </div>
                                <div className="space-y-4">
                                    {transactions.length > 0 ? transactions.map((tx, i) => (
                                        <div key={tx.id || i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`size-11 rounded-full flex items-center justify-center ${tx.direction === 'IN' ? 'bg-green-50 dark:bg-green-500/10 text-green-500' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                                                    <span className="material-symbols-outlined text-xl">{tx.direction === 'IN' ? 'arrow_downward' : 'arrow_upward'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-main dark:text-white">{tx.partnerName || tx.type || 'Transfer'}</p>
                                                    <p className="text-xs text-text-sub dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <p className={`text-sm font-semibold ${tx.direction === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                                                {tx.direction === 'IN' ? '+' : '-'}${tx.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    )) : (
                                        <p className="text-center text-text-sub">No recent transactions</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* My Cards */}
                            <div className="bg-white dark:bg-[#1a2c22] rounded-xl p-6 border border-gray-100 dark:border-[#2a3c32]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-text-main dark:text-white">My Cards</h3>
                                    <button onClick={() => setShowAddCardModal(true)} className="text-sm text-primary hover:text-primary/80 transition-colors">+ Add</button>
                                </div>
                                <div className="space-y-3">
                                    {cards.length > 0 ? cards.map((card, index) => (
                                        <div key={card.id || index} className={`bg-gradient-to-br ${index === 0 ? 'from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white' : 'from-primary to-emerald-400 dark:from-primary/90 dark:to-emerald-500/90 text-text-main'} rounded-xl p-5 relative overflow-hidden`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                                            <div className="relative z-10">
                                                <p className="text-xs opacity-70 mb-1">{card.type} Card</p>
                                                <p className="text-2xl font-bold mb-6">**** {card.last4}</p>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs opacity-70 mb-1">Card Holder</p>
                                                        <p className="text-sm font-mono">{card.holderName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs opacity-70 mb-1">Bank</p>
                                                        <p className="text-sm">{card.bankName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-text-sub">No cards linked</p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Transfer */}
                            <div className="bg-white dark:bg-[#1a2c22] rounded-xl p-6 border border-gray-100 dark:border-[#2a3c32]">
                                <h3 className="text-lg font-semibold text-text-main dark:text-white mb-4">Quick Transfer</h3>
                                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                                    {contacts.length > 0 ? contacts.map((contact, i) => (
                                        <div
                                            key={contact.userId || contact.id || i}
                                            className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]"
                                            onClick={() => setSelectedContact(contact)}
                                        >

                                            {/* Phone number if available */}
                                            {contact.phone && (
                                                <p className="text-[10px] text-text-sub dark:text-gray-500 truncate w-full text-center">
                                                    {contact.phone}
                                                </p>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="w-full text-center py-4"></div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {/* Phone Search */}
                                    <div>
                                        <label className="text-sm text-text-sub dark:text-gray-400 mb-2 block">Search by Phone Number</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="tel"
                                                value={phoneSearch}
                                                onChange={(e) => setPhoneSearch(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handlePhoneSearch()}
                                                placeholder="Enter phone number"
                                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-[#2a3c32] bg-gray-50 dark:bg-[#25382e] text-text-main dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                            <button
                                                onClick={handlePhoneSearch}
                                                disabled={searching || !phoneSearch}
                                                className="px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-medium rounded-lg transition-all"
                                            >
                                                {searching ? (
                                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                ) : (
                                                    <span className="material-symbols-outlined">search</span>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-[#25382e] rounded-lg p-3 border border-gray-200 dark:border-[#2a3c32]">
                                            <p className="text-xs text-text-sub dark:text-gray-400 mb-2">Search Results:</p>
                                            <div className="space-y-2">
                                                {searchResults.map((result) => (
                                                    <div
                                                        key={result.walletId}
                                                        onClick={() => {
                                                            setSelectedContact({
                                                                userId: result.userId,
                                                                walletId: result.walletId,
                                                                fullName: result.fullName,
                                                                name: result.fullName,
                                                                phone: result.accountNumber
                                                            });
                                                            setSearchResults([]);
                                                        }}
                                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedContact?.userId === result.userId
                                                            ? 'bg-primary/20 border-2 border-primary'
                                                            : 'bg-white dark:bg-[#1a2c22] hover:bg-gray-100 dark:hover:bg-[#2a3c32] border border-gray-200 dark:border-[#3a4c42]'
                                                            }`}
                                                    >
                                                        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-text-main font-bold">
                                                            {result.fullName[0].toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-text-main dark:text-white">{result.fullName}</p>
                                                            <p className="text-xs text-text-sub dark:text-gray-400">{result.accountNumber}</p>
                                                        </div>
                                                        {selectedContact?.userId === result.userId && (
                                                            <span className="material-symbols-outlined text-primary">check_circle</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Contact Display */}
                                    {selectedContact && selectedContact.userId && (
                                        <div className="bg-primary/10 border-2 border-primary rounded-lg p-3">
                                            <p className="text-xs text-text-sub dark:text-gray-400 mb-1">Sending to:</p>
                                            <div className="flex items-center gap-2">
                                                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-text-main font-bold text-sm">
                                                    {(selectedContact.fullName || selectedContact.name)[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-text-main dark:text-white">{selectedContact.fullName || selectedContact.name}</p>
                                                    {selectedContact.phone && (
                                                        <p className="text-xs text-text-sub dark:text-gray-400">{selectedContact.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm text-text-sub dark:text-gray-400 mb-2 block">Amount</label>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#25382e] rounded-lg px-4 py-3 border border-gray-200 dark:border-[#2a3c32]">
                                            <span className="text-text-main dark:text-white font-medium">$</span>
                                            <input
                                                type="number"
                                                value={transferAmount}
                                                onChange={(e) => setTransferAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="bg-transparent border-none outline-none flex-1 text-text-main dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleTransfer}
                                        disabled={!selectedContact || !transferAmount}
                                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-medium py-3 rounded-lg transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                                    >
                                        Send {transferAmount ? `$${transferAmount}` : 'Money'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {/* Modals */}
            {showAddCardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1a2c22] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-[#2a3c32]">
                        <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Add New Card</h3>
                        <form onSubmit={handleAddCardSubmit} className="flex flex-col gap-4">
                            <input
                                placeholder="Card Number"
                                className="form-input rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                                value={newCard.cardNumber}
                                onChange={e => setNewCard({ ...newCard, cardNumber: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Holder Name"
                                className="form-input rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                                value={newCard.holderName}
                                onChange={e => setNewCard({ ...newCard, holderName: e.target.value })}
                                required
                            />
                            <div className="flex gap-4">
                                <input
                                    placeholder="Expiry (MM/YY)"
                                    className="form-input rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 flex-1"
                                    value={newCard.expiryDate}
                                    onChange={e => setNewCard({ ...newCard, expiryDate: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="CVV"
                                    className="form-input rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 w-24"
                                    value={newCard.cvv}
                                    onChange={e => setNewCard({ ...newCard, cvv: e.target.value })}
                                    required
                                />
                            </div>
                            <select
                                className="form-select rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                                value={newCard.type}
                                onChange={e => setNewCard({ ...newCard, type: e.target.value })}
                            >
                                <option value="Debit">Debit</option>
                                <option value="Credit">Credit</option>
                            </select>
                            <input
                                placeholder="Bank Name"
                                className="form-input rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                                value={newCard.bankName}
                                onChange={e => setNewCard({ ...newCard, bankName: e.target.value })}
                                required
                            />
                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setShowAddCardModal(false)} className="px-5 py-2.5 rounded-xl text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-text-main font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Add Card</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTopupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1a2c22] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-[#2a3c32]">
                        <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Top Up Wallet</h3>
                        <form onSubmit={handleTopupSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Amount</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    className="w-full form-input rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                                    value={topupData.amount}
                                    onChange={e => setTopupData({ ...topupData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Source Card</label>
                                <select
                                    className="w-full form-select rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                                    value={topupData.sourceCardId}
                                    onChange={e => setTopupData({ ...topupData, sourceCardId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a card</option>
                                    {cards.map(card => (
                                        <option key={card.id} value={card.id}>{card.bankName} - {card.last4}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setShowTopupModal(false)} className="px-5 py-2.5 rounded-xl text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={!topupData.sourceCardId} className="px-5 py-2.5 rounded-xl bg-primary text-text-main font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50">Top Up</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}