import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../../components/Sidebar";
import { useEffect, useState } from "react";
import { getSpendingSummary } from "../../../services/summarySpendingApi";
import SpendingActivity from "../../../components/SpendingActivity";
import RecentTransactions from "../../../components/RecentTransactions";

const COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#00BCD4", "#9E9E9E"];


export default function SpendingSummaryPage() {
    // mock user (giống ProfilePage)
    const user = {
        fullName: "Sarah Johnson",
        role: "STANDARD",
    };

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const navigate = useNavigate();


    // Transaction pagination
    const PAGE_SIZE = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const transactions = summary?.recentTransactions ?? [];
    const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );



    // Icon
    const CATEGORY_ICON_MAP = {
        Food: "restaurant",
        Transport: "directions_car",
        Shopping: "shopping_bag",
        Entertainment: "movie",
        Utilities: "bolt",
        Default: "receipt_long",
    };

    const CATEGORY_COLOR_MAP = {
        Food: "text-green-500",
        Transport: "text-blue-500",
        Shopping: "text-purple-500",
        Entertainment: "text-orange-500",
        Utilities: "text-yellow-500",
        Default: "text-gray-400",
    };


    useEffect(() => {
        if (!token) return;

        setLoading(true);
        getSpendingSummary(token)
            .then((res) => setSummary(res.data))
            .finally(() => setLoading(false));
    }, [token]);



    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!summary) {
        return <div className="p-8">No data</div>;
    }

    const breakdown = summary.spendingBreakdown ?? [];
    const totalSpending = breakdown.reduce(
        (sum, item) => sum + item.totalAmount,
        0
    );

    const breakdownWithPercent = breakdown.map(item => ({
        ...item,
        percent: totalSpending > 0
            ? Math.round((item.totalAmount / totalSpending) * 100)
            : 0
    }));


    return (
        <>

            <div className="flex max-w-[1440px] mx-auto">
                <Sidebar user={user} />

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* PAGE HEADER */}
                    <div className="px-8 py-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-4xl font-black">
                                Spending Summary
                            </h2>
                            <p className="text-[#648772]">
                                Track your financial health and habits
                            </p>
                        </div>

                        <button className="flex items-center gap-2 bg-primary px-5 py-2.5 rounded-lg font-bold">
                            <span className="material-symbols-outlined">
                                download
                            </span>
                            Download Statement
                        </button>
                    </div>

                    {/* SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto px-8 pb-12">
                        <div className="max-w-6xl mx-auto flex flex-col gap-6">
                            {/* STATS */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard
                                    title="Total Balance"
                                    value={`${(summary.availableBalance ?? 0).toLocaleString()} VND`}
                                    icon="account_balance"
                                />


                                <StatCard
                                    title="Monthly Spending"
                                    value={`${(summary.monthlySpending ?? 0).toLocaleString()} VND`}
                                    icon="credit_card"
                                />

                                <StatCard
                                    title="Monthly Savings"
                                    value={`${(summary.monthlySaving ?? 0).toLocaleString()} VND`}
                                    icon="savings"
                                />


                            </div>

                            {/* SPENDING INFORMATION */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* BAR CHART */}
                                <div className="lg:col-span-2">
                                    <SpendingActivity data={summary.spendingActivity ?? []} />
                                </div>


                                {/* SPENDING BREAKDOWN */}
                                <div className="bg-white rounded-xl p-6 border shadow-sm">
                                    <h3 className="text-lg font-bold mb-4">
                                        Spending by Category
                                    </h3>

                                    {/* PIE + TOTAL */}
                                    <div className="flex flex-col items-center">
                                        {/* khóa kích thước + luôn vuông để không méo */}
                                        <div
                                            className="relative w-44 aspect-square rounded-full shrink-0"
                                            style={{ background: buildPieGradient(breakdownWithPercent) }}
                                        >
                                            {/* donut hole */}
                                            <div className="absolute inset-7 bg-white rounded-full flex flex-col items-center justify-center text-center px-2">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                                                    Total
                                                </span>

                                                <div className="text-lg font-black leading-tight">
                                                    {totalSpending.toLocaleString()}
                                                </div>

                                                <div className="text-sm font-bold leading-tight">
                                                    VND
                                                </div>
                                            </div>
                                        </div>

                                        {/* LEGEND dưới pie (giống design) */}
                                        <div className="mt-6 w-full space-y-3">
                                            {breakdownWithPercent.map((c, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: c.color || COLORS[idx % COLORS.length] }}
                                                        />
                                                        <span className="font-medium text-gray-700">
                                                            {c.categoryName}
                                                        </span>
                                                    </div>

                                                    <span className="font-bold text-gray-900">
                                                        {c.percent}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>





                            {/* RECENT TRANSACTIONS */}
                            <RecentTransactions
                                transactions={(summary.recentTransactions ?? []).slice(0, 5)}
                                onViewAll={() => navigate("/transfer-history")}
                            />

                        </div>
                    </div>
                </main>
            </div>
        </>
    );


    /* ===== SUB COMPONENTS (NỘI BỘ PAGE) ===== */

    function StatCard({ title, value, icon }) {
        return (
            <div className="rounded-xl p-6 bg-white border shadow-sm">
                <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-500 font-medium">
                        {title}
                    </p>
                    <span className="material-symbols-outlined text-primary">
                        {icon}
                    </span>
                </div>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        );
    }

    function Th({ children, right }) {
        return (
            <th
                className={`py-4 px-6 text-xs font-semibold uppercase text-gray-500 ${right ? "text-right" : ""
                    }`}
            >
                {children}
            </th>
        );
    }

    function Transaction({ name, category, date, amount }) {
        const icon = CATEGORY_ICON_MAP[name] || CATEGORY_ICON_MAP.Default;
        const color = CATEGORY_COLOR_MAP[name] || CATEGORY_COLOR_MAP.Default;

        return (
            <tr className="hover:bg-background-light">
                {/* MERCHANT + ICON */}
                <td className="py-4 px-6">
                    <div className="flex items-center gap-3 font-bold">
                        <span
                            className={`material-symbols-outlined text-xl ${color}`}
                        >
                            {icon}
                        </span>
                        <span>{name}</span>
                    </div>
                </td>

                {/* CATEGORY / DESCRIPTION */}
                <td className="py-4 px-6 text-gray-600">
                    {category}
                </td>

                {/* DATE */}
                <td className="py-4 px-6 text-gray-500">
                    {date}
                </td>

                {/* AMOUNT */}
                <td className="py-4 px-6 text-right font-bold">
                    {amount}
                </td>
            </tr>
        );
    }


    function normalizeWeeklyActivity(data) {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        const map = {};
        data.forEach(d => {
            const day = new Date(d.date).toLocaleDateString("en-US", {
                weekday: "short"
            });
            map[day] = d.totalAmount;
        });

        return days.map(day => ({
            day,
            totalAmount: map[day] ?? 0
        }));
    }

    function buildPieGradient(data) {
        let current = 0;

        return `conic-gradient(${data.map((item, idx) => {
            const start = current;
            const end = current + item.percent;
            current = end;

            return `${item.color || COLORS[idx % COLORS.length]} ${start}% ${end}%`;
        }).join(", ")})`;
    }
}