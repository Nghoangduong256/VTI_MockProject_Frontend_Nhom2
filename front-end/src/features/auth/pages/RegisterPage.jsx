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
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      newErrors.username =
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
      await RegisterService.register({
        username,
        fullName,
        email,
        phone: phoneNumber,
        passwordHash,
      });

      alert("Register success!");
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
            newErrors.username = message;
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
    `w-full px-4 py-3 rounded-full border outline-none transition ${
      errors[field] ? "border-red-500" : "border-gray-300"
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
                className={inputClass("username")}
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
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

      {/* Right Side */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#e8f5e9] dark:bg-[#1a3324]">
        <h3 className="text-3xl font-bold">Financial Freedom Starts Here</h3>
      </div>
    </div>
  );
}
