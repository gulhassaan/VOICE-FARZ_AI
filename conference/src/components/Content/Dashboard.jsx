
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

            <div className="flex flex-col items-center mt-4 p-8 bg-[#E8ECF4] rounded-2xl " style={{height:"93vh"}}>
                <img src={DashboardMain} alt="Change Your Speech Into Ideas" className=" hidden lg:block md:block w-1/4 mb-8" />
                <div className="text-center ">
                    <h2 className="text-xl font-semibold">Amplify Your Reach: </h2>
                    <p className="text-gray-500 mt-8">Instantly Transform Audio/Video into Social Media Posts using Farz AI Voice Amplified.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mt-20">
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
