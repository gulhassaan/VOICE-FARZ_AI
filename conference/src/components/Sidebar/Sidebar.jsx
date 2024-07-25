import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useHistory, NavLink } from "react-router-dom";
import {
  FiMenu,
  FiEdit,
  FiTrash2,
  FiLogOut,
  FiSearch,
  FiMessageSquare,
} from "react-icons/fi";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { BsChatSquareDots } from "react-icons/bs";
import axios from "axios";
import Logo from "../../Assets/images/logo.png";
import moment from "moment";
import Swal from "sweetalert2";
import "react-confirm-alert/src/react-confirm-alert.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const history = useHistory();

  const Username = localStorage.getItem("Username") || "User";
  const GoogleProfileURL = localStorage.getItem("GoogleProfileURL");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearchBar = () => {
    setIsSearchBarVisible(!isSearchBarVisible);
    if (!isSearchBarVisible) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100); // Slight delay to ensure the input is rendered before focusing
    }
  };

  const fetchHistoryTitles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please login first.");
      return;
    }

    try {
      const response = await axios.get(
        "https://speechinsightsweb.azurewebsites.net/speech_history/",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setTitles(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setTitles([]);
      }
    } catch (error) {
      console.error("Error fetching speech history titles:", error);
      setTitles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryTitles();
  }, []);

  useEffect(() => {
    // Fetch data again on location change to ensure up-to-date titles
    fetchHistoryTitles();
  }, [location.pathname]);

  const handleHistoryClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const Logout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "No, stay logged in",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        history.push("/");
        Swal.fire({
          icon: "success",
          title: "Logged Out!",
          text: "You have been logged out.",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please login first.");
      return;
    }

    try {
      const response = await axios.delete(
        `https://speechinsightsweb.azurewebsites.net/speech_history/${id}/delete/`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.message === "Speech thread deleted successfully"
      ) {
        setTitles(titles.filter((title) => title.id !== id));
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error deleting speech thread:", error);
    }
  };

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Confirm to delete",
      text: "Are you sure you want to delete this speech history?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id);
        Swal.fire(
          "Deleted!",
          "Your speech history has been deleted.",
          "success"
        );
      }
    });
  };

  const clearAllHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please login first.");
      return;
    }
    try {
      await axios.delete(
        "https://speechinsightsweb.azurewebsites.net/speech_history/clear/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchHistoryTitles();
      Swal.fire("Cleared!", "All history has been cleared.", "success");
    } catch (error) {
      console.error("Error clearing history:", error);
      Swal.fire(
        "Error",
        "Failed to clear history. Please try again later.",
        "error"
      );
    }
  };

  const truncateTitle = (title, maxLength) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  const categorizeHistory = (titles) => {
    const today = [];
    const yesterday = [];
    const previousWeek = [];
    const pastHistory = [];

    const todayDate = moment().startOf("day");
    const yesterdayDate = moment().subtract(1, "days").startOf("day");
    const previousWeekDate = moment().subtract(7, "days").startOf("day");

    titles.forEach((title) => {
      const titleDate = moment(title.created_at);

      if (titleDate.isSame(todayDate, "day")) {
        today.push(title);
      } else if (titleDate.isSame(yesterdayDate, "day")) {
        yesterday.push(title);
      } else if (titleDate.isAfter(previousWeekDate)) {
        previousWeek.push(title);
      } else {
        pastHistory.push(title);
      }
    });

    return { today, yesterday, previousWeek, pastHistory };
  };

  const filteredTitles = titles.filter((title) =>
    title.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { today, yesterday, previousWeek, pastHistory } =
    categorizeHistory(filteredTitles);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 w-full z-50 bg-transparent p-4 bg-white  ">
        <button
          onClick={toggleSidebar}
          className="text-black focus:outline-none space-x-2"
        >
          <FiMenu className="h-6 w-6 inline-block" />
          <img
            src={Logo}
            alt="Farz AI Logo"
            className="h-8 w-auto cursor-pointer inline-block"
          />
        </button>
      </div>

      <div
        className={`lg:w-72 bg-[#1E232C] text-white flex flex-col justify-between fixed lg:relative inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
        style={{ height: "101vh" }}
      >
        <div className="flex-1 overflow-y-auto scrollbar-sidebar">
        <div className="flex space-x-4 items-center justify-between lg:justify-center px-6 py-4">
  <img
    src={Logo}
    alt="Farz AI Logo"
    className="h-8 w-auto cursor-pointer"
  />
  <div className="relative">
    <button
      onClick={toggleSidebar}
      className="text-black bg-[#f2911b] rounded-full p-1 focus:outline-none lg:hidden absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2"
    >
      <MdOutlineKeyboardDoubleArrowLeft className="h-5 w-5" />
    </button>
  </div>
</div>


          <div className="px-4 flex items-center justify-between">
            <NavLink
              onClick={toggleSidebar}
              to="/dashboard"
              className="bg-[#f2911b] py-2 px-6 lg:px-12 rounded-full text-white font-regular flex items-center"
            >
              <span className="mr-2">+</span> New Voice
            </NavLink>
            <button
              className="text-white bg-gray-600 p-2 rounded-full flex items-center justify-center ml-2"
              onClick={toggleSearchBar}
            >
              <FiSearch className="h-4 w-4" />
            </button>
          </div>
          {isSearchBarVisible && (
            <div className="px-4 mt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-full focus:outline-none"
                placeholder="Search conversations..."
                ref={searchInputRef}
              />
            </div>
          )}
          <nav className="mt-4 pl-4 space-y-2">
            <div className="flex justify-between items-center px-4">
              <div className="text-gray-500 text-xs">Today</div>
              <button
                onClick={clearAllHistory}
                className="text-white bg-gray-600 px-2 py-1 rounded-full flex items-center text-xs"
              >
                Clear All
              </button>
            </div>
            {loading ? (
              <div className="text-gray-500 text-xm mt-4 pt-4">Loading...</div>
            ) : filteredTitles.length === 0 ? (
              <div className="text-gray-500 text-xm mt-4 pt-4">
                No History Available
              </div>
            ) : (
              <>
                {today.map((title, index) => (
                  <Link
                    to={`/conversation/${title.id}`}
                    key={index}
                    className={`flex items-center justify-between px-4 py-2 text-white hover:bg-gray-700 rounded-lg ${
                      location.pathname === `/conversation/${title.id}`
                        ? "border-b-2 border-[#f2911b] rounded-l-3xl bg-gray-700"
                        : ""
                    }`}
                    onClick={handleHistoryClick}
                  >
                    <div className="flex items-center space-x-2">
                      <BsChatSquareDots className="h-4 w-4 text-gray-400" />
                      <span className="text-xs truncate">
                        {truncateTitle(title.title, 30)}
                      </span>
                    </div>
                    {location.pathname === `/conversation/${title.id}` && (
                      <div className="flex items-center bg-[#1E232C] p-2 rounded-lg space-x-1">
                        <button
                          className="text-gray-400 hover:text-white focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            confirmDelete(title.id);
                          }}
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </Link>
                ))}

                {yesterday.length > 0 && (
                  <div className="text-gray-500 text-xs mt-4">Yesterday</div>
                )}
                {yesterday.map((title, index) => (
                  <Link
                    to={`/conversation/${title.id}`}
                    key={index}
                    className={`flex items-center justify-between px-4 py-2 text-white hover:bg-gray-700 rounded-lg ${
                      location.pathname === `/conversation/${title.id}`
                        ? "border-b-2 border-[#f2911b] rounded-l-3xl bg-gray-700"
                        : ""
                    }`}
                    onClick={handleHistoryClick}
                  >
                    <div className="flex items-center space-x-2">
                      <BsChatSquareDots className="h-4 w-4 text-gray-400" />
                      <span className="text-xs truncate">
                        {truncateTitle(title.title, 30)}
                      </span>
                    </div>
                    {location.pathname === `/conversation/${title.id}` && (
                      <div className="flex items-center bg-[#1E232C] p-2 rounded-lg space-x-1">
                        <button
                          className="text-gray-400 hover:text-white focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            confirmDelete(title.id);
                          }}
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </Link>
                ))}

                {previousWeek.length > 0 && (
                  <div className="text-gray-500 text-xs mt-4">
                    Previous 7 Days
                  </div>
                )}
                {previousWeek.map((title, index) => (
                  <Link
                    to={`/conversation/${title.id}`}
                    key={index}
                    className={`flex items-center justify-between px-4 py-2 text-white hover:bg-gray-700 rounded-lg ${
                      location.pathname === `/conversation/${title.id}`
                        ? "border-b-2 border-[#f2911b] rounded-l-3xl bg-gray-700"
                        : ""
                    }`}
                    onClick={handleHistoryClick}
                  >
                    <div className="flex items-center space-x-2">
                      <FiMessageSquare className="h-5 w-5 text-gray-400" />
                      <span className="text-xs truncate">
                        {truncateTitle(title.title, 30)}
                      </span>
                    </div>
                    {location.pathname === `/conversation/${title.id}` && (
                      <div className="flex items-center bg-[#1E232C] p-2 rounded-lg space-x-1">
                        <button
                          className="text-gray-400 hover:text-white focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            confirmDelete(title.id);
                          }}
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </Link>
                ))}

                {pastHistory.length > 0 && (
                  <div className="text-gray-500 text-xs mt-4">Past History</div>
                )}
                {pastHistory.map((title, index) => (
                  <Link
                    to={`/conversation/${title.id}`}
                    key={index}
                    className={`flex items-center justify-between px-4 py-2 text-white hover:bg-gray-700 rounded-lg ${
                      location.pathname === `/conversation/${title.id}`
                        ? "border-b-2 border-[#f2911b] rounded-l-3xl bg-gray-700"
                        : ""
                    }`}
                    onClick={handleHistoryClick}
                  >
                    <div className="flex items-center space-x-2">
                      <FiMessageSquare className="h-5 w-5 text-gray-400" />
                      <span className="text-xs truncate">
                        {truncateTitle(title.title, 30)}
                      </span>
                    </div>
                    {location.pathname === `/conversation/${title.id}` && (
                      <div className="flex items-center bg-[#1E232C] p-2 rounded-lg space-x-1">
                        <button
                          className="text-gray-400 hover:text-white focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            confirmDelete(title.id);
                          }}
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>





        <div className="px-4 py-4 bg-[#1E232C] border-t border-gray-700 flex flex-col space-y-2">
  <div className="flex items-center space-x-2 border border-gray-600 rounded-full px-4 py-2">
    {GoogleProfileURL ? (
      <img
        src={GoogleProfileURL}
        alt="Profile"
        className="h-6 w-6 rounded-full"
      />
    ) : (
      <div className="h-6 w-6 rounded-full bg-[#6A707C] flex items-center justify-center text-sm font-bold text-black">
        {Username.charAt(0).toUpperCase()}
      </div>
    )}
    <span className="text-white text-sm">{Username}</span>
  </div>
  <button
    onClick={Logout}
    className="flex items-center space-x-2 border border-gray-600 rounded-full px-4 py-2 text-white text-sm hover:bg-gray-700 transition duration-300"
  >
    <div className="bg-[#6A707C] p-2 rounded-full text-black">
      <FiLogOut className="h-3 w-3" />
    </div>
    <span>Logout</span>
  </button>
</div>









      </div>

      {isOpen && (
        <div
          className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm transition-opacity opacity-100 z-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          {" "}
        </div>
      )}
    </>
  );
};

export default Sidebar;
