import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const UserProfile = () => {
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    googleProfileURL: "",
    email: "",
    username: "",
    isPremium: false,
  });

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/user_detail/",
          {
            headers: {
              accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI0NTM4MjE4LCJpYXQiOjE3MjE5NDYyMTgsImp0aSI6IjExMGMzNWRlOTAwYTQ5OWY4OTE1NDkwY2E4MzM3OWQwIiwidXNlcl9pZCI6Mn0.grrjYxNKEUHt0sgfxzzeYsUoxfuDAyHIKBx42RI2hjM",
              "X-CSRFToken":
                "wwnq3j4EIwHLEb94hA6fQmuIaZl6PAZlgpCEZyyt95CYtguCq636Gehh31HVdnOA",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setProfileData({
          googleProfileURL: data.google_picture_url || data.profile_picture_url,
          email: data.email,
          username: data.username,
          isPremium: data.is_premium,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const ChangePassword = () => {
    history.push("/forgot-password");
  };

  const getUsernameInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "";
  };

  return (
    <div className="animate-slideInRight min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">Profile</h2>
          <span
            className={`px-4 py-2 text-sm font-bold rounded-full ${
              profileData.isPremium
                ? "bg-[#F2911B] text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {profileData.isPremium ? "Enterprise" : "Standard"}
          </span>
        </div>
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8">
          <div className="relative mb-4 lg:mb-0">
            {profileData.googleProfileURL ? (
              <img
                className="w-24 h-24 rounded-full object-cover"
                src={profileData.googleProfileURL}
                alt="User profile"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#F2911B] flex items-center justify-center text-3xl font-bold text-white">
                {getUsernameInitial(profileData.username)}
              </div>
            )}
            {profileData.googleProfileURL && (
              <label
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer"
              >
                <i className="fas fa-camera text-white"></i>
              </label>
            )}
            <input type="file" className="hidden" id="profile-image-upload" />
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled={!isEditing}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={profileData.username}
                disabled={!isEditing}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                value="**********"
                disabled={!isEditing}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-end lg:space-x-4 space-y-4 lg:space-y-0 mt-4">
            <button
                onClick={ChangePassword}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:border-red-600 hover:text-red-600 hover:bg-transparent border"
              >
                Change Password
              </button>
              {/* <button className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:border-red-600 hover:text-red-600 hover:bg-transparent border">
                <i className="fas fa-trash-alt"></i> Delete user
              </button> */}
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
