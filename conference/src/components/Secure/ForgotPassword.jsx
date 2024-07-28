import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory hook
import Logo from '../../Assets/images/logo.png';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';

const ForgotPassword = () => {
    const history = useHistory(); // Initialize useHistory hook
    const [email, setEmail] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/resend_password_reset_otp/', {
                email: email
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'accept': 'application/json',
                    'X-CSRFToken': 'uHVjrasiYpHviVQpRsrTNQ9ZD2rdkQrskgq9WLkwCZq1YULqtD3Y5b5mSrHE1R9M' 
                }
            });
            toast.success('OTP sent successfully!');
            console.log('Response:', response.data);

            // Redirect to /new-password after successful OTP send
            setTimeout(() => {
                // Redirect to /new-password after successful OTP send
                history.push('/new-password');
            }, 2000); 
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <ToastContainer />
            <div className="w-full max-w-md p-8 space-y-6 bg-white">
                <div className="flex justify-center mb-4">
                    <img src={Logo} alt="Farz AI Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center">Forgot Password?</h2>
                <p className="text-center text-gray-600">Don't worry! It occurs. Please enter the email address linked with your account.</p>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            value={email}
                            onChange={handleChange}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2 focus:ring-[#F2911B] focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 font-bold text-white bg-[#F2911B] rounded focus:ring-4 focus:ring-[#F2911B]"
                    >
                        Send Code
                    </button>
                </form>
                <NavLink to="/" className="text-center text-gray-600">
                    <a  className="text-[#F2911B] hover:underline">Back to Login</a>
                </NavLink>
            </div>
        </div>
    );
};

export default ForgotPassword;
