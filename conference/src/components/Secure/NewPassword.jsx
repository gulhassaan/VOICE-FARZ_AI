import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Logo from '../../Assets/images/logo.png';

const MySwal = withReactContent(Swal);

const ResetPassword = () => {
    const history = useHistory();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        otp: ''
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        if (/^\d*$/.test(paste) && paste.length <= 6) {
            e.preventDefault();
            setFormData({
                ...formData,
                otp: paste
            });
        }
    };

    const validatePassword = (password) => {
        const minLength = /.{8,}/;
        const uppercase = /[A-Z]/;
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

        if (!minLength.test(password)) {
            MySwal.fire({
                icon: 'error',
                title: 'Password Error',
                text: 'Password must be at least 8 characters long',
            });
            return false;
        }
        if (!uppercase.test(password)) {
            MySwal.fire({
                icon: 'error',
                title: 'Password Error',
                text: 'Password must contain at least one uppercase letter',
            });
            return false;
        }
        if (!specialChar.test(password)) {
            MySwal.fire({
                icon: 'error',
                title: 'Password Error',
                text: 'Password must contain at least one special character',
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(formData.newPassword)) {
            return;
        }
        try {
            const response = await axios.post('https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/password_reset/reset_password/', {
                email: formData.email,
                new_password: formData.newPassword,
                otp: formData.otp
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'accept': 'application/json',
                    'X-CSRFToken': 'uHVjrasiYpHviVQpRsrTNQ9ZD2rdkQrskgq9WLkwCZq1YULqtD3Y5b5mSrHE1R9M' 
                }
            });

            if (response.data.previous_password && response.data.previous_password === formData.newPassword) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Password Error',
                    text: 'New password cannot be the same as the previous password',
                });
                return;
            }

            MySwal.fire({
                icon: 'success',
                title: 'Password Reset Successful',
                text: 'Password reset successfully! Redirecting to login...',
            });
            console.log('Response:', response.data);

            setTimeout(() => {
                history.push('/');
            }, 2000); 
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            MySwal.fire({
                icon: 'error',
                title: 'Password Reset Error',
                text: error.response?.data?.error || 'An error occurred',
            });
        }
    };

    const showPasswordRequirements = () => {
        MySwal.fire({
            icon: 'info',
            title: 'Password Requirements',
            html: (
                <div>
                    <ul className="list-disc list-inside">
                        <li>Min 8 characters</li>
                        <li>1 uppercase letter</li>
                        <li>1 special character</li>
                    </ul>
                </div>
            ),
            position: 'top-end',
            toast: true,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-white">
                <div className="flex justify-center mb-4">
                    <img src={Logo} alt="Farz AI Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                <p className="text-center text-gray-600">Please enter the OTP sent to your email and your new password.</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2 focus:ring-[#f2911b54] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="otp" className="sr-only">OTP</label>
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            placeholder="OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            onPaste={handlePaste}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2 focus:ring-[#f2911b54] focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="newPassword" className="sr-only">New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            placeholder="New Password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            onFocus={showPasswordRequirements}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2 focus:ring-[#f2911b54] focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-4">
                            <i
                                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} cursor-pointer text-gray-600`}
                                onClick={togglePasswordVisibility}
                            ></i>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 font-bold text-white bg-[#F2911B] rounded focus:ring-4 focus:ring-[#F2911B]"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
