import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    GoogleProfileURL: '',
    Email: '',
    Username: ''
  });

  useEffect(() => {
    // Fetch data from localStorage
    const GoogleProfileURL = localStorage.getItem('GoogleProfileURL');
    const Email = localStorage.getItem('Email');
    const Username = localStorage.getItem('Username') || localStorage.getItem('Email');
    
    setProfileData({
      GoogleProfileURL,
      Email,
      Username
    });
  }, []);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const getUsernameInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">Profile</h2>
          <button onClick={handleEditClick} className="text-[#F2911B] hover:text-orange-700">
            <i className="fas fa-edit"></i> Edit
          </button>
        </div>
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8">
          <div className="relative mb-4 lg:mb-0">
            {profileData.GoogleProfileURL ? (
              <img
                className="w-24 h-24 rounded-full object-cover"
                src={profileData.GoogleProfileURL}
                alt="User profile"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#F2911B] flex items-center justify-center text-3xl font-bold text-white">
                {getUsernameInitial(profileData.Username)}
              </div>
            )}
            {profileData.GoogleProfileURL && (
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
                value={profileData.Email || profileData.Username}
                disabled={!isEditing}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={profileData.Username}
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
                <button className="ml-2 text-orange-500 hover:text-orange-700">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
