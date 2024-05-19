import React from "react";
import { NavLink } from "react-router-dom";

const LeftSidebar = ({ option }) => {
  return (
    <aside className="hidden sm:flex sm:flex-col">
      <div className="flex-grow flex flex-col justify-between text-gray-500 bg-[#F2911B]">
        <nav className="flex flex-col mx-6 my-6 space-y-4">
          <NavLink
            to="/dashboard"
            className={`${
              option === "dashboard"
                ? "bg-black text-white"
                : "bg-[#F2911B] text-black hover:text-white hover:bg-white"
            } inline-flex items-center justify-center p-5 rounded-lg`}
          >
            <svg
              enableBackground="new 0 0 64 64"
              id="Layer_1"
              version="1.1"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
            >
              <g>
                <path d="M38,54.0001221c0,1.1044922,0.8955078,2,2,2s2-0.8955078,2-2v-1c0-4.9624023-4.0375977-9-9-9h-2c-4.9624023,0-9,4.0375977-9,9v1c0,1.1044922,0.8955078,2,2,2s2-0.8955078,2-2v-1c0-2.7568359,2.2431641-5,5-5h2c2.7568359,0,5,2.2431641,5,5V54.0001221z"/>
                <path d="M61.2695313,24.4547119l-28-23c-0.7382813-0.6064453-1.8007813-0.6064453-2.5390625,0l-28,23C2.2680664,24.8345947,2,25.4014893,2,26.0001221v8c0,1.1044922,0.8955078,2,2,2h3v25c0,1.1044922,0.8955078,2,2,2h15c1.1044922,0,2-0.8955078,2-2s-0.8955078-2-2-2H11v-25c0-1.1044922-0.8955078-2-2-2H6v-5.0546875L32,5.588501l26,21.3569336v5.0546875h-3c-1.1044922,0-2,0.8955078-2,2v25H40c-1.1044922,0-2,0.8955078-2,2s0.8955078,2,2,2h15c1.1044922,0,2-0.8955078,2-2v-25h3c1.1044922,0,2-0.8955078,2-2v-8C62,25.4014893,61.7319336,24.8345947,61.2695313,24.4547119z"/>
              </g>
            </svg>
          </NavLink>
          <NavLink
            to="/history"
            className={`${
              option === "history"
                ? "bg-black text-white"
                : "bg-[#F2911B] text-black hover:text-white hover:bg-white"
            } inline-flex items-center justify-center p-5 rounded-lg`}
          >
            <svg
              height="21px"
              version="1.1"
              viewBox="0 0 20 21"
              width="20px"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
            >
              <g fill="none" fillRule="evenodd" id="Page-1" stroke="none" strokeWidth="1">
                <g fill="#000000" id="Core" opacity="0.9" transform="translate(-464.000000, -254.000000)">
                  <g id="history" transform="translate(464.000000, 254.500000)">
                    <path d="M10.5,0 C7,0 3.9,1.9 2.3,4.8 L0,2.5 L0,9 L6.5,9 L3.7,6.2 C5,3.7 7.5,2 10.5,2 C14.6,2 18,5.4 18,9.5 C18,13.6 14.6,17 10.5,17 C7.2,17 4.5,14.9 3.4,12 L1.3,12 C2.4,16 6.1,19 10.5,19 C15.8,19 20,14.7 20,9.5 C20,4.3 15.7,0 10.5,0 L10.5,0 Z M9,5 L9,10.1 L13.7,12.9 L14.5,11.6 L10.5,9.2 L10.5,5 L9,5 L9,5 Z" id="Shape"/>
                  </g>
                </g>
              </g>
            </svg>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default LeftSidebar;