export default function Transaction({
    merchant,
    category,
    date,
    amount,
    icon,
    color,
}) {
    return (
        <tr className="border-t border-gray-100 dark:border-[#2a3c32] hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors">
            {/* MERCHANT */}
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div
                        className="size-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }} // nền nhạt
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ color }}
                        >
                            {icon}
                        </span>
                    </div>

                    <span className="font-medium text-text-main dark:text-white">
                        {merchant}
                    </span>
                </div>
            </td>

            {/* CATEGORY */}
            <td className="py-4 text-text-sub">
                {category}
            </td>

            {/* DATE */}
            <td className="py-4 text-text-sub whitespace-nowrap">
                {date}
            </td>

            {/* AMOUNT */}
            <td className="py-4 text-right font-semibold text-text-main dark:text-white">
                -{amount.toLocaleString()} VND
            </td>
        </tr>
    );
}
