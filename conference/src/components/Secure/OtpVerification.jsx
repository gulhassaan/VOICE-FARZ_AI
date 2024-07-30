import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../Assets/images/logo.png';

const OtpVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const history = useHistory();
    const location = useLocation();
    const email = location.state?.email;

    const handleChange = (index, value) => {
        if (/^\d*$/.test(value)) { // Ensure only digits are allowed
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move focus to the next input field if the current one is filled
            if (value && index < otpRefs.current.length - 1) {
                otpRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        if (/^\d*$/.test(paste) && paste.length === otp.length) {
            const newOtp = paste.split('');
            setOtp(newOtp);
            newOtp.forEach((value, index) => {
                if (index < otpRefs.current.length) {
                    otpRefs.current[index].value = value;
                }
            });
            otpRefs.current[otp.length - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/verify_email/', {
                email: email,
                otp: otp.join('')
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'accept': 'application/json',
                    'X-CSRFToken': 'XR9cI9eVteVpZ9q0yfy0GTFCIrMXuYieNqE2dK697OEVF8l1aqa5YeBZXQ2obZ0y' 
                }
            });
            toast.success('Email verified successfully!');
            setTimeout(() => {
                history.push('/'); 
            }, 2000);
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.error || 'An error occurred');
        }
    };

    useEffect(() => {
        // Automatically focus the first input on component mount
        otpRefs.current[0]?.focus();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <ToastContainer />
            <div className="w-full max-w-md p-8 space-y-6 bg-white">
                <div className="flex justify-center mb-4">
                    <img src={Logo} alt="Farz AI Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center">OTP Verification</h2>
                <p className="text-center text-gray-600">Enter the verification code we just sent to your email address.</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                ref={(el) => (otpRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={value}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-2xl text-center text-gray-700 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F2911B] focus:border-transparent bg-[#F7F8F9]"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 font-bold text-white bg-[#F2911B] rounded focus:ring-4 focus:ring-[#F2911B]"
                    >
                        Verify
                    </button>
                </form>
                <p className="text-center text-gray-600">
                    {/* <a href="#" className="text-[#F2911B] hover:underline">Resend</a> 00:00 */}
                </p>
            </div>
        </div>
    );
};

export default OtpVerification;
