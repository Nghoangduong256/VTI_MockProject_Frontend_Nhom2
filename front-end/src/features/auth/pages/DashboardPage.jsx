import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import userService from "../../../services/userService";
import walletService from "../../../services/walletService";
import cardService from "../../../services/cardService";
import contactService from "../../../services/contactService";
import transactionService from "../../../services/transactionService";

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, walletRes, cardsRes, contactsRes, txRes] = await Promise.all([
                    userService.getProfile(),
                    walletService.getBalance(),
                    cardService.getCards(),
                    contactService.getFrequentContacts(),
                    transactionService.getTransactions(0, 5) // Get latest 5
                ]);

                setProfile(profileRes);
                setWallet(walletRes);
                setCards(cardsRes);
                setContacts(contactsRes);
                setTransactions(txRes.content || []);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // Optionally handle error state
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleTransfer = async () => {
        if (!selectedContact) {
            alert("Please select a contact");
            return;
        }
        if (!transferAmount || isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        try {
            await transactionService.transfer({
                toUserId: selectedContact.id,
                amount: parseFloat(transferAmount),
                note: "Quick Transfer"
            });
            alert("Transfer successful!");
            setTransferAmount("");
            setSelectedContact(null);
            // Refresh balance and transactions
            const [walletRes, txRes] = await Promise.all([
                walletService.getBalance(),
                transactionService.getTransactions(0, 5)
            ]);
            setWallet(walletRes);
            setTransactions(txRes.content || []);
        } catch (error) {
            console.error("Transfer failed:", error);
            alert("Transfer failed: " + (error.response?.data?.message || error.message));
        }
    };

    const handleAddCardSubmit = async (e) => {
        e.preventDefault();
        try {
            await cardService.createCard(newCard);
            alert("Card added successfully!");
            setShowAddCardModal(false);
            setNewCard({ cardNumber: "", holderName: "", expiryDate: "", cvv: "", type: "Debit", bankName: "" });
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
            await transactionService.deposit({
                type: 'topup',
                amount: parseFloat(topupData.amount),
                sourceCardId: topupData.sourceCardId
            });
            alert("Topup successful!");
            setShowTopupModal(false);
            setTopupData({ amount: "", sourceCardId: "" });
            const [walletRes, txRes] = await Promise.all([
                walletService.getBalance(),
                transactionService.getTransactions(0, 5)
            ]);
            setWallet(walletRes);
            setTransactions(txRes.content || []);
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
                            <h1 className="text-3xl font-bold text-text-main dark:text-white mb-1">Welcome back, {profile?.fullName?.split(' ')[0] || 'User'}! 👋</h1>
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
                            <button className="relative flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#1a2c22] border border-gray-200 dark:border-[#2a3c32] hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors">
                                <span className="material-symbols-outlined text-text-sub dark:text-gray-400">notifications</span>
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                            </button>
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
                                        <h2 className="text-4xl font-bold">${wallet?.balance?.toLocaleString() || '0.00'}</h2>
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
                                        <p className="text-lg font-semibold">+$12,340</p>
                                    </div>
                                    <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                        <p className="text-xs opacity-80 mb-1">Expense</p>
                                        <p className="text-lg font-semibold">-$5,670</p>
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
                                    {[65, 45, 80, 55, 90, 70, 60].map((height, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg hover:from-primary/80 hover:to-primary/40 transition-all cursor-pointer"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            <span className="text-xs text-text-sub dark:text-gray-400">
                                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                                            </span>
                                        </div>
                                    ))}
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
                                                    <p className="text-sm font-medium text-text-main dark:text-white">{tx.category || 'General'}</p>
                                                    <p className="text-xs text-text-sub dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
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
                                            key={contact.id || i}
                                            className="flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]"
                                            onClick={() => setSelectedContact(contact)}
                                        >
                                            <div
                                                className={`size-14 rounded-full bg-cover bg-center border-2 transition-all ${selectedContact?.id === contact.id ? 'border-primary ring-2 ring-primary/30' : 'border-transparent group-hover:border-primary'}`}
                                                style={{ backgroundImage: `url("${contact.avatarUrl || 'https://via.placeholder.com/100'}")` }}
                                            ></div>
                                            <p className={`text-xs transition-colors truncate w-full text-center ${selectedContact?.id === contact.id ? 'text-primary font-medium' : 'text-text-sub dark:text-gray-400 group-hover:text-primary'}`}>{contact.name}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-text-sub">No contacts</p>
                                    )}
                                </div>
                                <div className="space-y-3">
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