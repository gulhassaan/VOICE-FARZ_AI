import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const UserProfile = () => {
const token = localStorage.getItem("token");

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
              Authorization: "Bearer " + token,
              "X-CSRFToken":
                "wwnq3j4EIwHLEb94hA6fQmuIaZl6PAZlgpCEZyyt95CYtguCq636Gehh31HVdnOA",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Fetched user data:", data); // Console log the fetched data
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
    profileData.isPremium ? "bg-[#F2911B] text-white" : "bg-gray-100 text-gray-800"
  }`}
>
  {profileData.isPremium ? (
    <span>
      Enterprise <i className="fas fa-crown"></i>
    </span>
  ) : (
    "Standard"
  )}
</span>

        </div>
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8">
        <div className="relative mb-4 lg:mb-0 border-2 rounded-full" style={{ borderColor: "rgb(243, 156, 18)" }}>


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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
