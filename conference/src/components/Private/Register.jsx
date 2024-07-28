import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory, NavLink, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../Assets/images/logo.png';
import Google from '../../Assets/images/google.png';
import Apple from '../../Assets/images/apple.png';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loader, setLoader] = useState(false);
    const [googleLoader, setGoogleLoader] = useState(false); // Added state for Google loader
    const [googleLink, setGoogleLink] = useState('');
    const history = useHistory();
    const location = useLocation();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validatePassword = (password) => {
        const minLength = /.{8,}/;
        const uppercase = /[A-Z]/;
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

        if (!minLength.test(password)) {
            toast.error('Password must be at least 8 characters long');
            return false;
        }
        if (!uppercase.test(password)) {
            toast.error('Password must contain at least one uppercase letter');
            return false;
        }
        if (!specialChar.test(password)) {
            toast.error('Password must contain at least one special character');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true); // Show spinner on form submission

        // Form validation
        if (formData.username === formData.password) {
            toast.error('Username and password cannot be the same');
            setLoader(false); // Hide spinner if validation fails
            return; // Exit the function if validation fails
        }

        if (!validatePassword(formData.password)) {
            setLoader(false); // Hide spinner if validation fails
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            setLoader(false); // Hide spinner if validation fails
            return;
        }
        try {
            const response = await axios.post('https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/signup/', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'accept': 'application/json',
                    'X-CSRFToken': 'Wdz2FF7IfhClKygAS1kqxaIVJJaxnHTwMM4SagZWTRlRqxbBucWvPvEiY8qY4IBQ'
                }
            });
            toast.success('Signup successful! Redirecting to OTP verification...');
            setTimeout(() => {
                setLoader(false); // Hide spinner before navigation
                history.push('/otp-verification', { email: formData.email }); 
            }, 2000); 
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            toast.error(error.response?.data?.error || 'An error occurred');
            setLoader(false); // Hide spinner on error
        }
    };

    const getGoogleLink = () => {
        axios.get('https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/googleredirect/')
            .then((res) => {
                setGoogleLink(res.data.url);
            })
            .catch((err) => {
                console.error('Error fetching Google link:', err);
            });
    };

    const checkGoogleLogin = async () => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        console.log('Extracted Code:', code);
        console.log('Extracted State:', state);
        console.log('Extracted Error:', error);

        if (code && state) {
            setGoogleLoader(true); // Show spinner for Google login
            try {
                const response = await axios.get(`https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/googlecallback/?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
                    headers: {
                        'accept': 'application/json'
                    }
                });
                const { token, user_info } = response.data;
                console.log('Google Callback Response:', response.data);
                console.log('User Info:', user_info);
                localStorage.setItem('Username', user_info.username);
                localStorage.setItem('Email', user_info.email);
                localStorage.setItem('GoogleProfileURL', user_info.google_picture_url);
                localStorage.setItem("token", token);
                toast.success('Login successful! Redirecting to dashboard...');
                setGoogleLoader(false);
                history.push('/dashboard');
            } catch (err) {
                console.error('Error during Google callback:', err.response ? err.response.data : err.message);
                setGoogleLoader(false);
            }
        } else if (error) {
            console.error('Error fetching Google link:', error);
        }
    };

    const showPasswordRequirements = () => {
        toast.info(
            <div>
                <ul className="list-disc list-inside">
                    <li>Min 8 characters</li>
                    <li>1 uppercase letter</li>
                    <li>1 special character</li>
                </ul>
            </div>,
            {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            }
        );
    };

    useEffect(() => {
        getGoogleLink();
    }, []);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        if (code && state) {
            checkGoogleLogin();
        }
    }, [location.search]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <ToastContainer />
            <div className="w-full max-w-xl p-8 space-y-1 bg-white">
                <div className="flex justify-center mb-4">
                    <img src={Logo} alt="Farz AI Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center">Register Your Account</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2 focus:ring-[#f2911b54] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2  focus:ring-[#f2911b54] focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={showPasswordRequirements}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2  focus:ring-[#f2911b54]  focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-4">
                            <i
                                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} cursor-pointer text-gray-600`}
                                onClick={togglePasswordVisibility}
                            ></i>
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirm-password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-4 text-gray-700 border border-gray-200 rounded-md bg-[#F7F8F9] focus:outline-none focus:ring-2  focus:ring-[#f2911b54]  focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center px-4">
                            <i
                                className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} cursor-pointer text-gray-600`}
                                onClick={toggleConfirmPasswordVisibility}
                            ></i>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 font-bold text-white bg-[#F2911B] rounded focus:ring-4 focus:ring-[#F2911B] flex justify-center items-center"
                    >
                        {loader ? (
                            <div className="w-7 h-7 border-4 border-t-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : 'Register'}
                    </button>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="border-t w-24"></div>
                        <span className='text-[#F2911B]'>Or Register with</span>
                        <div className="border-t w-24"></div>
                    </div>
                    <div className="flex items-center justify-center space-x-4 bg-[#f4f4f4]">
                        <a
                            href={googleLink}
                            className="flex items-center justify-center w-full px-4 py-3 border rounded hover:bg-gray-200"
                            onClick={() => setGoogleLoader(true)}
                        >
                            {googleLoader ? (
                                <div className="w-7 h-7 border-4 border-t-4 border-t-transparent border-gray-600 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <img src={Google} alt="Google" className="h-5 mr-2" />
                                    Google
                                </>
                            )}
                        </a>
                        {/* <button 
                            type="button"
                            className="flex items-center justify-center w-1/2 px-4 py-2 border rounded"
                        >
                            <img src={Apple} alt="Apple" className="h-5 mr-2" />
                            Apple
                        </button> */}
                    </div>
                </form>
                <p className="text-center">
                    Already have an account? <NavLink to="/" className="text-[#F2911B] hover:underline">Login Now</NavLink>
                </p>
            </div>
        </div>
    );
};

export default Register;
