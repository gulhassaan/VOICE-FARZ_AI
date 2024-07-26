import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    googleProfileURL: '',
    email: '',
    username: ''
  });

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://speechinsightsweb.azurewebsites.net/user_detail/', {
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI0NTM4MjE4LCJpYXQiOjE3MjE5NDYyMTgsImp0aSI6IjExMGMzNWRlOTAwYTQ5OWY4OTE1NDkwY2E4MzM3OWQwIiwidXNlcl9pZCI6Mn0.grrjYxNKEUHt0sgfxzzeYsUoxfuDAyHIKBx42RI2hjM',
            'X-CSRFToken': 'wwnq3j4EIwHLEb94hA6fQmuIaZl6PAZlgpCEZyyt95CYtguCq636Gehh31HVdnOA'
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProfileData({
          googleProfileURL: data.google_picture_url || data.profile_picture_url,
          email: data.email,
          username: data.username
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const getUsernameInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="animate-slideInRight min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">Profile</h2>
          <button onClick={handleEditClick} className="text-[#F2911B] hover:text-orange-700">
            <i className="fas fa-edit"></i> Edit
          </button>
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
              <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer">
                <i className="fas fa-camera text-white"></i>
              </label>
            )}
            <input
              type="file"
              className="hidden"
              id="profile-image-upload"
              // Add onChange handler if needed
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={profileData.email || profileData.username}
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
              <div className="flex items-center">
                <input
                  type="password"
                  value="**********"
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border rounded-md"
                />
                <button className="ml-2 text-red-500 hover:text-red-700">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">
            <i className="fas fa-trash-alt"></i> Delete user
          </button>
          <div>
            <button className="px-4 py-2 mr-2 border border-gray-400 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
