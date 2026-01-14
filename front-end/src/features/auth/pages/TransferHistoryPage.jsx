import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TransferService from "../../../services/transfer/transferService";
import walletService from "../../../services/walletService";
import qrService from "../../../services/qrService";
import userService from "../../../services/userService";
const HISTORY_CACHE_KEY = "transfer_history_cache";
const PAGE_SIZE = 10;

const STATUS_STYLE = {
    COMPLETED: "bg-primary/10 text-primary",
    PENDING: "bg-yellow-500/10 text-yellow-500",
    FAILED: "bg-red-500/10 text-red-500",
};

export default function TransferHistoryPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    /* WALLET */
    const [wallet, setWallet] = useState(null);
    const walletId = wallet?.id;
    const [profile, setProfile] = useState(null);

    /* HISTORY */
    const [transactions, setTransactions] = useState([]);
    const [direction, setDirection] = useState("ALL");
    const [timeRange, setTimeRange] = useState("30DAYS");
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loadedFromCache, setLoadedFromCache] = useState(false);


    /* SEND MONEY */
    const [sending, setSending] = useState(false);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [targetWallets, setTargetWallets] = useState([]);
    const [searchPhone, setSearchPhone] = useState("");
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [toUserId, setToUserId] = useState(null);
    const amountNumber = Number(amount);

    /* RECEIVE */
    const [qrCode, setQrCode] = useState(null);

    /* LOAD WALLET + QR + PROFILE */
    useEffect(() => {
        refreshWallet();
        qrService.getWalletQR().then(setQrCode);
        userService.getProfile().then(setProfile).catch(console.error);
    }, []);

    /* Filter time */
    const mapTimeRangeToFilter = (range) => {
        if (range === "30DAYS") return "LAST_30_DAYS";
        if (range === "3MONTHS") return "LAST_MONTH";
        if (range === "YEAR") return "LAST_YEAR";
        return null;
    };


    /* FETCH HISTORY */
    const fetchHistory = async (walletId, page, direction, timeRange) => {
        try {
            const params = {
                page,
                size: PAGE_SIZE,
                filter: mapTimeRangeToFilter(timeRange),
            };
            if (direction !== "ALL") params.direction = direction;

            const res = await TransferService.getTransferHistory(walletId, params);

            setTransactions(res.content || []);
            setTotalElements(res.totalElements || 0);

            localStorage.setItem(
                HISTORY_CACHE_KEY,
                JSON.stringify({
                    walletId,
                    content: res.content || [],
                    totalElements: res.totalElements || 0,
                    page,
                    direction,
                    timeRange,
                    cachedAt: Date.now(),
                })
            );

        } catch (e) {
            console.error("Fetch history failed", e);
        }
    };

    const refreshWallet = async () => {
        const walletData = await walletService.getWalletInfo();
        setWallet({
            ...walletData,
            id: walletData.walletId,
        });
    };


    useEffect(() => {
        if (!walletId) return;

        const cached = localStorage.getItem(HISTORY_CACHE_KEY);
        if (!cached) return;

        try {
            const data = JSON.parse(cached);
            if (data.walletId === walletId && data.content?.length) {
                setTransactions(data.content);
                setTotalElements(data.totalElements || 0);
                setPage(data.page ?? 0);
                setDirection(data.direction ?? "ALL");
                setTimeRange(data.timeRange ?? "30DAYS");
                setLoadedFromCache(true);
            }
        } catch (e) {
            console.error("Cache parse failed", e);
        }
    }, [walletId]);

    useEffect(() => {
        setLoadedFromCache(false);
    }, [page, direction, timeRange]);

    useEffect(() => {
        if (!walletId || loadedFromCache) return;
        fetchHistory(walletId, page, direction, timeRange);
    }, [walletId, page, direction, timeRange, loadedFromCache]);

    useEffect(() => {
        if (!walletId || sending) return;

        const i = setInterval(async () => {
            await fetchHistory(walletId, page, direction, timeRange);
            await refreshWallet();
        }, 5000);

        return () => clearInterval(i);
    }, [walletId, page, direction, timeRange, sending]);


    /* SEARCH WALLET BY PHONE */
    const handleSearchNow = async () => {
        if (!searchPhone.trim()) {
            setTargetWallets([]);
            return;
        }

        try {
            const wallets = await TransferService.getTargetWallets(searchPhone.trim());

            if (!Array.isArray(wallets)) {
                setTargetWallets([]);
                alert("Unexpected response from server");
                return;
            }

            if (wallets.length === 0) {
                setTargetWallets([]);
                alert("No wallet found with this phone number");
                return;
            }

            setTargetWallets(wallets);
        } catch (error) {
            console.error(error);
            alert("System error. Please try again later.");
        }
    };

    const handleSelectWallet = (wallet) => {
        setSelectedWallet(wallet);
        setToUserId(wallet.userId);
        setTargetWallets([]);
        setSearchPhone("");
    };

    const resolveAvatarSrc = (avatar) => {
        if (!avatar) return "https://i.pravatar.cc/150?img=12";

        // Nếu đã là data:image thì dùng luôn
        if (avatar.startsWith("data:image")) return avatar;

        // Nếu là base64 thuần
        return `data:image/jpeg;base64,${avatar}`;
    };

    const handleCopyAddress = () => {
        if (!wallet?.accountNumber) return;
        navigator.clipboard.writeText(wallet.accountNumber);
        alert("Wallet address copied!");
    };

    const start = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
    const end = Math.min((page + 1) * PAGE_SIZE, totalElements);

    /* SEND MONEY */
    const handleSendNow = async () => {
        if (!walletId || !toUserId || amountNumber <= 0) return;

        try {
            setSending(true);

            const response = await TransferService.transfer({
                toUserId,
                amount: amountNumber,
                note,
            });

            // Check for logical failure (soft error with 200 OK)
            if (response.data && response.data.success === false) {
                alert(response.data.note || "Transfer failed"); // Display specific error note
                return;
            }

            /* OPTIMISTIC TX (OUT) */
            const optimisticTx = {
                id: `tmp-${Date.now()}`,
                createdAt: new Date().toISOString(),
                partnerName: selectedWallet?.fullName || "Transfer",
                direction: "OUT",
                amount: amountNumber,
                status: "COMPLETED",
                type: "TRANSFER_OUT",
                note,
            };

            setTransactions(prev => [optimisticTx, ...prev]);
            setTotalElements(prev => prev + 1);

            /* OPTIMISTIC BALANCE */
            setWallet(prev => ({
                ...prev,
                balance: prev.balance - amountNumber,
            }));

            /* UPDATE CACHE */
            localStorage.setItem(
                HISTORY_CACHE_KEY,
                JSON.stringify({
                    walletId,
                    content: [optimisticTx, ...transactions],
                    totalElements: totalElements + 1,
                    page: 0,
                    direction,
                    timeRange,
                    cachedAt: Date.now(),
                })
            );

            /* RESET FORM */
            setAmount("");
            setNote("");
            setSelectedWallet(null);
            setToUserId(null);
            setPage(0);

            /* HARD REFRESH DATA */
            setTimeout(async () => {
                await refreshWallet();
                await fetchHistory(walletId, 0, direction, timeRange);
            }, 800);

        } catch (e) {
            console.error(e);
            // Handle error response from server (e.g., 400 Bad Request)
            if (e.response && e.response.data && e.response.data.note) {
                alert(e.response.data.note);
            } else {
                alert("Transfer failed");
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="dark bg-background-white min-h-screen font-display text-white">
            {/*  TOP NAV  */}
            <header className="sticky top-0 z-50 w-full bg-white backdrop-blur-md border-b border-border-dark pt-8 pb-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <section className="flex-1 flex flex-col gap-6">
                        <div>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="flex items-center gap-2 text-[#648772] hover:text-primary transition-colors mb-4"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                <span className="font-medium">Back to Dashboard</span>
                            </button>
                        </div>
                    </section>
                </div>
            </header>


            {/*  MAIN  */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* PAGE HEADING */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-black">
                            Transfer &amp; Receive
                        </h1>
                        <p className="text-black text-base">
                            Manage your transactions securely and instantly.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-dark border border-border-dark text-white hover:bg-[#232e27] transition-all">
                            <span className="material-symbols-outlined text-sm">
                                settings
                            </span>
                            <span className="text-sm font-medium">Limits</span>
                        </button>
                    </div>
                </div>


                {/*  SEND / RECEIVE  */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                    {/* SEND MONEY PANEL */}
                    <div className="lg:col-span-7 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                        {/* Tabs Header */}
                        <div className="flex border-b border-gray-200 bg-white">
                            <button className="flex-1 py-4 text-center border-b-2 border-primary bg-white">
                                <span className="text-black text-sm font-bold tracking-wide">
                                    Send Money
                                </span>
                            </button>
                            <button className="flex-1 py-4 text-center border-b-2 border-transparent hover:bg-gray-100 transition-colors group">
                                <span className="text-black group-hover:text-black text-sm font-bold tracking-wide">
                                    Request
                                </span>
                            </button>
                        </div>


                        <div className="p-6 md:p-8 flex flex-col gap-6">
                            {/* Select Receiver Wallet */}
                            <label className="text-black text-base font-medium">
                                Receiver Wallet
                            </label>
                            <input
                                type="text"
                                placeholder="Enter phone number..."
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                className="w-full h-14 border border-gray-300 rounded-xl px-4 text-black disabled:bg-gray-100"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSearchNow();
                                    }
                                }}
                            />
                            {selectedWallet && (
                                <div className="flex items-center justify-between p-3 rounded-xl border bg-green-50">
                                    <div>
                                        <div className="text-sm font-medium text-black">
                                            Receiver: {selectedWallet.fullName}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Wallet: **** {selectedWallet.accountNumber.slice(-4)}
                                        </div>
                                    </div>


                                    <button
                                        className="text-sm text-red-500 underline"
                                        onClick={() => {
                                            setSelectedWallet(null);
                                            setToUserId(null);
                                            setSearchPhone("");
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                            )}

                            {targetWallets.length > 0 && (
                                <div className="border rounded-xl mt-2 bg-white shadow">
                                    {targetWallets.map(w => (
                                        <div
                                            key={w.walletId}
                                            className="p-3 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleSelectWallet(w)}
                                        >
                                            <div className="font-medium text-black">
                                                {w.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                **** {w.accountNumber.slice(-4)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Amount + Note */}
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Amount Input */}
                                <div className="flex-1 flex flex-col gap-3">
                                    <label className="text-black text-base font-medium">
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-2xl font-light">
                                            $
                                        </span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full h-20 bg-white border border-gray-300 rounded-xl pl-10 pr-4 text-4xl font-bold text-black"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-black text-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">
                                            account_balance_wallet
                                        </span>
                                        <span className="text-black font-medium">
                                            Balance: ${wallet?.balance?.toLocaleString() ?? "—"}
                                        </span>
                                    </p>
                                </div>


                                {/* Note */}
                                <div className="flex-1 flex flex-col gap-3 text-black">
                                    <label className="text-base font-medium">
                                        Note <span className="font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full h-20 bg-white border border-gray-300 rounded-xl p-4 text-black resize-none"
                                        placeholder="What is this for?"
                                    />
                                </div>
                            </div>


                            {/* Action Button */}
                            <button
                                onClick={handleSendNow}
                                disabled={
                                    !wallet?.id ||
                                    !toUserId ||
                                    sending ||
                                    amountNumber <= 0 ||
                                    Number.isNaN(amountNumber)
                                }
                                className="mt-2 w-full h-14 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-full"
                            >
                                {sending ? "Processing..." : "Send Now"}
                            </button>
                        </div>
                    </div>



                    {/* RECEIVE MONEY PANEL */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="group relative flex flex-col items-center w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e6ece9] overflow-hidden">


                            {/* Card Decoration */}
                            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#f0fdf4] to-transparent opacity-80 z-0" />


                            <div className="relative z-10 flex flex-col items-center w-full p-8 pb-10">


                                {/* Profile */}
                                <div className="flex flex-col items-center gap-3 mb-6">
                                    <img
                                        src={resolveAvatarSrc(profile?.avatarUrl || profile?.avatar || user?.avatar)}
                                        alt="avatar"
                                        className="w-16 h-16 rounded-full object-cover border"
                                    />

                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-[#111714]">
                                            {wallet?.accountName || "User"}
                                        </h3>
                                        <p className="text-sm text-[#648772]">
                                            Wallet ID: {wallet?.id || "—"}
                                        </p>
                                    </div>
                                </div>


                                {/* QR */}
                                <div className="relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 group-hover:scale-[1.02] transition-transform">
                                    {qrCode ? (
                                        <img
                                            className="size-52"
                                            src={
                                                typeof qrCode === "string" && qrCode.startsWith("data:")
                                                    ? qrCode
                                                    : `data:image/png;base64,${qrCode}`
                                            }
                                            alt="QR Code"
                                        />
                                    ) : (
                                        <div className="size-52 flex items-center justify-center text-gray-400">
                                            Loading QR...
                                        </div>
                                    )}


                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#111714] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                                        SCAN ME
                                    </div>
                                </div>


                                {/* Account Number */}
                                <div className="w-full">
                                    <label className="block text-xs font-bold text-[#648772] mb-1.5 ml-1 uppercase tracking-wider">
                                        Account Number
                                    </label>
                                    <div className="flex items-center justify-between gap-3 p-3 bg-[#f6f8f7] rounded-xl border hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                                <span className="material-symbols-outlined text-[20px]">
                                                    wallet
                                                </span>
                                            </div>
                                            <span className="font-mono text-sm truncate text-[#111714]">
                                                {wallet?.accountNumber || 'N/A'}
                                            </span>


                                        </div>
                                        <button
                                            onClick={handleCopyAddress}
                                            className="p-2 text-[#648772] hover:text-[#111714] hover:bg-white rounded-lg transition-all"
                                            title="Copy Address"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                content_copy
                                            </span>
                                        </button>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>


                {/*  TRANSACTION HISTORY  */}
                <div className="flex flex-col gap-6">
                    {/* Header + Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-black text-xl font-bold">
                            Transaction History
                        </h3>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {/* Time range */}
                            <div className="relative">
                                <select
                                    value={timeRange}
                                    onChange={(e) => {
                                        setPage(0);
                                        setTimeRange(e.target.value);
                                    }}
                                    className="appearance-none bg-surface-dark border border-border-dark text-black text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer "
                                >
                                    <option value="30DAYS">Last 30 Days</option>
                                    <option value="3MONTHS">Last 3 Months</option>
                                    <option value="YEAR">This Year</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-lg">
                                    expand_more
                                </span>
                            </div>


                            {/* Direction */}
                            <div className="relative">
                                <select
                                    value={direction}
                                    onChange={(e) => {
                                        setPage(0);
                                        setDirection(e.target.value);
                                    }}
                                    className="appearance-none bg-surface-dark border border-border-dark text-black text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="OUT">Sent</option>
                                    <option value="IN">Received</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-lg">
                                    expand_more
                                </span>
                            </div>


                            {/* Extra filter button (UI only) */}
                            <button className="bg-surface-dark border border-border-dark hover:border-primary text-text-muted hover:text-white rounded-lg p-2 transition-colors">
                                <span className="material-symbols-outlined text-lg">
                                    filter_list
                                </span>
                            </button>
                        </div>
                    </div>


                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-black">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                        Entity
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                        Note
                                    </th>
                                    <th className="px-6 py-4 w-10" />
                                </tr>
                            </thead>


                            <tbody className="divide-y divide-gray-200">
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="group hover:bg-gray-100 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/transactions/${tx.id}`)}
                                    >
                                        {/* Date + time */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-black text-sm font-medium">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {new Date(tx.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>


                                        {/* Entity / partner */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-black text-sm font-medium">
                                                {tx.partnerName}
                                            </span>
                                        </td>


                                        {/* Type */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600 text-sm">
                                                {tx.direction === "OUT" ? "Sent" : "Received"}
                                            </span>
                                        </td>


                                        {/* Amount */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`font-bold text-sm ${tx.direction === "OUT"
                                                    ? "text-black"
                                                    : "text-primary"
                                                    }`}
                                            >
                                                {tx.direction === "OUT" ? "-" : "+"}${tx.amount}
                                            </span>
                                        </td>


                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`size-2 rounded-full ${tx.status === "COMPLETED"
                                                        ? "bg-primary"
                                                        : tx.status === "PENDING"
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                        }`}
                                                />
                                                <span
                                                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[tx.status]
                                                        }`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </td>


                                        {/* Note */}
                                        <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
                                            <span className="text-gray-600 text-sm truncate block">
                                                {tx.note}
                                            </span>
                                        </td>


                                        {/* Chevron */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-black text-lg">
                                                chevron_right
                                            </span>
                                        </td>
                                    </tr>
                                ))}


                                {transactions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-gray-500 text-sm"
                                        >
                                            No transactions found for this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                    {/* PAGINATION */}
                    <div className="flex justify-between items-center px-2 text-black">
                        <p className="text-black text-sm">
                            Showing{" "}
                            <span className="font-medium">
                                {start}–{end}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">{totalElements}</span>{" "}
                            transactions
                        </p>


                        <div className="flex gap-2">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                disabled={(page + 1) * PAGE_SIZE >= totalElements}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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