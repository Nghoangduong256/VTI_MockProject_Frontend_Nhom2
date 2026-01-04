export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b px-6 py-3 shadow-sm">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="size-8 text-primary">
            <svg viewBox="0 0 48 48" fill="currentColor">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">E-Wallet</h2>
        </div>

        <div className="flex gap-3">
          <button className="size-10 rounded-lg bg-gray-100"><i class="fas fa-bell"></i></button>
          <button className="size-10 rounded-lg bg-gray-100"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </div>
    </header>
  );
}
