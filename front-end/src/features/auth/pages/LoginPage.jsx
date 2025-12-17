import { useState } from "react";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData); // sau này nối API
    };

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

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium">Email or Phone Number</label>
                                <div className="relative mt-1">
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email or phone number"
                                        className="form-input w-full h-14 rounded-xl px-4 border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50"
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
                                        mail
                                    </span>
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-medium">Password</label>
                                <div className="relative mt-1">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="form-input w-full h-14 rounded-xl px-4 border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/50"
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer">
                                        visibility_off
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
                            <button className="h-12 rounded-full bg-primary font-bold shadow-lg shadow-primary/20">
                                Log In
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-grow border-t border-border-color" />
                                <span className="text-sm text-text-secondary">or continue with</span>
                                <div className="flex-grow border-t border-border-color" />
                            </div>

                            {/* Social */}
                            <div className="flex gap-4">
                                <button type="button" className="flex-1 h-12 border rounded-xl flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">account_circle</span>
                                    Google
                                </button>
                                <button type="button" className="flex-1 h-12 border rounded-xl flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">favorite</span>
                                    Apple
                                </button>
                            </div>

                        </form>

                        {/* Signup */}
                        <p className="text-center text-sm text-text-secondary">
                            Don’t have an account?
                            <a href="#" className="ml-1 text-primary font-bold">Sign up</a>
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
