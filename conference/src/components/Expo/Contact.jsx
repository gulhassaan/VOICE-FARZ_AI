import React, { useState } from 'react';
import axios from 'axios';
import { AiOutlineMail, AiOutlinePhone, AiOutlineClose } from 'react-icons/ai';
import { useHistory } from 'react-router-dom';
import EmailBox from '../../Assets/images/Email Box.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isClosing, setIsClosing] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    if (!token) {
      toast.error('No token found');
      return;
    }

    try {
      const response = await axios.post('https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/contact_us/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(response.data);
      toast.success('Contact request sent successfully');
    } catch (error) {
      console.error('There was an error sending the contact request!', error);
      toast.error('Failed to send contact request');
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      history.push('/pricing');
    }, 500);
  };

  return (
    <div className="animate-slideInRight relative min-h-screen flex items-center justify-center bg-[#F2911B] p-6">
      <div className="absolute top-4 right-4 md:top-14 md:right-14 cursor-pointer hover:bg-[#2424248a] p-1" onClick={handleClose}>
        <AiOutlineClose className="text-white text-2xl" />
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl font-bold text-white">Get In Touch</h1>
          <p className="text-lg text-white mb-8">Pricing built for people just like you.</p>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number (Optional)"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={formData.phone}
                onChange={handleChange}
              />
              <textarea
                name="message"
                placeholder="Message"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 h-32"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button
                type="submit"
                className="w-full py-4 bg-orange-400 text-white rounded-lg font-semibold hover:bg-orange-500 transition duration-300"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <img src={EmailBox} alt="Contact" className="mb-8" />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ContactForm;
