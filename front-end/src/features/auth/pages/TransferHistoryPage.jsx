import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransferService from "../../../services/transfer/transferService";

const WALLET_ID = 1;
const PAGE_SIZE = 10;

const STATUS_STYLE = {
    COMPLETED: "bg-primary/10 text-primary",
    PENDING: "bg-yellow-500/10 text-yellow-500",
    FAILED: "bg-red-500/10 text-red-500",
};

export default function TransferHistoryPage() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [direction, setDirection] = useState("ALL");
    const [timeRange, setTimeRange] = useState("30DAYS");
    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [sending, setSending] = useState(false);

    const handleSendNow = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to send this money?"
        );

        if (!confirmed) return;

        setSending(true);

        try {
            await TransferService.sendMoney({
                fromWalletId: WALLET_ID,
                toWalletId: 2,
                amount: 150,
                note: "Test transfer"
            });

            alert("Money sent successfully!");
        } catch (e) {
            console.error("Send money failed", e);

            alert(
                e?.response?.data?.message ||
                "Transaction failed. Please try again."
            );
        } finally {
            setSending(false);
        }
    };


    /* =============== DATE FILTER =============== */
    const getDateRange = () => {
        const now = new Date();
        let fromDate = new Date();

        if (timeRange === "3MONTHS") {
            fromDate.setMonth(fromDate.getMonth() - 3);
        } else if (timeRange === "YEAR") {
            fromDate = new Date(now.getFullYear(), 0, 1);
        } else {
            fromDate.setDate(fromDate.getDate() - 30);
        }

        return {
            fromDate: fromDate.toISOString(),
            toDate: now.toISOString(),
        };
    };

    /* =============== API CALL =============== */
    useEffect(() => {
        const fetchData = async () => {
            const { fromDate, toDate } = getDateRange();

            const res = await TransferService.getTransferHistory(WALLET_ID, {
                page,
                size: PAGE_SIZE,
                direction: direction === "ALL" ? undefined : direction,
                fromDate,
                toDate,
            });

            setTransactions(res.data.content);
            setTotalElements(res.data.totalElements);
        };

        fetchData();
    }, [page, direction, timeRange]);

    return (
        <div className="dark bg-background-white min-h-screen font-display text-white">
            {/* ================= TOP NAV ================= */}
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

            {/* ================= MAIN ================= */}
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

                {/* ================= SEND / RECEIVE ================= */}
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
                            {/* Recipient Search */}
                            <div className="flex flex-col gap-3">
                                <label className="text-black text-base font-medium">
                                    Recipient
                                </label>
                                <div className="relative group">
                                    <input
                                        className="w-full h-14 bg-white border border-gray-300 rounded-xl px-4 pl-12 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="Phone, Email, or Wallet ID"
                                        type="text"
                                        defaultValue="Jane Doe"
                                    />
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-black group-focus-within:text-primary transition-colors">
                                        search
                                    </span>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                                        check_circle
                                    </span>
                                </div>
                            </div>

                            {/* Selected Recipient Card */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="size-12 rounded-full bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvJFluIjEirtAfVNJghxeYRA9DytYG-Kiz7LSLAwCOZvKr-IBB9ZWEcysA2HFwTRGMnicpInQuETpLj6Q1C4IF8WG7DctoZvJzQf_CGVE18PZF6PlWy2Stnwb-I5R-P7oJ0YDxJW49D-xSuxQhMp7SFF3O0o1eUGxBcH50TK80fNW7IHBsOZ_zw00pzz18YK90-acDO9qolJOUTMD1ZwiiiR9Bct_k4sqOKeHe9XQQfYwqfKDzpacc09iO92NWfNUrrYwncP3gXCrp")',
                                        }}
                                    />
                                    <div>
                                        <p className="text-black font-bold text-base">Jane Doe</p>
                                        <p className="text-gray-600 text-sm">ID: **** 4321</p>
                                    </div>
                                </div>
                                <button className="text-primary text-sm font-medium hover:underline">
                                    Change
                                </button>
                            </div>

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
                                            className="w-full h-20 bg-white border border-gray-300 rounded-xl pl-10 pr-4 text-4xl md:text-5xl font-bold text-black placeholder:text-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="0.00"
                                            type="number"
                                            defaultValue="150.00"
                                        />
                                    </div>
                                    <p className="text-black text-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">
                                            account_balance_wallet
                                        </span>
                                        Balance:
                                        <span className="text-black font-medium">$4,250.80</span>
                                    </p>
                                </div>

                                {/* Note */}
                                <div className="flex-1 flex flex-col gap-3 text-black">
                                    <label className="text-base font-medium">
                                        Note <span className="font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        className="w-full h-20 md:h-[108px] bg-white border border-gray-300 rounded-xl p-4 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
                                        placeholder="What is this for?"
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleSendNow}
                                disabled={sending}
                                className="mt-2 w-full h-14 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-full shadow-glow transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {sending ? "Sending..." : "Send Now"}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>


                    {/* RECEIVE MONEY PANEL */}
                    <div className="lg:col-span-5 flex flex-col h-full">
                        <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-border-dark flex justify-between items-center">
                                <h3 className="text-black text-lg font-bold">Receive Money</h3>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                    My QR
                                </span>
                            </div>

                            <div className="flex-1 p-8 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-surface-dark to-[#161d19]">
                                <div className="bg-white p-4 rounded-2xl shadow-xl transform transition-transform hover:scale-105 duration-300">
                                    <img
                                        className="size-48 md:size-56 object-contain"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD2r5Z27KaIqj68sYDnJpRxDLEGkO_stGxndLoBF9VO0S4QzHKj3GcMxNk9cuRPUoDb6C-iXg4PykqYWsHn9xNUVmLfOcYUmxIM2z86JHDvbs03nvG3TP-b7JNNSxilDiXweDZu3_WcggJF5aXe0tCAvk99eRdtNvFbCa8vq9pvZOjK7yJSnvXGXP8PfmtvkrUdtsNB8K0SQfR4bj6H07wDpVwC7zwo66Tx0yzFyxlJTkozVFEQJUX1AvuZTe8AY5NKvWI2HdLu4t6"
                                        alt="QR Code for receiving payment"
                                    />
                                </div>
                                <div className="text-center text-black">
                                    <p className="font-bold text-lg">Jane Doe</p>
                                    <p className="text-sm font-mono mt-1 bg-background-white px-3 py-1 rounded-lg inline-block border border-border-dark/50">
                                        0x3f...8a21
                                    </p>
                                </div>
                                <div className="flex w-full gap-3 mt-2 text-black">
                                    <button className="flex-1 flex items-center justify-center gap-2 h-10 border border-black rounded-full text-sm font-medium hover:bg-background-dark transition-colors">
                                        <span className="material-symbols-outlined text-lg">
                                            download
                                        </span>
                                        Save
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 h-10 border border-black rounded-full text-sm font-medium hover:bg-background-dark transition-colors">
                                        <span className="material-symbols-outlined text-lg">
                                            share
                                        </span>
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= TRANSACTION HISTORY ================= */}
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
                                {totalElements === 0 ? 0 : page * PAGE_SIZE + 1}
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
