import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cardService from "../../../services/cardService";
import walletService from "../../../services/walletService";
import { useAuth } from "../context/AuthContext";

const DepositPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loadingCards, setLoadingCards] = useState(true);

  // Fetch Wallet (for balance) and Cards
  const fetchData = async () => {
    try {
      if (user) {
        const walletRes = await walletService.getWalletInfo();
        setWallet(walletRes);
      }

      // Fetch Cards
      const cardRes = await cardService.getCards();
      setCards(cardRes);
      if (cardRes.length > 0) {
        setSelectedCardId(cardRes[0].id);
      }
    } catch (e) {
      console.error("Error fetching data", e);
      setError("Failed to load user data.");
    } finally {
      setLoadingCards(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError("");
    try {
      const res = await cardService.getDepositHistory();
      console.log("Deposit History:", res);
      // Ensure res is an array
      if (Array.isArray(res)) {
        setRecentDeposits(res);
      } else {
        console.error("History response is not an array", res);
        setHistoryError("Invalid data format received.");
      }
    } catch (e) {
      console.error("Load deposit history failed", e);
      setHistoryError("Failed to load history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      fetchHistory();
    }
  }, [user]);

  const amountNumber = Number(amount) || 0;
  // Fee calculation can be removed or kept? The prompt didn't specify fee logic, but preserved it is safer or ask?
  // Previous code had fee. Use case doesn't mention fee. I will keep it pure amount unless user asked.
  // Actually, bank usually doesn't take fee for deposit in this mock?
  // Let's assume 0 fee for now or keep previous logic?
  // The API request body only has `amount` and `description`. It doesn't send total pay.
  // So the fee is frontend only display or backend handles it?
  // Let's stick to simple amount.

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amountNumber = Number(amount);

    if (!amountNumber || amountNumber <= 0) {
      setError("Deposit amount must be greater than 0");
      return;
    }

    if (!selectedCardId) {
      setError("Please select a card");
      return;
    }

    setError("");

    try {
      const res = await cardService.depositFromCard({
        cardId: selectedCardId,
        amount: amountNumber, // Provide amount
        description: "Deposit from card"
      });

      if (res.status === 'FAILED' || res.status === 'ERROR') {
        // Manually throw error to trigger catch block
        throw new Error(res.message || "Deposit transaction failed");
      }

      alert("Deposit successful");
      setAmount("");
      // refetch
      fetchData();
      fetchHistory();
    } catch (e) {
      console.error(e);
      // Check for specific error message from backend
      const msg = e.response?.data?.message || "Deposit failed";
      setError(msg);
    }
  };

  const handleQuickAdd = (value) => {
    const current = Number(amount) || 0;
    setAmount(String(current + value));
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#111714] dark:text-white min-h-screen">
      <main className="px-4 md:px-10 lg:px-40 py-8 flex justify-center">
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1200px] w-full">
          {/* LEFT SECTION */}
          <section className="flex-1 flex flex-col gap-6">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-[#648772] hover:text-primary transition-colors mb-4"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <h1 className="text-4xl font-black">Deposit Funds</h1>
              <p className="text-[#648772]">
                Select a card and enter amount to deposit into your wallet.
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* CREDIT CARD SELECTION */}
            <div>
              <h3 className="text-lg font-bold mb-3">Select Card</h3>
              {loadingCards ? (
                <p>Loading cards...</p>
              ) : cards.length === 0 ? (
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-gray-500 mb-2">No cards linked.</p>
                  <button onClick={() => navigate('/cards')} className="text-primary font-bold hover:underline">Link a card now</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedCardId === card.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50"
                        }`}
                    >
                      {selectedCardId === card.id && (
                        <span className="absolute top-3 right-3 text-primary material-symbols-outlined">
                          check_circle
                        </span>
                      )}
                      <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600">credit_card</span>
                      </div>
                      <div>
                        <h4 className="font-bold">{card.bankName || "Bank Card"}</h4>
                        <p className="text-xs text-[#648772]">
                          {card.last4 ? `•••• ${card.last4}` : card.cardNumber}
                        </p>
                        <p className="text-xs text-primary font-bold">
                          Bal: ${card.balanceCard?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AMOUNT INPUT */}
            <div>
              <label className="text-lg font-bold">Enter Amount</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0.00"
                  className="w-full h-16 pl-9 pr-4 text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black/20"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (Number(val) < 0) return;
                    setAmount(val);
                  }}
                />
              </div>

              <div className="flex gap-3 mt-3 flex-wrap">
                {[50000, 100000, 200000, 500000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="h-8 px-4 border rounded-lg hover:border-primary hover:bg-primary/10 transition"
                    onClick={() => handleQuickAdd(v)}
                  >
                    +${v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT CHECKOUT SECTION */}
          <aside className="w-full lg:w-[380px]">
            <div className="sticky top-24 bg-white dark:bg-[#1a2c22] border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Transaction Details</h3>

              <div className="flex justify-between mb-3">
                <span className="text-[#648772]">Current Wallet Balance</span>
                <strong>
                  $
                  {wallet
                    ? wallet.balance?.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                    : "..."}
                </strong>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-[#648772]">Deposit Amount</span>
                <strong>
                  $
                  {Number(amount).toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </strong>
              </div>

              <hr className="my-4 border-dashed border-gray-300" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold">Total Pay</span>
                <span className="text-primary text-2xl font-black">
                  $
                  {Number(amount).toLocaleString("en-US", {
                    minimumFractionDigits: 0, // Should be currency dependent, usually VND no decimals
                  })}
                </span>
              </div>

              <button
                className="w-full h-12 bg-primary text-white rounded-lg font-bold hover:bg-[#2dd16c] disabled:opacity-50 disabled:cursor-not-allowed transition"
                onClick={handleDeposit}
                disabled={!amount || Number(amount) <= 0 || !selectedCardId}
              >
                Confirm Deposit
              </button>
            </div>
          </aside>

          {/* RECENT DEPOSITS LIST */}
          {/* Can be placed below or side. Original design had it below right logic or separate? In valid responsive design, below is fine. */}
        </div>

        {/* MOVED RECENT DEPOSITS OUTSIDE FLEX ROW TO BE FULL WIDTH BELOW OR KEEP IN FLOW? 
             Original code: Inside main flex, so it was beside/below. 
             Let's put it below the 2 columns if needed, or keep in left column if space permits.
             Actually the original code had it as a sibling to LEFT/RIGHT section?? 
             No, it was inside <div className="flex ..."> but as a sibling of LEFT and RIGHT?
             Wait:
             <div className="flex ...">
               <section ...> ... </section>
               <aside ...> ... </aside>
               <div className="mt-6"> ... </div> (This is inside flex container which is flex-row. So it would be a 3rd column?)
             Let's check original logic.
             Original:
             <div className="flex ...">
                <section> LEFT </section>
                <aside> RIGHT </aside>
                <div className="mt-6"> Recent </div>  // This looks suspicious if it is 3rd col.
             </div>
             Actually, let's put Recent Deposits BELOW the columns, or inside the Left section at the bottom.
             Putting it in the Main container below the flex-row is better for mobile.
         */}
      </main>

      {/* HISTORY SECTION SEPARATE FROM COLUMNS */}
      <div className="flex justify-center pb-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1200px] w-full">
          <h3 className="text-[#111714] dark:text-white text-xl font-bold mb-4">
            Recent Card Deposits
          </h3>

          {loadingHistory ? (
            <p className="text-sm text-gray-500">Loading history...</p>
          ) : historyError ? (
            <p className="text-sm text-red-500">{historyError}</p>
          ) : recentDeposits.length === 0 ? (
            <p className="text-sm text-gray-500">No deposit history found.</p>
          ) : (
            <div className="bg-white dark:bg-[#1a2c22] rounded-xl border overflow-hidden">
              {recentDeposits.map((tx) => (
                <div
                  key={tx.transactionId || tx.id} // api might return transactionId
                  className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">
                        credit_card
                      </span>
                    </div>

                    <div>
                      <p className="font-medium text-sm md:text-base">{tx.description || "Deposit from Card"}</p>
                      <p className="text-xs text-[#648772]">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.bankName} •••• {tx.cardNumber ? tx.cardNumber.slice(-4) : '****'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-primary block">
                      +$
                      {Number(tx.amount).toLocaleString("en-US")}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${tx.status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositPage;
