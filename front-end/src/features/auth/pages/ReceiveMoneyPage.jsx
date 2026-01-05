import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../../../components/Sidebar";
import userService from "../services/profile/userService";
import walletService from "../../../services/walletService";
import qrService from "../../../services/qrService";
import transactionService from "../../../services/transactionService";

export default function ReceiveMoneyPage() {
    const [isDark, setIsDark] = useState(false);
    const { logout } = useAuth();

    const [profile, setProfile] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAmountModal, setShowAmountModal] = useState(false);
    const [customAmount, setCustomAmount] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            console.log("🔄 Fetching project data...");
            try {
                // Fetch each separately to be more resilient
                try {
                    const profileRes = await userService.getProfile();
                    setProfile(profileRes);
                    console.log("✅ Profile loaded");
                } catch (e) { console.error("❌ Profile API failed:", e); }

                try {
                    let walletRes;
                    try {
                        walletRes = await walletService.getWalletInfo();
                    } catch (e) {
                        console.warn("⚠️ /api/wallet/me failed, trying /api/me as fallback...");
                        const meRes = await userService.getCurrentUser();
                        walletRes = meRes.wallet;
                        // Map internal schema to expected schema if needed
                        if (walletRes && !walletRes.accountNumber) {
                            walletRes.accountNumber = meRes.phone;
                        }
                    }
                    setWallet(walletRes);
                    console.log("✅ Wallet info loaded:", walletRes);
                } catch (e) { console.error("❌ Wallet info API failed completely:", e); }

                try {
                    console.log("🔄 Fetching QR Code...");
                    const qrRes = await qrService.getWalletQR();
                    setQrCode(qrRes);
                    console.log("✅ QR Code loaded");
                } catch (e) {
                    console.error("❌ QR API failed. Please check if /api/qr/wallet is implemented as GET.", e);
                }

                try {
                    console.log("🔄 Fetching incoming transactions...");
                    let txRes;
                    try {
                        txRes = await transactionService.getIncomingTransactions(5);
                    } catch (e) {
                        console.warn("⚠️ /api/transactions/incoming failed, trying general /api/transactions as fallback...");
                        const generalTx = await transactionService.getTransactions(0, 5);
                        // Filter for incoming if we have direction field
                        txRes = (generalTx.content || generalTx).filter(tx => tx.direction === 'IN' || tx.type === 'TRANSFER_IN' || tx.type === 'DEPOSIT');
                    }
                    setTransactions(txRes);
                    console.log("✅ Transactions loaded");
                } catch (e) { console.error("❌ Transactions API failed completely:", e); }

            } catch (error) {
                console.error("Critical error in fetchData:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCopyAddress = () => {
        if (wallet?.accountNumber) {
            navigator.clipboard.writeText(wallet.accountNumber);
            alert("Wallet address copied!");
        }
    };

    const handleDownloadQR = async () => {
        try {
            const blob = await qrService.downloadWalletQR();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wallet-qr-${wallet?.walletId || 'code'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading QR:", error);
            alert("Failed to download QR code");
        }
    };

    const handleSetAmount = async () => {
        if (!customAmount || isNaN(customAmount) || parseFloat(customAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        try {
            const qrRes = await qrService.getWalletQRWithAmount(parseFloat(customAmount));
            setQrCode(qrRes);
            setShowAmountModal(false);
            setCustomAmount("");
        } catch (error) {
            console.error("Error generating QR with amount:", error);
            alert("Failed to generate QR code");
        }
    };

    const handleShare = async () => {
        if (navigator.share && qrCode) {
            try {
                await navigator.share({
                    title: 'My Wallet QR Code',
                    text: `Scan this QR code to send money to ${profile?.fullName || 'me'}`,
                    url: window.location.href
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            alert("Sharing not supported on this device");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-text-sub dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

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
                    display: ["Manrope", "sans-serif"]
                  },
                  borderRadius: {
                    DEFAULT: "0.25rem",
                    lg: "0.5rem",
                    xl: "0.75rem",
                    full: "9999px"
                  }
                }
              }
            }
          `,
                }}
            />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <div className="flex h-screen w-full">
                {/* Sidebar */}
                <Sidebar activeRoute="receive" />

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a2c22] border-b border-[#e6ece9] dark:border-[#2a3c32]">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">qr_code_2</span>
                            <span className="font-bold text-lg">Receive</span>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 p-6 md:p-10 xl:p-14 max-w-[1400px] mx-auto w-full">
                        {/* Header with Dark Mode Toggle */}
                        <div className="flex justify-between items-start mb-10">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-[#111714] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em]">
                                    Receive Money
                                </h2>
                                <p className="text-[#648772] dark:text-[#93b3a2] text-base font-normal">
                                    Share your QR code to receive payments instantly.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-[#1a2c22] border border-gray-200 dark:border-[#2a3c32] hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors"
                            >
                                <span className="material-symbols-outlined text-text-sub dark:text-gray-400">
                                    {isDark ? "light_mode" : "dark_mode"}
                                </span>
                            </button>
                        </div>

                        <div className="flex flex-col xl:flex-row gap-8 items-start">
                            {/* LEFT COLUMN: QR Card & Actions */}
                            <div className="w-full xl:flex-1 flex flex-col items-center xl:items-start gap-8">
                                {/* The QR Card */}
                                <div className="group relative flex flex-col items-center w-full max-w-[420px] bg-white dark:bg-[#1a2c22] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-[#e6ece9] dark:border-[#2a3c32] overflow-hidden">
                                    {/* Card Decoration Top */}
                                    <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#f0fdf4] to-transparent dark:from-[#112117] dark:to-transparent opacity-80 z-0"></div>

                                    <div className="relative z-10 flex flex-col items-center w-full p-8 pb-10">
                                        {/* Profile Badge */}
                                        <div className="flex flex-col items-center gap-3 mb-6">
                                            <div className="relative">
                                                <div
                                                    className="size-20 bg-cover bg-center rounded-full border-[3px] border-white dark:border-[#1a2c22] shadow-sm"
                                                    style={{ backgroundImage: `url("${profile?.avatarUrl || 'https://via.placeholder.com/150'}")` }}
                                                />
                                                <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full border-2 border-white dark:border-[#1a2c22] flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[14px] font-bold text-[#111714]">check</span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-xl font-bold text-[#111714] dark:text-white tracking-tight">
                                                    {wallet?.accountName || profile?.fullName || 'User'}
                                                </h3>
                                                <p className="text-sm text-[#648772] dark:text-[#93b3a2]">
                                                    Wallet ID: {wallet?.walletId || '@wallet'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* QR Area */}
                                        <div className="relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 group-hover:scale-[1.02] transition-transform duration-300 ease-out">
                                            {qrCode ? (
                                                <img
                                                    alt="Personal QR Code"
                                                    className="size-52 md:size-60"
                                                    src={typeof qrCode === 'string' && qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                                                />
                                            ) : (
                                                <div className="size-52 md:size-60 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                                                    <span className="text-text-sub">No QR Code</span>
                                                </div>
                                            )}
                                            {/* Scan me helper */}
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#111714] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                                                SCAN ME
                                            </div>
                                        </div>

                                        {/* Copy Address Field */}
                                        <div className="w-full">
                                            <label className="block text-xs font-bold text-[#648772] dark:text-[#93b3a2] mb-1.5 ml-1 uppercase tracking-wider">
                                                Account Number
                                            </label>
                                            <div className="flex items-center justify-between gap-3 p-3 bg-[#f6f8f7] dark:bg-[#24362c] rounded-xl border border-transparent hover:border-primary/30 transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                                        <span className="material-symbols-outlined text-[20px]">wallet</span>
                                                    </div>
                                                    <span className="font-mono text-sm text-[#111714] dark:text-white truncate">
                                                        {wallet?.accountNumber || profile?.phone || 'N/A'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={handleCopyAddress}
                                                    className="p-2 text-[#648772] dark:text-[#93b3a2] hover:text-[#111714] dark:hover:text-white hover:bg-white dark:hover:bg-[#2a3c32] rounded-lg transition-all"
                                                    title="Copy Address"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[420px]">
                                    <button
                                        onClick={handleDownloadQR}
                                        className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-primary text-[#111714] font-bold text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">download</span>
                                        Save Img
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-white dark:bg-[#1a2c22] border border-[#e6ece9] dark:border-[#2a3c32] text-[#111714] dark:text-white font-bold text-sm hover:bg-[#f6f8f7] dark:hover:bg-[#24362c] transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">share</span>
                                        Share
                                    </button>
                                    <button
                                        onClick={() => setShowAmountModal(true)}
                                        className="flex items-center justify-center gap-2 h-12 px-4 rounded-xl bg-white dark:bg-[#1a2c22] border border-[#e6ece9] dark:border-[#2a3c32] text-[#111714] dark:text-white font-bold text-sm hover:bg-[#f6f8f7] dark:hover:bg-[#24362c] transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                        Set Amount
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Recent Transactions Widget */}
                            <div className="w-full xl:w-[380px] flex flex-col gap-6">
                                {/* Transaction List Widget */}
                                <div className="bg-white dark:bg-[#1a2c22] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e6ece9] dark:border-[#2a3c32]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-[#111714] dark:text-white">Recent Incoming</h3>
                                        <a className="text-xs font-bold text-primary hover:text-[#2bc465] flex items-center gap-1" href="#">
                                            View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        </a>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {transactions && transactions.length > 0 ? (
                                            transactions.map((tx, index) => (
                                                <div
                                                    key={tx.id || index}
                                                    className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-[#f6f8f7] dark:hover:bg-[#24362c] transition-colors group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`size-10 rounded-full ${tx.type === 'TRANSFER_IN' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' :
                                                            tx.type === 'DEPOSIT' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' :
                                                                'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30'
                                                            } flex items-center justify-center text-xs font-bold border`}>
                                                            {tx.type === 'TRANSFER_IN' ? 'TI' : tx.type === 'DEPOSIT' ? 'DP' : 'TX'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[#111714] dark:text-white">
                                                                {tx.description || 'Incoming Money'}
                                                            </span>
                                                            <span className="text-xs text-[#648772] dark:text-[#93b3a2]">
                                                                {formatDate(tx.date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-sm font-bold text-primary">
                                                            +${tx.amount?.toLocaleString() || '0.00'}
                                                        </span>
                                                        <span className={`block text-[10px] font-medium px-1.5 rounded inline-block ${tx.status === 'COMPLETED' || tx.status === 'SUCCESS'
                                                            ? 'text-primary bg-primary/10 border border-primary/20'
                                                            : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/30'
                                                            }`}>
                                                            {tx.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-[#648772] dark:text-[#93b3a2] py-8">
                                                No recent incoming transactions
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Help / Tip Widget */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/5 dark:from-primary/5 dark:to-blue-500/5 rounded-2xl p-6 border border-primary/20">
                                    <div className="relative z-10 flex gap-4">
                                        <div className="bg-white dark:bg-[#1a2c22] p-2.5 rounded-xl text-primary shadow-sm h-fit">
                                            <span className="material-symbols-outlined text-[24px]">contact_support</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h4 className="text-[#111714] dark:text-white font-bold text-sm">Scan trouble?</h4>
                                            <p className="text-[#648772] dark:text-[#93b3a2] text-xs leading-relaxed">
                                                Ensure you are in a well-lit environment and the camera lens is clean.
                                            </p>
                                            <button className="text-left text-xs font-bold text-[#111714] dark:text-white underline decoration-primary decoration-2 underline-offset-2 hover:text-primary transition-colors">
                                                View Troubleshooting
                                            </button>
                                        </div>
                                    </div>
                                    {/* Decor shape */}
                                    <div className="absolute -right-6 -bottom-6 size-24 bg-primary/20 rounded-full blur-xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Set Amount Modal */}
            {showAmountModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1a2c22] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-[#2a3c32]">
                        <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Set Amount</h3>
                        <p className="text-sm text-text-sub dark:text-gray-400 mb-4">
                            Generate a QR code with a specific amount for easy payment collection.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-text-main dark:text-white">Amount</label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#25382e] rounded-xl px-4 py-3 border border-gray-200 dark:border-[#2a3c32]">
                                <span className="text-text-main dark:text-white font-medium">$</span>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-transparent border-none outline-none flex-1 text-text-main dark:text-white"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowAmountModal(false);
                                    setCustomAmount("");
                                }}
                                className="px-5 py-2.5 rounded-xl text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetAmount}
                                className="px-5 py-2.5 rounded-xl bg-primary text-text-main font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                            >
                                Generate QR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
