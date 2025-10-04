import { Camera, Mail, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, isUpdatingProfile, setIsUpdatingProfile, axios } =
    useAppContext();
  const [profileImg, setProfileImg] = useState(null);
  const [updatedFormData, setUpdatedFormData] = useState({
    name: user?.name,
    email: user?.email,
  });

  const handleChange = (e) => {
    e.target.type === "file"
      ? setProfileImg(e.target.files[0])
      : setUpdatedFormData({
          ...updatedFormData,
          [e.target.name]: e.target.value,
        });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const formData = new FormData();
    Object.entries(updatedFormData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("profilePic", profileImg);

    try {
      const { data } = await axios.patch("/api/user/update-profile", formData);
      data.success ? toast.success(data.message) : toast.error(data.message);
    } catch (error) {
      console.log(error);
    }
    setIsUpdatingProfile(false);
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="relative bg-base-300 rounded-xl p-6 space-y-8">
          <button
            type="submit"
            form="profileForm"
            className="absolute right-4 btn bg-[#504FCF]"
          >
            Save
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <form id="profileForm" onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={
                    profileImg
                      ? URL.createObjectURL(profileImg)
                      : user.profilePic
                      ? user.profilePic
                      : "./avatar.png"
                  }
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4 "
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }
                `}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile
                  ? "Please wait..."
                  : "Click the camera icon to update your photo"}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <input
                  onChange={handleChange}
                  name="name"
                  className="px-4 py-2.5 bg-base-200 rounded-lg w-full border"
                  value={updatedFormData.name}
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <input
                  name="email"
                  onChange={handleChange}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                  value={updatedFormData.email}
                />
              </div>
            </div>
          </form>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{user.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
