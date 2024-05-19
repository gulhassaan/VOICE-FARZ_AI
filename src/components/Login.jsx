import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import loginImg from '../assets/AI.png';
import Navbar from './Navbar';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    if (localToken) {
        setToken(localToken);
    } else if (sessionToken) {
        setToken(sessionToken);
    }
    if (token) {
      // If token is available, verify it with backend
      axios.post("http://localhost:8000/verify_login/",null,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Token ${token}`
        },
      }
    )
        .then(response => {
          // If verification is successful, set login status to true
          
          navigate('/dashboard')
        })
        .catch(error => {
            // If verification fails, remove token and set login status to false
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
          console.log("Error verifying token on Navbar: ", error.response.data)
        });
    } else {
      
    }
  } ,[token]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'rememberMe') {
      setRememberMe(e.target.checked);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      username: username,
      password: password
    };
    try {
      const response = await axios.post('http://localhost:8000/login/', data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (response.status !== 200) {
        throw new Error('Login failed');
      }
      const { token } = response.data;
      console.log('Token:', token);
      setToken(token);
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      console.log('Login successful.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Login failed. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className='grid grid-cols-1 sm:grid-cols-2 h-screen w-full'>
        <div className='hidden sm:block'>
          <img className='w-full h-full object-cover' src={loginImg} alt='' />
        </div>
        <div className='bg-[#F2911B] flex flex-col justify-center'>
          <form className='max-w-[400px] w-full mx-auto rounded-lg bg-[#F5C283] p-8 px-8' onSubmit={handleSubmit}>
            <h2 className='text-4xl dark:text-white font-bold text-center'>LOG IN</h2>
            <div className='flex flex-col text-gray-400 py-2'>
              <label>Username</label>
              <input
                className='rounded-lg mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none'
                type='text'
                name='username'
                value={username}
                onChange={handleInputChange}
              />
            </div>
            <div className='flex flex-col text-gray-400 py-2'>
              <label>Password</label>
              <input
                className='p-2 rounded-lg bg-[#ececec] mt-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none'
                type='password'
                name='password'
                value={password}
                onChange={handleInputChange}
              />
            </div>
            <div className='flex justify-between text-gray-400 py-2'>
              <p className='flex items-center'>
                <input className='mr-2' type='checkbox' name='rememberMe' onChange={handleInputChange} /> Remember Me
              </p>
              <p>Forgot Password</p>
            </div>
            
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button
              className='w-full my-5 py-2 bg-[#F2911B] shadow-[#F5C283] hover:shadow-[#F5C283] text-white font-semibold rounded-lg'
              type='submit'
            >
              Log in
            </button>
            <div className='text-center'>
              <p className='text-gray-400'>
                Don't have an account?{' '}
                <button
                  className="text-orange-500 hover:underline hover:text-orange-700 transition-colors duration-200 px-1"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}