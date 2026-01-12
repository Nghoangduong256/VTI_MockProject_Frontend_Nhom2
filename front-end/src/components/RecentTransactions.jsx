import TransactionTable from "./TransactionTable";

export default function RecentTransactions({ transactions = [], onViewAll }) {
    return (
        <div className="bg-white dark:bg-[#1a2c22] rounded-xl p-6 border border-gray-100 dark:border-[#2a3c32]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-text-main dark:text-white">
                    Recent Transactions
                </h3>

                <button
                    onClick={onViewAll}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                    View All
                </button>
            </div>

            {transactions.length > 0 ? (
                <TransactionTable transactions={transactions} />
            ) : (
                <p className="text-center text-text-sub">
                    No recent transactions
                </p>
            )}
        </div>
    );
}
