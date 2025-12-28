import { React, useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DepositService from "../../../services/deposit/depositService";

const DepositPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [amount, setAmount] = useState("");
  // chỗ này set id Wallert khi chọn ví r mới vào trang này
  const [walletId, setWalletId] = useState(1);

  const [wallet, setWallet] = useState(null);

  // call ví
  const fetchWallet = async () => {
    try {
      const res = await DepositService.getWalletById(walletId);
      setWallet(res.data);
    } catch (e) {
      console.error("Lỗi load wallet", e);
    }
  };

  // call lịch sử
  const fetchHistory = async () => {
    try {
      const res = await DepositService.getRecentDeposits(walletId);
      setRecentDeposits(res.data);
    } catch (e) {
      console.error("Load deposit history failed", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!walletId) return;

    fetchWallet();
    fetchHistory();
  }, [walletId]);

  const amountNumber = Number(amount) || 0;

  const feeRate = 0.001;
  const fee = amountNumber * feeRate;
  const totalPay = amountNumber + fee;
  // nap tien
  const handleDeposit = async (e) => {
    e.preventDefault();

    const amountNumber = Number(amount);

    if (!amountNumber || amountNumber <= 0) {
      setError("Deposit amount must be greater than 0");
      return;
    }

    setError("");

    try {
      await DepositService.deposit({
        walletId,
        amount: amountNumber,
      });

      alert("Nạp tiền thành công");

      await fetchWallet();
      await fetchHistory();

      setAmount("");
    } catch (e) {
      console.error(e);
      alert("Lỗi khi nạp tiền");
    }
  };

  const handleQuickAdd = (value) => {
    const current = Number(amount) || 0;
    setAmount(String(current + value));
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-[#111714] dark:text-white min-h-screen">
      {/* Main */}
      <main className="px-4 md:px-10 lg:px-40 py-8 flex justify-center">
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1200px] w-full">
          {/* LEFT */}
          <section className="flex-1 flex flex-col gap-6">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[#648772] hover:text-primary transition-colors mb-4"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <h1 className="text-4xl font-black">Deposit Funds</h1>
              <p className="text-[#648772]">
                Select a funding source and enter amount to proceed.
              </p>
            </div>

            {/* Chưa làm đc  */}
            <div>
              <h3 className="text-lg font-bold mb-3">Select Bank</h3>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Active */}
                <div className="relative flex items-center gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5 cursor-pointer">
                  <span className="absolute top-3 right-3 text-primary material-symbols-outlined">
                    check_circle
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url(https://lh3.googleusercontent.com/aida-public/AB6AXuBDKg4JbmO-Wau5tZ4N3LMz7NGcWfqU8F1KBYNIOPupH5TK5-1Tc2pe8c-GNJvlE12B088ZtNYJGXL10komwedQ6SFMmcCmX7mjAgRMksegEFSzrvejfTdzBw-1owpQtcNM2FjlLhrjkl1GsTI27xs9zszO8zv15Q_7EmPiKcZiuE6Al1YOWAZpSyTJ_6A0hs8A2PDtsuVf5crNfp6tsSE6G6O9BbIh5GzkmFXNnv-iqcyJxBMs9-2UAwYwpQ0vnSGp_v79dt_ia20B)",
                    }}
                  />
                  <div>
                    <h4 className="font-bold">Chase</h4>
                    <p className="text-xs text-[#648772]">Checking •••• 4582</p>
                  </div>
                </div>

                {/* Inactive */}
                {["Bank of America", "Wells Fargo"].map((bank) => (
                  <div
                    key={bank}
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#f0f4f2]" />
                    <div>
                      <h4 className="font-bold">{bank}</h4>
                      <p className="text-xs text-[#648772]">
                        Checking •••• 1920
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-lg font-bold">Enter Amount</label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full h-16 pl-9 pr-4 text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-primary"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (Number(val) < 0) return; // chặn số âm
                    setAmount(val);
                  }}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
              )}

              <div className="flex gap-3 mt-3 flex-wrap">
                {[50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="h-8 px-4 border rounded-lg hover:border-primary hover:bg-primary/10"
                    onClick={() => handleQuickAdd(v)}
                  >
                    +${v}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="w-full lg:w-[380px]">
            <div className="sticky top-24 bg-white dark:bg-[#1a2c22] border rounded-xl p-6">
              <h3 className="text-lg font-bold mb-6">Transaction Details</h3>

              <div className="flex justify-between mb-3">
                <span className="text-[#648772]">Current Balance E-Wallet</span>
                <strong>
                  $
                  {wallet
                    ? wallet.balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                    : "Loading..."}
                </strong>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-[#648772]">Deposit Amount</span>
                <strong>
                  $
                  {Number(amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-[#648772]">Processing Fee</span>
                <strong>${fee}</strong>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold">Total Pay</span>
                <span className="text-primary text-2xl font-black">
                  $
                  {Number(totalPay).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                className="w-full h-12 bg-primary rounded-lg font-bold hover:bg-[#2dd16c]"
                onClick={handleDeposit}
              >
                Confirm Deposit
              </button>
            </div>
          </aside>
          {/* Recent Deposits */}
          <div className="mt-6">
            <h3 className="text-[#111714] dark:text-white text-lg font-bold mb-4">
              Recent Deposits
            </h3>

            {loadingHistory ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : recentDeposits.length === 0 ? (
              <p className="text-sm text-gray-500">No deposit history</p>
            ) : (
              <div className="space-y-3">
                {recentDeposits.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-[#1a2c22]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          account_balance
                        </span>
                      </div>

                      <div>
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-xs text-[#648772]">
                          {new Date(tx.createdAt).toLocaleDateString("en-US")}
                        </p>
                        <p className="text-xs text-gray-400">
                          Ref: {tx.referenceId}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-primary block">
                        +$
                        {Number(tx.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>

                      <span
                        className={`text-xs font-medium ${tx.status === "COMPLETED"
                            ? "text-green-600"
                            : tx.status === "PENDING"
                              ? "text-yellow-500"
                              : "text-red-500"
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
      </main>
    </div>
  );
};

export default DepositPage;
