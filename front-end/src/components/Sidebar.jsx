import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { useState, useEffect } from "react";
import userService from "../services/userService";

export default function Sidebar({ activeRoute = "dashboard" }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await userService.getProfile();
                setProfile(profileRes);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const navItems = [
        { id: "dashboard", icon: "grid_view", label: "Dashboard", path: "/dashboard", filled: true },
        { id: "deposit", icon: "account_balance_wallet", label: "My Wallet", path: "/deposit" },
        { id: "withdraw", icon: "account_balance_wallet", label: "Withdraw", path: "/withdraw" },
        { id: "receive", icon: "qr_code_scanner", label: "Receive Money", path: "/receive-money" },
        { id: "transactions", icon: "swap_horiz", label: "Transactions", path: "#" },
        { id: "analytics", icon: "bar_chart", label: "Analytics", path: "#" },
        { id: "cards", icon: "credit_card", label: "My Cards", path: "#" },
    ];

    return (
        <aside className="hidden md:flex flex-col w-72 h-full bg-white dark:bg-[#1a2c22] border-r border-gray-100 dark:border-[#2a3c32] p-6 justify-between">
            <div className="flex flex-col gap-8">
                {/* User Profile */}
                <div className="flex items-center gap-4 px-2">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-12 shadow-sm"
                        style={{
                            backgroundImage: `url("${profile?.avatarUrl || 'https://via.placeholder.com/150'}")`,
                        }}
                    />
                    <div className="flex flex-col">
                        <h1 className="text-base font-semibold leading-tight text-text-main dark:text-white">
                            {profile?.fullName || 'User'}
                        </h1>
                        <p className="text-text-sub dark:text-gray-400 text-sm">
                            {profile?.membership || 'Member'}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all w-full text-left ${activeRoute === item.id
                                    ? 'bg-primary text-text-main shadow-md shadow-primary/20'
                                    : 'text-text-sub dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#25382e]'
                                }`}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={activeRoute === item.id && item.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => handleNavigation('/settings')}
                    className="flex items-center gap-3 px-4 py-3 rounded-full text-text-sub dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#25382e] transition-colors w-full text-left"
                >
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm font-medium">Settings</span>
                </button>
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 rounded-xl p-6 border border-primary/20">
                    <h3 className="text-sm font-semibold mb-2 text-text-main dark:text-white">Upgrade to Pro</h3>
                    <p className="text-xs text-text-sub dark:text-gray-400 mb-4">Get unlimited access to all features</p>
                    <button className="w-full bg-primary text-text-main text-sm font-medium py-2 px-4 rounded-full hover:bg-primary/90 transition-colors">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </aside>
    );
}
