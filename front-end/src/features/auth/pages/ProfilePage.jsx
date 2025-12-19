import { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { userService } from "../services/userService";

export default function ProfilePage() {
  // mock user
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState("john.doe");

  // edit mode
  const [isEditing, setIsEditing] = useState(false);
  const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB


  // original data (để cancel)
  const initialForm = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 000-0000",
    dob: "1990-01-01",
    address: "123 Financial District, New York, NY 10001",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getUserById();

        setUser(data);
        setUsername(data.username);
        setAvatar(data.avatar);

        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dob: data.dateOfBirth,
          address: data.address,
        });
      } catch (error) {
        console.error("Load profile failed", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    if (!isEditing) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(initialForm); // reset data
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await userService.updateProfile({
        username,
        avatar,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        dob: form.dob,
      });

      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Update profile failed", error);
      alert("Update failed");
    }
  };


  const handleAvatarChange = (e) => {
    if (!isEditing) return;

    const file = e.target.files[0];
    if (!file) return;

    // check type
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    //  check size
    if (file.size > MAX_AVATAR_SIZE) {
      alert("Avatar must be under 2MB");
      return;
    }

    //  convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result); // data:image/...;base64,...
    };
    reader.readAsDataURL(file);
  };


  if (!user) return <div>Loading...</div>;

  return (
    <>
      <Header />

      <div className="flex max-w-[1440px] mx-auto">
        <Sidebar user={user} />

        <main className="flex-1 p-6 max-w-5xl mx-auto">
          {/* TITLE */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Personal Information
            </h1>
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


                <span className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  ✓
                </span>

                {/* UPLOAD */}
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
                {/* USERNAME */}
                {isEditing ? (
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-2xl font-bold border-b outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold">
                    {user.fullName}
                  </h2>
                )}

                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                    Verified
                  </span>
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    Premium
                  </span>
                </div>

                <p className="text-sm text-[#648772] mt-2">
                  Update your photo and personal details here.
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
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

              <button className="px-4 py-2 rounded-lg bg-primary font-semibold">
                Delete
              </button>
            </div>
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
                onChange={handleChange}
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
                name="dob"
                value={form.dob}
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

            {/* ACTION BUTTONS */}
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
        </main>
      </div>
    </>
  );
}

/* INPUT COMPONENT (đơn giản – dùng nội bộ) */
function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  disabled,
}) {
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