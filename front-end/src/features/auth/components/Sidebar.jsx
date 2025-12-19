const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=12";

export default function Sidebar({ user }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r h-[calc(100vh-65px)] sticky top-[65px] p-4">
      {/* User info */}
      <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
        <img
          src={DEFAULT_AVATAR}
          alt="Avatar"
          className="size-12 rounded-full"
        />
        <div>
          <h1 className="text-sm font-bold">{user.fullName}</h1>
          <p className="text-xs text-primary font-semibold">
            {user.role === "PREMIUM" ? "Premium User" : "Standard User"}
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1 mt-6">
        <Item label="Overview" />
        <Item label="Security" />
        <Item label="Settings" />
        <Item label="Profile" active />
      </nav>

      <div className="mt-auto pt-6 border-t">
        <p className="text-xs text-gray-400">
          Last login: Today, 10:23 AM
        </p>
      </div>
    </aside>
  );
}

function Item({ label, active }) {
  return (
    <div
      className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm
        ${
          active
            ? "bg-primary/10 font-bold"
            : "text-gray-500 hover:bg-gray-100"
        }`}
    >
      {label}
    </div>
  );
}
