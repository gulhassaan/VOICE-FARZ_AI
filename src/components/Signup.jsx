import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useHistory hook
import loginImg from '../assets/AI.png';
import Navbar from './Navbar';

export default function Signup() {
  const navigate = useNavigate(); // Initialize useHistory hook
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    try {
      const response = await axios.post(
        // 'http://localhost:8000/signup/',
        `${process.env.REACT_APP_BASE_URL}/signup/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      // Handle successful signup
      console.log('Signup successful:', response.data);
      // alert('Signup successful')
      navigate('/login')
    } catch (error) {
      console.error('Signup failed:', error);
      // Handle signup failure (display error message, etc.)
    }
  };

  return (
    <>
    <Navbar />
    <div className='grid grid-cols-1 sm:grid-cols-2 h-screen w-full'>
      <div className='hidden sm:block'>
        <img className='w-full h-full object-cover' src={loginImg} alt='' />
      </div>

      <div className='bg-gray-800 flex flex-col justify-center'>
        <form className='max-w-[400px] w-full mx-auto rounded-lg bg-gray-900 p-8 px-8' onSubmit={handleSubmit}>
          <h2 className='text-4xl text-[#F2911B] font-bold text-center'>Sign Up </h2>
          <div className='flex flex-col text-white py-2'>
            <label>Username</label>
            <input
              className='rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none'
              type='text'
              name='username'
              value={username}
              onChange={handleInputChange}
            />
          </div>
          <div className='flex flex-col text-white py-2'>
            <label>Email</label>
            <input
              className='rounded-lg bg-gray-700 mt-2 p-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none'
              type='email'
              name='email'
              value={email}
              onChange={handleInputChange}
            />
          </div>
          <div className='flex flex-col text-white py-2'>
            <label>Password</label>
            <input
              className='p-2 rounded-lg bg-gray-700 mt-2 focus:border-blue-500 focus:bg-gray-800 focus:outline-none'
              type='password'
              name='password'
              value={password}
              onChange={handleInputChange}
            />
          </div>
          <div className='flex justify-between text-white py-2'>
            <p className='flex items-center'>
              <input className='mr-2' type='checkbox' /> Remember Me
            </p>
            <p>Forgot Password</p>
          </div>
          <button
            className='w-full my-5 py-2 bg-[#F2911B] shadow-lg shadow-teal-500/50 hover:shadow-teal-500/40 text-white font-semibold rounded-lg'
            type='submit'
          >
            Signup
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
