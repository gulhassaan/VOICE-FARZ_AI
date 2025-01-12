import React , {useState} from 'react';
import { useHistory } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai'; // Import an icon from react-icons

const PricingTable = () => {
    const [isClosing, setIsClosing] = useState(false);
  const history = useHistory();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      history.push('/dashboard');
    }, 500); // Duration of the zoomOut animation
  };
  const ContactUs  = () => {
    history.push('/contact');
  };
  const GetStarted  = () => {
    history.push('/dashboard');
  };
  

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen bg-[#F2911B] p-4 md:p-6 ${isClosing ? 'animate-zoomOut' : 'animate-zoomIn'}`}>
    <div className="absolute top-4 right-4 md:top-14 md:right-14 cursor-pointer hover:bg-[#2424248a] p-1" onClick={handleClose}>
      <AiOutlineClose className="text-white text-2xl" />
    </div>
      <div className="w-full max-w-4xl flex flex-col items-start">
        <div className="mb-10 md:mb-20 mx-4 md:mx-0 w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Pricing</h1>
          <p className="text-lg text-white">Pricing built for people just like you.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
          <div className="flex flex-col items-start">
            <div className="mb-4 text-left w-full md:w-[350px]">
              <h2 className="text-2xl font-semibold text-white">Free</h2>
              <p className="text-sm text-white">Limitless possibilities</p>
            </div>
            <div className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-md w-full md:w-[350px]">
              <div className="my-6">
                <span className="text-3xl font-bold">Features</span><span></span>
                <p className="text-sm text-gray-500">Get started at no cost</p>
              </div>
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <span className="text-[#4E2D92] font-bold">&#10003;</span>
                  <span className="ml-2">10 Transcriptions Per 24 hours</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#4E2D92] font-bold">&#10003;</span>
                  <span className="ml-2">10 Post Generations Per 24 hours</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#4E2D92] font-bold">&#10003;</span>
                  <span className="ml-2">2 Hours Per File Limit</span>
                </li>
              </ul>
              <button className="mt-6 w-full bg-orange-200 text-[#1E232C] py-2 rounded-full font-semibold" onClick={GetStarted}>Get Started</button>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <div className="mb-4 text-left w-full md:w-[350px] lg:w-[511px]">
              <h2 className="text-2xl font-semibold text-white">Enterprise</h2>
              <p className="text-sm text-white">Limitless possibilities</p>
            </div>
            <div className="bg-gray-800 text-white p-6 md:p-8 rounded-2xl shadow-md w-full md:w-[350px] lg:w-[511px]">
              <div className="my-6">
                <span className="text-3xl font-bold">Features</span><span></span>
                <p className="text-sm text-gray-400">Personalize your plan</p>
              </div>
              <div className="flex flex-wrap">
             
                <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <span className="text-[#787b80] font-bold">&#10003;</span>
                  <span className="ml-2">Custom Transcription Limit</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#787b80] font-bold">&#10003;</span>
                  <span className="ml-2">Custom Post Generation Limit</span>
                </li>
                <li className="flex items-center">
                  <span className="text-[#787b80] font-bold">&#10003;</span>
                  <span className="ml-2">4 Hours Per File Limit</span>
                </li>
              </ul>

              
              </div>
              <button className="mt-6 w-full bg-white text-[#1E232C] py-2 rounded-full font-bold hover:bg-orange-300" onClick={ContactUs}>Contact Us</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingTable;
