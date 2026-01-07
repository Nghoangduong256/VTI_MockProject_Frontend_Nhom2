import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import userService from "../../../services/userService";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
  });

  // ===============================
  // LOAD PROFILE
  // ===============================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        console.log("Avatar from API:", data.avatarUrl || data.avatar);

        setUser(data);
        setAvatar(normalizeAvatar(data.avatarUrl || data.avatar));

        // Attempt to split fullName if firstName/lastName missing
        let fName = data.firstName || "";
        let lName = data.lastName || "";
        if (!fName && !lName && data.fullName) {
          const parts = data.fullName.split(' ');
          if (parts.length > 0) {
            lName = parts.pop();
            fName = parts.join(' ');
          }
        }

        setForm({
          firstName: fName,
          lastName: lName,
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error("Load profile failed", error);
      }
    };

    fetchProfile();
  }, []);

  // ===============================
  // FORM HANDLERS
  // ===============================
  const handleChange = (e) => {
    if (!isEditing) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      // Send fields directly as per updated API spec: { firstName, lastName, ... }
      const res = await userService.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
      });

      if (res && (res.status === 'FAILED' || res.status === 'ERROR')) {
        throw new Error(res.message || "Update profile failed");
      }

      setIsEditing(false);

      // Update local user display immediately
      // Note: GET /api/user/profile returns fullName, so we might construct it optionally for local display
      const newFullName = `${form.firstName} ${form.lastName}`.trim();
      setUser(prev => ({ ...prev, fullName: newFullName, ...form }));

      alert("Profile updated successfully");
    } catch (error) {
      console.error("Update profile failed", error);
      alert("Update failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  // ===============================
  // AVATAR
  // ===============================
  const handleAvatarChange = (e) => {
    if (!isEditing) return;

    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      alert("Avatar must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = typeof reader.result === "string" ? reader.result : "";
      setAvatar(base64);

      try {
        const res = await userService.updateAvatar(base64); // Service now sends { avatarUrl: base64 }

        if (res && (res.status === 'FAILED' || res.status === 'ERROR')) {
          throw new Error(res.message || "Update avatar failed");
        }
      } catch (err) {
        console.error("Update avatar failed", err);
        alert("Update avatar failed: " + (err.message));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!user) return <div>Loading...</div>;

  return (
    // ĐÃ XÓA <Header /> ở đây
    <div className="flex min-h-screen bg-gray-50"> {/* Thay đổi từ min-h-[calc(100vh-64px)] thành min-h-screen */}
      <Sidebar activeRoute="profile" />

      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-[1440px] p-6">

          {/* PAGE TITLE */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Personal Information</h1>
            <p className="text-[#648772]">
              Manage your personal information and account security.
            </p>
          </div>

          {/* PROFILE HEADER */}
          <div className="bg-white rounded-2xl p-6 mb-8 border shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-6">
              {/* AVATAR */}
              <div className="relative">
                <img
                  src={avatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border"
                />

                {user.verified && (
                  <span className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}

                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition">
                    <span className="text-white text-sm">Edit</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                )}
              </div>

              {/* NAME + BADGES */}
              <div>
                <h2 className="text-2xl font-bold">
                  {user.userName}
                </h2>

                <div className="flex gap-2 mt-1">
                  {user.verified && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                      Verified
                    </span>
                  )}
                  {user.membership && (
                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {user.membership}
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#648772] mt-2">
                  Update your photo and personal details here.
                </p>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              disabled={isEditing}
              onClick={handleUpdateProfile}
              className={`px-4 py-2 rounded-lg font-semibold
              ${isEditing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              Update profile
            </button>
          </div>

          {/* PROFILE FORM */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col gap-6"
          >
            <div className="flex gap-6">
              <Input
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="flex gap-6">
              <Input
                label="Email"
                name="email"
                value={form.email}
                disabled
              />
              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="flex gap-6">
              <Input
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary font-semibold"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

function Input({ label, type = "text", name, value, onChange, disabled }) {
  return (
    <label className="flex flex-col w-full">
      <span className="text-sm font-semibold mb-1">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`h-12 px-4 rounded-lg border
          ${disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white"
          }`}
      />
    </label>
  );
}

function normalizeAvatar(base64) {
  if (!base64) return null;

  // đã là data URL
  if (base64.startsWith("data:image")) {
    return base64;
  }

  // base64 thuần → thêm prefix
  return `data:image/png;base64,${base64}`;
}