import { useState } from "react";

const normalizeWeeklyActivity = (items = []) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map = Object.fromEntries(days.map(d => [d, 0]));

    items.forEach(item => {
        if (!item?.date || item?.totalAmount == null) return;

        const d = new Date(item.date);
        if (Number.isNaN(d.getTime())) return;

        const day = d.toLocaleDateString("en-US", { weekday: "short" });
        if (map[day] !== undefined) {
            map[day] += Number(item.totalAmount);
        }
    });

    return days.map(d => ({
        day: d,
        totalAmount: map[d],
    }));
};

export default function SpendingActivity({ data = [] }) {
    const [mode, setMode] = useState("day"); // future-proof

    const weeklyActivity = normalizeWeeklyActivity(data);
    const max = Math.max(...weeklyActivity.map(x => x.totalAmount), 1);

    return (
        <div className="bg-white dark:bg-[#1a2c22] rounded-xl p-6 border border-gray-100 dark:border-[#2a3c32]">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">
                        Spending Activity
                    </h3>
                    <p className="text-sm text-text-sub">
                        Your daily spending habits
                    </p>
                </div>

                {/* Filter (UI only for now) */}
                <div className="flex bg-gray-100 dark:bg-[#25382e] rounded-lg overflow-hidden text-sm">
                    {["day", "week", "month"].map(key => (
                        <button
                            key={key}
                            onClick={() => setMode(key)}
                            className={`px-3 py-1.5 transition-colors ${mode === key
                                ? "bg-primary text-text-main font-medium"
                                : "text-text-sub hover:bg-gray-200 dark:hover:bg-[#2f463a]"
                                }`}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="grid grid-cols-7 gap-6 h-64 items-end">
                {weeklyActivity.map((d, idx) => {
                    const height =
                        d.totalAmount > 0
                            ? `${(d.totalAmount / max) * 100}%`
                            : "4px";

                    return (
                        <div key={idx} className="flex flex-col items-center h-full">
                            <div className="flex-1 flex items-end">
                                <div
                                    className="w-9 bg-primary rounded-full transition-all"
                                    style={{ height }}
                                />
                            </div>
                            <span className="mt-3 text-xs text-text-sub">
                                {d.day}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
