import React, { useState, useEffect } from "react";
import Logo from "../assets/logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

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
      axios
        .post("http://localhost:8000/verify_login/", null, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Token ${token}`,
          },
        })
        .then((response) => {
          // If verification is successful, set login status to true
          setIsLoggedIn(true);
        })
        .catch((error) => {
          // If verification fails, remove token and set login status to false
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          setIsLoggedIn(false);
          console.log("Error verifying token on Navbar: ", error.response.data);
        });
    } else {
      // If token is not available, set login status to false
      setIsLoggedIn(false);
    }
  }, [token]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="bg-white">
        <nav className="flex justify-between items-center w-full mx-auto flex-col md:flex-row">
          <div className="flex items-center gap-6 z-10">
            <img className="w-20 cursor-pointer" src={Logo} alt="Logo" />
            <button
              className="md:hidden bg-[#F2911B] p-2 rounded"
              onClick={toggleMenu}
            >
              <ion-icon
                name={menuOpen ? "close-outline" : "menu-outline"}
                className="text-3xl text-black cursor-pointer"
              ></ion-icon>
              {/* {menuOpen ? "Close" : "Menu"} */}
            </button>
          </div>
          <div
            className={`${
              menuOpen ? "block" : "hidden"
            } md:block relative bg-white md:relative w-full md:w-auto flex flex-col md:flex-row items-start justify-center px-5`}
          >
            <ul className="flex flex-col md:flex-row md:items-center gap-8">
              <li>
                <p className="hover:text-[#F2911B]">Products</p>
              </li>
              <li>
                <p className="hover:text-[#F2911B]">Solution</p>
              </li>
              <li>
                <p className="hover:text-[#F2911B]">Resource</p>
              </li>
              <li>
                <p className="hover:text-[#F2911B]">Developers</p>
              </li>
              <li>
                <p className="hover:text-[#F2911B]">Pricing</p>
              </li>
              <li>
                <div className="flex items-center gap-6">
                  <button
                    className="bg-[#F2911B] text-white px-5 py-2 rounded-full hover:bg-[#ffb254] "
                    onClick={() => {
                      if (isLoggedIn) {
                        // Logout user
                        localStorage.removeItem("token");
                        sessionStorage.removeItem("token");
                        setIsLoggedIn(false);
                        navigate("/login");
                      } else {
                        // If user is not logged in, redirect to login page
                        navigate("/login");
                      }
                    }}
                  >
                    {isLoggedIn ? "Logout" : "Login"}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;