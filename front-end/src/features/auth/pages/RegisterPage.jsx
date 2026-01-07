import { useState } from "react";
import RegisterService from "../../../services/register/registerService";
import { useNavigate } from "react-router-dom";
export default function RegisterPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [username, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passwordHash, setPassWord] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // hàm validate
  const validate = () => {
    const newErrors = {};

    // USERNAME
    if (!username.trim()) {
      newErrors.userName = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      newErrors.userName =
        "Username must be 4–20 chars, letters, numbers, underscore only";
    }

    // FULL NAME
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullName)) {
      newErrors.fullName = "Full name is invalid";
    }

    // EMAIL
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    // PHONE
    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^0\d{9,10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number is invalid";
    }

    // PASSWORD
    if (!passwordHash) {
      newErrors.password = "Password is required";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(passwordHash)) {
      newErrors.password =
        "Password must be at least 8 chars and contain letters & numbers";
    }

    // CONFIRM PASSWORD
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== passwordHash) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      const response = await RegisterService.register({
        userName: username,
        fullName,
        email,
        phone: phoneNumber,
        passwordHash,
      });

      const { accountNumber } = response.data;
      alert(`Register success! Your account number is: ${accountNumber || phoneNumber}`);
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 409) {
        const message = err.response.data;

        setErrors((prev) => {
          const newErrors = { ...prev };

          if (message.includes("Email")) {
            newErrors.email = message;
          }

          if (message.includes("Username")) {
            newErrors.userName = message;
          }

          if (message.includes("Phone")) {
            newErrors.phoneNumber = message;
          }

          return newErrors;
        });
      } else {
        alert("Server error");
      }
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-full border outline-none transition ${errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full overflow-hidden bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light font-display antialiased">
      {/* Left Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-8 text-primary">
                <svg viewBox="0 0 48 48" fill="none">
                  <path
                    d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold">E-Wallet</h2>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black">Create your account</h1>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                placeholder="User Name"
                className={inputClass("userName")}
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
              {errors.userName && (
                <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className={inputClass("fullName")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                className={inputClass("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                className={inputClass("phoneNumber")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className={inputClass("password")}
                  value={passwordHash}
                  onChange={(e) => setPassWord(e.target.value)}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className={inputClass("confirmPassword")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-text-dark font-bold py-4 rounded-full hover:opacity-90"
            >
              Create Free Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/Login" className="font-bold hover:text-primary">
              Log in
            </a>
          </p>
        </div>
      </div>

      {/* Right Side: Hero Visual */}
      <div className="hidden md:flex flex-1 relative bg-[#e8f5e9] dark:bg-[#1a3324] items-center justify-center p-12 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#36e27b 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        <div className="absolute top-10 right-10 size-64 bg-primary/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-10 left-10 size-80 bg-blue-400/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10 max-w-lg text-center">
          {/* 3D Card Illustration Placeholder */}
          <div className="relative w-full aspect-square max-w-[500px] mx-auto mb-10 group perspective-1000">
            <div
              className="w-full h-full bg-cover bg-center rounded-2xl shadow-2xl transition-transform duration-700 hover:rotate-y-6 hover:rotate-x-6"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvBOIl8CzG6CZnaRsOLHWeZiPXznjzpiKb_3Ew7_3cHEzGIQo3auFzXPhNwx55XQSnwNRYA1jtm2zdW8WhM_88EwOzqTweUwjKsf1-jnbjBNilQn87IAdlZyRjT_7jEykrAbtm331GVTBFnqOhCIlbEaJfKibDsm98mkL7KxW11uqZl_g4DJRlgV87EyaR2p5HCkFzesyT0PDn1e_IrESLi0B8GjShw6J6dOD_se89iZ-Uz799ANRBczRSgw0H4gZTgCllm1OEIaNn')" }}
            >
              {/* Overlay gradient for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400">shield_lock</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Security</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Bank-Grade</p>
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-text-dark dark:text-white mb-4">Financial Freedom Starts Here</h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
            Experience the fastest, most secure way to send, spend, and save money globally. No hidden fees.
          </p>
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="px-4 py-2 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 border border-white/50 dark:border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
              Instant Transfers
            </span>
            <span className="px-4 py-2 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 border border-white/50 dark:border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">public</span>
              Global Access
            </span>
            <span className="px-4 py-2 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 border border-white/50 dark:border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">savings</span>
              Smart Savings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
