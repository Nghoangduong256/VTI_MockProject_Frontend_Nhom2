import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError(""); // Clear error khi user nhập
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    if (!formData.username.trim()) {
      setLocalError("Vui lòng nhập username");
      return;
    }
    if (!formData.password.trim()) {
      setLocalError("Vui lòng nhập password");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
      });

      if (result.success) {
        // Check role and redirect
        // Check role and redirect
        const user = result.user;

        // Check for inactive status
        if (user && (user.status === 'INACTIVE' || user.active === false)) {
          alert("Tài khoản Chưa kích hoạt");
          return; // Stop login process
        }

        if (user && (user.roles?.includes("ADMIN") || user.role === "ADMIN")) {
          navigate("/admin/transactions");
          return;
        }

        const roles = result.data?.roles || result.roles || [];
        if (roles.includes("ADMIN")) {
          navigate("/admin/transactions"); // Consolidate redirect to one place if possible, but keeping logic similar to original flow
        } else {
          navigate("/dashboard");
        }
      } else {
        setLocalError(result.error?.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setLocalError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display antialiased text-text-main">
      {/* LEFT */}
      <div className="flex w-full lg:w-1/2 flex-col bg-white dark:bg-background-dark h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 px-8 py-6 lg:px-12">
          <div className="size-8 text-primary">
            <svg viewBox="0 0 48 48" className="w-full h-full">
              <path
                d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">E-Wallet</h2>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col justify-center px-8 lg:px-24">
          <div className="max-w-[480px] w-full mx-auto flex flex-col gap-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Welcome Back</h1>
              <p className="text-text-secondary mt-2">
                Securely access your wallet to manage your finances.
              </p>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-xl">
                    error
                  </span>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {displayError}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Username */}
              <div>
                <label className="text-sm font-medium">Username</label>
                <div className="relative mt-1">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    disabled={isSubmitting}
                    className="form-input w-full h-14 rounded-xl px-4 pr-12 border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
                    person
                  </span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    className="form-input w-full h-14 rounded-xl px-4 pr-12 border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </div>
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <a className="text-sm font-bold hover:text-primary" href="#">
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 rounded-full bg-primary font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-grow border-t border-border-color" />
                <span className="text-sm text-text-secondary">
                  or continue with
                </span>
                <div className="flex-grow border-t border-border-color" />
              </div>

              {/* Social */}
              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 h-12 border rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                  Google
                </button>
                <button
                  type="button"
                  className="flex-1 h-12 border rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="material-symbols-outlined">favorite</span>
                  Apple
                </button>
              </div>
            </form>

            {/* Signup */}
            <p className="text-center text-sm text-text-secondary">
              Don't have an account?
              <Link to="/register" className="ml-1 text-primary font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 bg-background-light dark:bg-[#0c1811]">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTuh1Ga3nA_vOowFuw-e2wKQX1G14-TOFvsiMh1PoO3-TLLlMe4bry4HlabGxCsUBgSPpP76XPV8uQUKRN5JF3n_da4WxqPtmKRczUAbjXU9vTyWaTcCd7mMSngeeOC5MtfEnd-WGAqOOKxehIDKMRkonPb_ssLjDvbhOWLW4_RAW3EsmqcosE5HF_ZpkMp4thO1AX3_i7YWUj97jm0mYpnhbTD6u3PxRsRjIv981ekVKGGOGtct04X7TlLTSyxDYL-qQLg6yPNexS"
          className="w-full h-full object-cover rounded-[3rem]"
          alt="E-wallet"
        />
      </div>
    </div>
  );
}
