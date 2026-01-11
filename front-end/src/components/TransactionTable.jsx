export default function TransactionTable({ transactions }) {
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
                {transactions.map((tx, idx) => (
                    <Transaction
                        key={idx}
                        name={tx.categoryName}
                        category={tx.description}
                        date={new Date(tx.transactionDate).toLocaleDateString()}
                        amount={`- ${tx.amount.toLocaleString()} VND`}
                        icon={tx.icon}
                    />
                ))}
            </tbody>
        </table>
    );
}
