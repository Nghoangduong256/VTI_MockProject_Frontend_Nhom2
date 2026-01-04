const DEFAULT_AVATAR = "/default-avatar.png";



export default function Sidebar({ user, active = "Profile" }) {
  const avatarSrc = user?.avatar
    ? user.avatar.startsWith("data:image")
      ? user.avatar
      : `data:image/png;base64,${user.avatar}`
    : DEFAULT_AVATAR;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r h-[calc(100vh-65px)] sticky top-[65px] px-4 py-6">

      {/* ================= USER INFO ================= */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
        <img
          src={avatarSrc}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />

        <div>
          <p className="text-sm font-bold leading-tight">
            {user?.userName || "User"}
          </p>
          <p className="text-xs font-semibold text-green-500">
            {user?.membership
              ? `${user.membership} User`
              : "Standard User"}
          </p>
        </div>
      </div>

      {/* ================= MENU ================= */}
      <nav className="flex flex-col gap-1 mt-8">
        <MenuItem
          icon="fa-wallet"
          label="Wallet overview"
          active={active === "Overview"}
        />
        <MenuItem
          icon="fa-user"
          label="Profile"
          active={active === "Profile"}
        />
        <MenuItem
          icon="fa-arrow-down"
          label="Deposit"
          active={active === "Deposit"}
        />
        <MenuItem
          icon="fa-arrow-up"
          label="Withdraw"
          active={active === "Withdraw"}
        />
        <MenuItem
          icon="fa-exchange-alt"
          label="Transaction"
          active={active === "Transaction"}
        />
        <MenuItem
          icon="fa-qrcode"
          label="Receive Money"
          active={active === "Receive"}
        />
      </nav>

      {/* ================= SETTINGS ================= */}
      <div className="mt-auto pt-6 border-t">
        <MenuItem
          icon="fa-gear"
          label="Settings"
          muted
        />

        <p className="mt-4 text-xs text-gray-400">
          Last login: Today, 10:23 AM
        </p>
      </div>
    </aside>
  );
}

/* ================= MENU ITEM ================= */

function MenuItem({ icon, label, active, muted }) {
  return (
    <div
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition
        ${active
          ? "bg-green-50 font-semibold text-gray-900"
          : muted
            ? "text-gray-400 hover:bg-gray-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
    >
      {/* Active indicator */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-r" />
      )}

      <i className={`fas ${icon} w-4`} />
      <span>{label}</span>
    </div>
  );
}

