import Transaction from "./Transaction";

export default function TransactionTable({ transactions }) {
    return (
        <table className="w-full text-left">
            <thead className="bg-background-light">
                <tr className="h-14">
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-sub">
                        Merchant
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-sub">
                        Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-sub">
                        Date
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-text-sub">
                        Amount
                    </th>
                </tr>
            </thead>



            <tbody>
                {transactions.map((tx, idx) => (
                    <Transaction
                        key={idx}
                        merchant={tx.description}
                        category={tx.categoryName}
                        date={new Date(tx.transactionDate).toLocaleString()}
                        amount={`- ${tx.amount.toLocaleString()} VND`}
                        icon={tx.icon}
                        color={tx.color}
                    />
                ))}
            </tbody>
        </table>
    );
}

