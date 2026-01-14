import { Link, useLocation } from 'react-router-dom';

export default function SidebarAdmin() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 hidden lg:flex">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-primary size-10 rounded-xl flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-[#121617] dark:text-white text-base font-bold leading-tight">E-Wallet Admin</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Financial Management</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-1">



                    <Link
                        to="/admin/transactions"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/admin/transactions')
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold'
                            }`}
                    >
                        <span className="material-symbols-outlined">receipt_long</span>
                        <span className="text-sm">History Logs</span>
                    </Link>

                    <Link
                        to="/user-manager"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/user-manager')
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold'
                            }`}
                    >
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-sm">Users</span>
                    </Link>

                    <Link
                        to="/admin/wallets"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/admin/wallets')
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold'
                            }`}
                    >
                        <span className="material-symbols-outlined">account_balance</span>
                        <span className="text-sm font-semibold">Wallets</span>
                    </Link>
                </nav>
            </div>
            {/* System Status Mock */}
            <div className="mt-auto p-6">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">System Status</p>
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-semibold dark:text-slate-200">Operational</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
