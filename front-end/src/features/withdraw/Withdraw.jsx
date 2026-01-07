import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatVND, formatDateRangeFromNow } from "./utils";

import userService from "../../services/userService";
import cardService from "../../services/cardService";


// WithdrawPage.jsx
export default function Withdraw() {
  
  const token = localStorage.getItem("token");
  const [cards, setCards] = useState(null);
  const [user, setUser] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await userService.getCurrentUser();
      console.log(userData);
      setUser(userData);

      const cardsData = await cardService.getCards();
      setCards(cardsData);
    };
    fetchData();
  }, []);


  function handleWithdrawAmountChange(e) {
    if (e.target.value < 0 || e.target.value > user?.wallet.availableBalance)
      return;
    setWithdrawAmount(e.target.value);
  }

  function handleWithdrawAvailalbeMax(amount) {
    if (amount < 0 || amount > user?.wallet.availableBalance)
      return;
    setWithdrawAmount(amount);
  }
  
  function confirmWithdraw() {
    if (!selectedAccount) {
      alert("Please select a bank account to withdraw to.");
      return;
    }
    if (withdrawAmount * 1.005 > user?.wallet.availableBalance) {
      alert("Please enter a valid withdraw amount.");
      return;
    }
    // alert(`Withdrawing ${formatVND(withdrawAmount)} to account ID ${selectedAccount}`);
    fetch(`http://localhost:8080/api/wallets/${user.wallet.id}/withdraw`, {
      method: "POST", // hoặc POST, PUT, DELETE
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        bankAccountId: selectedAccount,
        amount: withdrawAmount,
        note: "Withdraw via E-Wallet app",
      }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Withdraw successful!");
          // Optionally, refresh user data to update balance
          return response.json();
        } else {
          alert("Withdraw failed. Please try again.");
        }
      })
      .then((data) => {
        console.log("Withdraw response data:", data);
        setUser((prevUser) => ({
          ...prevUser,
          wallet: {
            ...prevUser.wallet,
            availableBalance: data.availableBalanceAfter,
          },
        }));
        setWithdrawAmount(0);
      });
  }
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-10 py-4 sticky top-0 z-50">
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
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-10 pb-20 px-4 md:px-10">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 md:p-8">
            <div className="flex flex-col gap-2 mb-8 border-b border-border-light dark:border-border-dark pb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="md:hidden flex items-center text-text-sub-light dark:text-text-sub-dark"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-3xl font-bold leading-tight">
                  Withdraw Funds
                </h1>
              </div>
              <p className="text-text-sub-light dark:text-text-sub-dark">
                Transfer money securely to your linked accounts.
              </p>
            </div>

            <form
              className="flex flex-col gap-8"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium leading-normal flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    account_balance
                  </span>
                  Withdraw to
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards &&
                    cards.map((card) => (
                      <label
                        className="cursor-pointer relative"
                        key={card.id}
                        onClick={() => setSelectedAccount(card.id)}
                      >
                        <input
                          className="peer sr-only"
                          name="account"
                          type="radio"
                        />
                        <div className="p-4 rounded-lg border border-border-light dark:border-border-dark flex items-center gap-4 transition-all hover:bg-background-light dark:hover:bg-background-dark peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10">
                          <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-800">
                            <span className="material-symbols-outlined">
                              payments
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">
                              {card.bankName}
                            </span>
                            {/* <span className="font-bold text-sm">{card.accountName}</span> */}
                            <span className="text-xs text-text-sub-light dark:text-text-sub-dark">
                              {card.cardNumber}
                            </span>
                          </div>
                          <div className="ml-auto text-primary opacity-0 peer-checked:opacity-100">
                            <span className="material-symbols-outlined fill-current">
                              check_circle
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}

                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-border-light dark:border-border-dark text-text-sub-light dark:text-text-sub-dark hover:text-primary hover:border-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span className="text-sm font-medium">Link New Card</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <label className="text-base font-medium leading-normal flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      attach_money
                    </span>
                    Amount
                  </label>
                  <span className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark">
                    Available Balance:
                    <span className="text-text-main-light dark:text-text-main-dark font-bold">
                      {formatVND(user?.wallet.availableBalance)}
                    </span>
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-text-sub-light dark:text-text-sub-dark font-bold text-lg">
                      $
                    </span>
                  </div>

                  <input
                    className="form-input block w-full pl-10 pr-4 py-4 rounded-lg bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark placeholder:text-text-sub-light/50 focus:border-primary focus:ring-primary text-3xl font-bold tracking-tight"
                    placeholder="0.00"
                    type="number"
                    value={withdrawAmount}
                    onChange={handleWithdrawAmountChange}
                    defaultValue={10000.0}
                  />
                </div>

                <div className="flex gap-3 flex-wrap pt-2">
                  <button
                    className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-background-light dark:hover:bg-background-dark px-4 transition-colors"
                    type="button"
                  >
                    <p
                      className="text-sm font-medium leading-normal"
                      onClick={(e) => handleWithdrawAvailalbeMax(50000)}
                    >
                      50.000 $
                    </p>
                  </button>

                  <button
                    className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-background-light dark:hover:bg-background-dark px-4 transition-colors"
                    type="button"
                  >
                    <p
                      className="text-sm leading-normal"
                      onClick={(e) => handleWithdrawAvailalbeMax(500000)}
                    >
                      500.000 $
                    </p>
                  </button>

                  <button
                    className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-background-light dark:hover:bg-background-dark px-4 transition-colors"
                    type="button"
                  >
                    <p
                      className="text-sm font-medium leading-normal"
                      onClick={(e) => handleWithdrawAvailalbeMax(1000000)}
                    >
                      1.000.000 $
                    </p>
                  </button>

                  <button
                    className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-background-light dark:hover:bg-background-dark px-4 transition-colors ml-auto"
                    type="button"
                  >
                    <p
                      className="text-sm font-bold leading-normal text-text-sub-light dark:text-text-sub-dark"
                      onClick={(e) =>
                        setWithdrawAmount(user.wallet.availableBalance)
                      }
                    >
                      Max
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 shrink-0">
                  info
                </span>
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-bold mb-1">Processing Time</p>
                  <p>
                    Withdrawals to bank accounts typically take 1-3 business
                    days. Instant transfers are available for eligible debit
                    cards.
                  </p>
                </div>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 sticky top-28">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
              <div className="p-6 border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
                <h3 className="text-lg font-bold">Transaction Summary</h3>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-sub-light dark:text-text-sub-dark">
                    Withdraw Amount
                  </span>
                  <span className="font-medium">
                    {formatVND(withdrawAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-sub-light dark:text-text-sub-dark">
                    Service Fee (0.5%)
                  </span>
                  <span className="font-medium text-red-500">
                    -{formatVND(withdrawAmount * 0.005)}
                  </span>
                </div>

                <div className="my-2 border-t border-border-light dark:border-border-dark border-dashed" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">Total Deducted</span>
                  <span className="font-extrabold text-xl text-text-main-light dark:text-text-main-dark">
                    {formatVND(withdrawAmount * 1.005)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-text-sub-light dark:text-text-sub-dark mt-1">
                  <span>Est. Arrival</span>
                  <span>{formatDateRangeFromNow()}</span>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary hover:bg-primary/90 transition-colors text-[#111714] text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20"
                >
                  <span className="truncate" onClick={confirmWithdraw}>
                    Confirm Withdraw
                  </span>
                </button>

                <div className="flex justify-center items-center gap-2 mt-4 text-xs text-text-sub-light dark:text-text-sub-dark">
                  <span className="material-symbols-outlined text-[16px]">
                    lock
                  </span>
                  <span>256-bit SSL Secured Transaction</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Need Help?</h4>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark mb-2">
                  If you have any issues with your withdrawal, please contact
                  our support team.
                </p>
                <a
                  className="text-primary text-xs font-bold hover:underline"
                  href="#"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
