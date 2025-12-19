import { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function ProfilePage() {
  // mock user
  const [user, setUser] = useState(null);

  // edit mode
  const [isEditing, setIsEditing] = useState(false);

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
    setUser({
      username: "john.doe",
      fullName: "John Doe",
      role: "PREMIUM",
    });
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

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Save profile:", form);
    setIsEditing(false);
    alert("Profile updated (mock)");
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
            <div>
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-sm text-[#648772] mt-2">
                Update your photo and personal details here.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                disabled={isEditing}
                onClick={handleUpdateProfile}
                className={`px-4 py-2 rounded-lg font-semibold
                  ${
                    isEditing
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
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white"
          }`}
      />
    </label>
  );
}