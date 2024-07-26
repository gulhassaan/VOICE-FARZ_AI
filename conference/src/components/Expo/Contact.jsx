import React , {useState} from 'react';
import { AiOutlineMail, AiOutlinePhone, AiOutlineClose } from 'react-icons/ai'; // Importing icons from react-icons
import { useHistory } from 'react-router-dom'; // Importing useHistory for navigation
import EmailBox from '../../Assets/images/Email Box.png';

const ContactForm = () => {
  const [isClosing, setIsClosing] = useState(false);
  const history = useHistory();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      history.push('/price');
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
            <form className="space-y-6">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <textarea
                placeholder="Message"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 h-32"
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
    </div>
  );
};

export default ContactForm;
