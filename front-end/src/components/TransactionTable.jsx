function Th({ children, right }) {
    return (
        <th
            className={`px-6 py-3 text-xs font-semibold tracking-wide text-text-sub ${
                right ? "text-right" : "text-left"
            }`}
        >
            {children}
        </th>
    );
}

function TrRow({ name, category, date, amount, icon }) {
    return (
        <tr className="border-t hover:bg-gray-50 transition-colors">
            {/* MERCHANT */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3 font-semibold text-text-main">
                    <span className="material-symbols-outlined text-primary">
                        {icon}
                    </span>
                    <span>{name}</span>
                </div>
            </td>

            {/* CATEGORY */}
            <td className="px-6 py-4 text-text-sub">
                {category}
            </td>

            {/* DATE */}
            <td className="px-6 py-4 text-text-sub">
                {date}
            </td>

            {/* AMOUNT */}
            <td className="px-6 py-4 text-right font-semibold text-text-main">
                {amount}
            </td>
        </tr>
    );
}


/* ===== Helpers ===== */

const formatDateTime = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(); // ví dụ: 1/12/2026, 4:06:12 PM
};

const formatAmountVND = (amount, direction) => {
    const n = Number(amount ?? 0);
    const sign = direction === "IN" ? "+" : "-";
    return `${sign}${Math.abs(n).toLocaleString()} VND`;
};

const CATEGORY_ICON_MAP = {
    Food: "restaurant",
    Transport: "directions_car",
    Shopping: "shopping_bag",
    Entertainment: "movie",
    Health: "local_hospital",
    Education: "school",
    Default: "payments",
};

/* ===== Main Component ===== */

export default function TransactionTable({ transactions = [] }) {
    return (
        <table className="w-full text-left">
            <thead className="bg-background-light">
                <tr>
                    <Th>Merchant</Th>
                    <Th>Category</Th>
                    <Th>Date</Th>
                    <Th right>Amount</Th>
                </tr>
            </thead>

            <tbody>
                {transactions.map((tx) => {
                    const icon =
                        CATEGORY_ICON_MAP[tx.category] ??
                        CATEGORY_ICON_MAP.Default;

                    return (
                        <TrRow
                            key={tx.id}
                            icon={icon}
                            name={tx.category}                 // 👈 tên chi tiêu
                            category={tx.type}                // WITHDRAW
                            date={formatDateTime(tx.date)}
                            amount={formatAmountVND(tx.amount, tx.direction)}
                        />
                    );
                })}
            </tbody>
        </table>
    );
}
