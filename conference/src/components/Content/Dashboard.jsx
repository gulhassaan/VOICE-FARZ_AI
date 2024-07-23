
import { IoMdSunny, IoMdMoon } from 'react-icons/io';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import Recording from "../../Assets/images/recordIcon.png";
import UploadFile from "../../Assets/images/uploadIcon.png";
import YoutubeLink from "../../Assets/images/youtubeIcon.png";
import DashboardMain from '../../Assets/images/dashboardmain.png';
// import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Dashboard = () => {
    const history = useHistory();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn('Session Expired. Please log in again.', {
                position: toast.POSITION.TOP_CENTER,
                onClose: () => {
                    history.push('/');
                },
            });
        }
    }, [history]);

    const handleLiveRecordClick = () => {
        history.push('/live-record');
    };
    const handleUploadFileClick = () => {
        history.push('/upload-file');
    };
    const handleYoutubeLinkClick = () => {
        history.push('/youtube-link');
    };
    const Username = localStorage.getItem("Username") || "User";
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState('');


    useEffect(() => {
        const storedUsername = localStorage.getItem('Username');
        const storedProfilePicture = localStorage.getItem('ProfilePicture'); 
        setUsername(storedUsername || 'User'); 
        setProfilePicture(storedProfilePicture || '');
    }, []);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleLogout = () => {
        localStorage.clear();
        history.push('/');
    };
    const handleDashboardClick = () => {
        history.push("/dashboard");
      };
    
    return (
        <div>
 <div className="flex mt-4  flex-col-reverse md:flex-row justify-between items-center bg-white border-b-2 lg:pb-2">
            <div className="flex items-center">
            {/* <h1 className="lg:text-2xl text-sm font-bold">{username}👋</h1> */}
            <p
        className="text-lg font-semibold mt-2 cursor-pointer"
        onClick={handleDashboardClick}
      >
        Dashboard 
      </p>
            </div>
            <div className="relative">
                <button
                    className="flex items-center justify-center w-12 h-12 bg-[#F2911B] rounded-full"
                    onClick={toggleDropdown}
                >
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <span className="text-xl font-bold text-gray-700">
                        {username.charAt(0).toUpperCase()}
                      </span>
                      
                    )}
                </button>
                {dropdownVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg">
                        {/* <button
                            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-[#F2911B]"
                            onClick={() => history.push('/setting')}
                        >
                            <FiSettings className="mr-2" />
                            Settings
                        </button> */}
                        <button
                            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-[#F2911B]"
                            onClick={handleLogout}
                        >
                            <FiLogOut className="mr-2" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>

            <div className="flex flex-col items-center mt-4 p-8 bg-[#E8ECF4] rounded-2xl">
                <img src={DashboardMain} alt="Change Your Speech Into Ideas" className="w-1/4 mb-8" />
                <div className="text-center mb-8">
                    <h2 className="text-xl font-semibold">Amplify Your Reach: </h2>
                    <p className="text-gray-500 mt-2">Instantly Transform Audio/Video into Social Media Posts using Farz AI Voice Amplified.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                    <div 
                        className="flex flex-col items-center p-6 bg-[#1E232C] text-white rounded-3xl cursor-pointer transform transition-transform hover:scale-105 shadow-lg w-full max-w-xs mx-auto"
                        style={{ boxShadow: '10px 10px 0px #f2911b' }}
                        onClick={handleLiveRecordClick}
                    >
                        <div className="flex items-center justify-center w-16 h-16 bg-[#F2911B] rounded-full mb-4">
                            <img src={Recording} alt="Live Recording" className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-semibold">Live Recording</h3>
                        {/* <p className="mt-2 text-center text-xs">A sample is a good way to see best practices for inspiration.</p> */}
                    </div>
                    <div 
                       className="flex flex-col items-center p-6 bg-[#1E232C] text-white rounded-3xl cursor-pointer transform transition-transform hover:scale-105 shadow-lg w-full max-w-xs mx-auto"
                       style={{ boxShadow: '10px 10px 0px #f2911b' }}
                        onClick={handleUploadFileClick}
                    >
                        <div className="flex items-center justify-center w-16 h-16 bg-[#F2911B] rounded-full mb-4">
                            <img src={UploadFile} alt="Upload File" className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-semibold">Upload Audio/Video Files</h3>
                        {/* <p className="mt-2 text-center text-xs">A sample is a good way to see best practices for inspiration.</p> */}
                    </div>
                    <div 
                        className="flex flex-col items-center p-6 bg-[#1E232C] text-white rounded-3xl cursor-pointer transform transition-transform hover:scale-105 shadow-lg w-full max-w-xs mx-auto"
                        style={{ boxShadow: '10px 10px 0px #f2911b' }}
                        onClick={handleYoutubeLinkClick}
                    >
                        <div className="flex items-center justify-center w-16 h-16 bg-[#F2911B] rounded-full mb-4">
                            <img src={YoutubeLink} alt="YouTube Link" className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-semibold">YouTube Links</h3>
                        {/* <p className="mt-2 text-center text-xs">A sample is a good way to see best practices for inspiration.</p> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
