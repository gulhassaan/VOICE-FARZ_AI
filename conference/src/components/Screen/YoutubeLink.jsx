import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IoMdMoon } from "react-icons/io";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faEdit,faSave,
  faAngleUp,
  faTimes,
  faCopy,
  faPenToSquare,
  faWandMagicSparkles,
  faPlus,
  faMinus,
  faDownload,
  faUpload,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Summary from "../../Assets/images/summary1.png";
import eBook from "../../Assets/images/ebook1.png";
import Blog from "../../Assets/images/blog1.png";
import MeetingNotes from "../../Assets/images/whitepaper.png";
import Facebook from "../../Assets/images/facebook1.png";
import Twitter from "../../Assets/images/twitter1.png";
import LinkedIn from "../../Assets/images/linkedin1.png";
import Instagram from "../../Assets/images/instagram1.png";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "../../App.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const YoutubeLink = () => {
  const history = useHistory();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please log in again.",
        confirmButtonText: "OK",
      }).then(() => {
        history.push("/");
      });
    }
  }, [history]);

  const [files, setFiles] = useState([]);
  const [isYouTubeLinkOpen, setIsYouTubeLinkOpen] = useState(true);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);
  const [isUploadCoverOpen, setIsUploadCoverOpen] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(true);
  const [youtubeLinks, setYoutubeLinks] = useState([""]);
  const [transcript, setTranscript] = useState("");
  const [isEditing, setIsEditing] = useState(true); // Set to true by default
  const [speechThreadId, setSpeechThreadId] = useState(null);
  const [generatedStatus, setGeneratedStatus] = useState([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isStepCompleted, setIsStepCompleted] = useState([false, false, false, false]);
  const [savedGeneratedPosts, setSavedGeneratedPosts] = useState({});
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureName, setProfilePictureName] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const profilePictureInputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const Username = localStorage.getItem("Username") || "User";
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");
  const editorInstance = useRef(null);
  const generatedPostRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const scrollToGeneratedPost = () => {
    setTimeout(() => {
      if (generatedPostRef.current) {
        generatedPostRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }, 100);
  };

  const [currentTitle, setCurrentTitle] = useState(""); // Added state for currentTitle
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // State for managing submit button

  useEffect(() => {
    if (!token) {
      console.error("No token found. Please login first.");
    }
  }, [token]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    setProfilePictureUrl(null); // Clear previous profile picture URL
    if (!token) {
      console.error("No token found. Please login first.");
    } else {
      axios
        .get("https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/profile_picture/", {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          // setProfilePictureUrl(response.data.image);
        })
        .catch((error) => {
          console.error("Error fetching profile picture:", error);
        });
    }
  }, [token]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (validImageTypes.includes(file.type)) {
        setProfilePictureName(file.name); // Set the file name
        const formData = new FormData();
        formData.append("image", file);
        formData.append("user", 1); // Change the user ID accordingly

        axios
          .post(
            "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/profile_picture/",
            formData,
            {
              headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "multipart/form-data",
              },
            }
          )
          .then((response) => {
            setProfilePictureUrl(response.data.image);
          })
          .catch((error) => {
            console.error("Error uploading profile picture:", error);
          });
      } else {
        console.error("Invalid file type. Please select an image file.");
      }
    }
  };

  const handleSaveText = () => {
    setIsEditing(false);
    setIsTranscriptOpen(!isTranscriptOpen);
  };

  const handleYouTubeLinkChange = (index, event) => {
    const newLinks = [...youtubeLinks];
    newLinks[index] = event.target.value;
    setYoutubeLinks(newLinks);
    setIsSubmitDisabled(newLinks.every(link => link === "")); // Enable submit button if any link is not empty
  };

  const handleAddYouTubeLink = () => {
    setYoutubeLinks([...youtubeLinks, ""]);
  };

  const handleRemoveYouTubeLink = (index) => {
    if (index !== 0) { // Prevent removal of the first link
      const newLinks = youtubeLinks.filter((_, i) => i !== index);
      setYoutubeLinks(newLinks);
    }
  };

  const markStepAsCompleted = (stepIndex) => {
    setIsStepCompleted((prev) => {
      const updated = [...prev];
      updated[stepIndex] = true;
      return updated;
    });
  };

  const handleUploadClick = async () => {
    if (!token) {
      console.error("No token found. Please login first.");
      alert("Please login to perform this action.");
      return;
    }

    if (youtubeLinks.length === 0 || youtubeLinks[0] === "") {
      console.error("No YouTube link provided.");
      alert("Please provide a YouTube link.");
      return;
    }

    const formData = new FormData();
    if (profilePictureUrl) {
      formData.append("profile_picture", profilePictureUrl);
    }
    formData.append("youtube_url", youtubeLinks[0]);

    try {
      const customLoader = `
        <div class="relative flex items-center justify-center overflow-hidden mt-4">
          <div class="w-16 h-16 border-4 border-solid border-transparent border-t-orange-500 rounded-full animate-spin"></div>
          <div class="absolute flex items-center justify-center">
            <div class="w-12 h-12 border-4 border-solid border-transparent border-t-black rounded-full animate-spin m-2"></div>
            <div class="absolute w-8 h-8 border-4 border-solid border-transparent border-t-orange-500 rounded-full animate-spin m-2"></div>
          </div>
        </div>
      `;

      const customHeader = `
        <div class="flex justify-between items-center w-full">
          <div class="text-lg">Processing Youtube link</div>
          <button id="close-btn" class="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <hr class="border-gray-300 w-full my-2">
        <p class="text-gray-400 text-xs"> Please hold on for a moment, we are diligently processing your request and ensuring everything is accurate...</p>
      `;

      Swal.fire({
        html: `
          ${customHeader}
          ${customLoader}
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: "w-96 h-64 flex flex-col items-start justify-start p-4",
          title: "text-lg",
          htmlContainer:
            "flex flex-col items-center justify-center w-full h-full",
        },
        didOpen: () => {
          document
            .getElementById("close-btn")
            .addEventListener("click", () => Swal.close());
        },
      });

      const response = await axios.post(
        "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/transcribe/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + token,
          },
        }
      );

      setTranscript(response.data.SpeechThread.text);
      setSpeechThreadId(response.data.SpeechThread.id);

      Swal.close();
      markStepAsCompleted(0);
      markStepAsCompleted(1);
      setIsSubmitDisabled(true); // Disable submit button after successful submission
    
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000); // Duration of the animation

    } catch (error) {
      console.error("Error in transcription:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        Swal.fire(
          "Error",
          "Transcription failed: " + error.response.data.errors.join(", "),
          "error"
        );
      }
    }
    setIsYouTubeLinkOpen(!isYouTubeLinkOpen);
  };

  const handleCopyContent = (content) => {
    const listener = (e) => {
      e.clipboardData.setData("text/html", content);
      e.clipboardData.setData("text/plain", stripHtmlTags(content));
      e.preventDefault();
    };
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
    toast.success("Copied! The content has been copied to clipboard.", {
      position: "top-right", 
      autoClose: 5000,       
    });
    
  };



  const handleGenerateContent = async (url, text, speechThreadId, index, title) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No token found. Please login first.");
      alert("Please login to perform this action.");
      return;
    }
  
    if (!speechThreadId) {
      Swal.fire(
        "Error",
        "Oops!, Please Upload the Link first. Thank you!",
        "error"
      );
      return;
    }
  
    if (savedGeneratedPosts[title]) {
      setGeneratedContent(savedGeneratedPosts[title]);
      setCurrentTitle(title);
      return;
    }
  
    try {
      const customLoader = `
        <div class="relative flex items-center justify-center overflow-hidden mt-4">
          <div class="w-16 h-16 border-4 border-solid border-transparent border-t-orange-500 rounded-full animate-spin"></div>
          <div class="absolute flex items-center justify-center">
            <div class="w-12 h-12 border-4 border-solid border-transparent border-t-black rounded-full animate-spin m-2"></div>
            <div class="absolute w-8 h-8 border-4 border-solid border-transparent border-t-orange-500 rounded-full animate-spin m-2"></div>
          </div>
        </div>
      `;
  
      const customHeader = `
        <div class="flex justify-between items-center w-full">
          <div class="text-lg">Generating ${title} Post</div>
          <button id="close-btn" class="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <hr class="border-gray-300 w-full my-2">
        <p class="text-gray-400 text-xs"> Please hold on for a moment, we are diligently processing your request and ensuring everything is accurate...</p>
      `;
  
      Swal.fire({
        html: `
          ${customHeader}
          ${customLoader}
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: "w-96 h-64 flex flex-col items-start justify-start p-4",
          title: "text-lg",
          htmlContainer:
            "flex flex-col items-center justify-center w-full h-full",
        },
        didOpen: () => {
          document
            .getElementById("close-btn")
            .addEventListener("click", () => Swal.close());
        },
      });
  
      const formData = new FormData();
      formData.append("text", text);
      formData.append("SpeechThread_id", speechThreadId);
  
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "multipart/form-data",
        },
      });
  
      const contentKeyMap = {
        Instagram: "instagram_post",
        Summary: "summary",
        Notes: "meeting_notes",
        Blog: "blog_post",
        eBook: "ebook",
        Facebook: "facebook_post",
        Twitter: "twitter_post",
        LinkedIn: "linkedin_post",
      };
  
      const contentKey = contentKeyMap[title];
      if (!response.data || !response.data[contentKey]) {
        throw new Error(
          `Invalid response structure. Expected key '${contentKey}' not found.`
        );
      }
  
      const generatedContent = response.data[contentKey];
      setGeneratedContent(generatedContent);
      setCurrentTitle(title);
      setIsEditing(false); // Enable editing mode by default for generated content
  
      setSavedGeneratedPosts((prev) => ({
        ...prev,
        [title]: generatedContent,
      }));
  
      // Trigger scroll after setting generated post
      scrollToGeneratedPost();
      const updatedStatus = [...generatedStatus];
      updatedStatus[index] = true;
      setGeneratedStatus(updatedStatus);
      markStepAsCompleted(3);
  
      Swal.close(); // Close the Swal alert here after generation is complete
    } catch (error) {
      console.error("Error in generating content:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        Swal.fire(
          "Error",
          "Content generation failed: " + error.response.data.error,
          "error"
        );
      } else {
        Swal.fire(
          "Error",
          "Content generation failed: " + error.message,
          "error"
        );
      }
    }
  };
  
  
  


  const handleDownloadContent = async (title, content, speechThreadId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      toast.error("Authentication required. Please login.");
      return;
    }
  
    const apiUrl = 'https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_pdf/';
    const formData = new FormData();
    formData.append('text', content);  // Ensure the full content with HTML is passed
    formData.append('SpeechThread_id', speechThreadId);
  
    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      });
  
      if (response.status === 200 && response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        toast.success("PDF downloaded successfully!", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };
  
  
  
  const cleanContent = (content) => {
    // Remove any invalid or unsupported tags or content
    let cleanedContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Simple regex to remove HTML tags
    return cleanedContent;
  };
  
  
  
  

 

  const handleShareContent = (title, content) => {
    const textContent = stripHtmlTags(content);
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: textContent,
        })
        .then(() => {
          console.log("Content shared successfully");
        })
        .catch((error) => {
          console.error("Error sharing content", error);
        });
    } else {
      alert("Sharing not supported in this browser.");
    }
  };

  const generateOptions = [
    {
      title: "Summary",
      description: "A brief summary to encapsulate the essence.",
      image: Summary,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_summary/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Notes",
      description: "Generate concise and informative meeting notes.",
      image: MeetingNotes,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_meeting_notes/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Blog",
      description: "Create a comprehensive blog post.",
      image: Blog,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_blog_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "eBook",
      description: "Turn your content into a detailed eBook.",
      image: eBook,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_ebook/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Instagram",
      description:
        "A sample is a good way to see best practices for inspiration.",
      image: Instagram,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_instagram_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Facebook",
      description: "Create a Facebook post.",
      image: Facebook,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_facebook_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Twitter",
      description: "Generate a tweet for Twitter.",
      image: Twitter,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_twitter_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "LinkedIn",
      description: "Create a post for LinkedIn.",
      image: LinkedIn,
      url: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_linkedin_post/",
      speechThreadId: speechThreadId,
    },
  ];

  const getStepClassName = (stepIndex) => {
    return isStepCompleted[stepIndex]
      ? "bg-[#F2911B] text-white"
      : "bg-gray-400 text-white";
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  useEffect(() => {
    const storedUsername = localStorage.getItem("Username");
    const storedProfilePicture = localStorage.getItem("ProfilePicture"); // Assuming you store the profile picture URL in localStorage with this key
    setUsername(storedUsername || "User"); // Default to 'User' if no username is found
    setProfilePicture(storedProfilePicture || ""); // Default to empty string if no profile picture is found
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };
  const toggleTranscriptSection = () => {
    setIsTranscriptOpen(!isTranscriptOpen);
    markStepAsCompleted(1);
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };

  const stripHtmlTags = (html) => {
    let doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };
  const handleDashboardClick = () => {
    history.push("/dashboard");
  };

  return (
    <div className="container mx-auto px-4">
      {/* <div className="flex mt-4 flex-col-reverse md:flex-row justify-between items-center bg-white border-b-2 lg:pb-2">
        <div className="flex items-center mb-4 md:mb-0">
          <p
            className="text-lg font-semibold mt-2 cursor-pointer"
            onClick={handleDashboardClick}
          >
            Dashboard &gt; <span className="text-gray-400">Youtube Link</span>
          </p>
        </div>
        <div className="relative">
          <button
            className="flex items-center justify-center w-12 h-12 bg-[#F2911B] rounded-full"
            onClick={toggleDropdown}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-xl font-bold text-gray-700">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          {dropdownVisible && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg">
              <button
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-[#F2911B]"
                onClick={handleLogout}
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div> */}

      <p
        className="text-lg font-semibold my-8 cursor-pointer"
        onClick={() =>
          profilePictureInputRef.current &&
          profilePictureInputRef.current.click()
        }
      >
        {/* <span className="border-2 border-[#F2911B] text-[#F2911B] rounded-full px-4 py-2 text-base">
          <FontAwesomeIcon
            className="text-[#F2911B] text-base"
            icon={faUpload}
          />{" "}
          Upload Photo
        </span> */}
        {profilePictureName && (
          <span className="ml-2 text-sm text-gray-600">
            {profilePictureName}
          </span>
        )}
      </p>
      <input
        type="file"
        ref={profilePictureInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleProfilePictureChange}
      />

      <div className="flex flex-col items-center mt-4 py-4 md:p-10 bg-[#E8ECF4] rounded-2xl">
        <div className="space-y-6 mx-auto w-full max-w-5xl px-0">
          <div className="relative bg-white shadow-md rounded-3xl p-6">
            <div
              className={`flex items-center justify-between mb-4 cursor-pointer ${
                isYouTubeLinkOpen ? "bg-transparent" : ""
              }`}
              onClick={() => setIsYouTubeLinkOpen(!isYouTubeLinkOpen)}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full ${getStepClassName(
                    0
                  )}`}
                >
                  1
                </span>
                <p className="font-bold text-lg">YouTube Link</p>
              </div>
              <FontAwesomeIcon
                icon={isYouTubeLinkOpen ? faAngleUp : faAngleDown}
              />
            </div>
            {isYouTubeLinkOpen && (
              <div className="flex flex-col">
                <div className="p-4 md:p-8 flex flex-col items-center justify-center w-full rounded-lg">
                  <div className="text-center w-full">
                    <p className="text-gray-400 mb-2">
                      Enter a link to transcribe it into text
                    </p>
                    {youtubeLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-center mb-2 w-full"
                      >
                        <input
                          type="text"
                          className="w-3/4 sm:w-5/6 p-2 border border-gray-300 rounded-lg mb-2 sm:mb-0 sm:mr-2"
                          value={link}
                          onChange={(e) => handleYouTubeLinkChange(index, e)}
                          placeholder="Enter YouTube link"
                        />
                        <div className="flex space-x-3 px-6">
                          {index !== 0 && (
                            <button
                              className="text-white border p-2 border-[#6A707C] bg-[#6A707C] rounded-full h-10 w-10 flex items-center justify-center hover:border-[#6A707C] hover:bg-white hover:text-[#6A707C]"
                              onClick={() => handleRemoveYouTubeLink(index)}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                          )}
                          <button
                            className="text-white border p-2 bg-[#F2911B] rounded-full h-10 w-10 flex items-center justify-center hover:border-[#F2911B] hover:bg-white hover:text-[#F2911B]"
                            onClick={handleAddYouTubeLink}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-col justify-center sm:flex-row sm:space-x-4 w-full mt-4">
                      <button
                        onClick={handleUploadClick}
                        className={`bg-${isSubmitDisabled ? "gray-400 cursor-not-allowed" : "[#F2911B] hover:text-[#F2911B] hover:bg-white border-2 hover:border-[#F2911B]"} text-white px-6 py-2 rounded-3xl w-full lg:w-auto`}
                        disabled={isSubmitDisabled}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden">
          <div className="flex items-start">
            <div className="relative bg-white shadow-md rounded-3xl p-6 overflow-hidden w-full">
              <div
                className={`flex items-center justify-between mb-4 cursor-pointer ${
                  isTranscriptOpen ? "bg-transparent" : ""
                }`}
                onClick={toggleTranscriptSection}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full ${getStepClassName(
                      1
                    )}`}
                  >
                    2
                  </span>
                  <p className="font-bold text-lg">Transcript</p>
                </div>
                <FontAwesomeIcon
                  icon={isTranscriptOpen ? faAngleUp : faAngleDown}
                />
              </div>
              {isTranscriptOpen && (
                <div>
                  {isEditing ? (
                    <textarea
                      className="w-full h-48 p-2 bg-gray-100 border border-gray-300 rounded-lg"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                    />
                  ) : (
                    <div className="w-full h-48 p-2 transcript-content rounded-lg overflow-auto">
                      {stripHtmlTags(transcript)}
                    </div>
                  )}
                  <div className="flex justify-center">
                    {isEditing ? (
                      <button
                        onClick={handleSaveText}
                        className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={handleEditToggle}
                        className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        
          {/* <div className="flex items-start">
            <div className="relative bg-white shadow-md rounded-3xl p-6 overflow-hidden w-full">
              <div
                className={`flex items-center justify-between mb-4 cursor-pointer ${
                  isUploadCoverOpen ? "bg-transparent" : ""
                }`}
                onClick={() => setIsUploadCoverOpen(!isUploadCoverOpen)}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full ${getStepClassName(
                      2
                    )}`}
                  >
                    3
                  </span>
                  <p className="font-bold text-lg">Upload Cover (Optional)</p>
                </div>
                <FontAwesomeIcon
                  icon={isUploadCoverOpen ? faAngleUp : faAngleDown}
                />
              </div>
              {isUploadCoverOpen && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="flex flex-col items-center w-full mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      ref={coverImageInputRef}
                      className="hidden"
                      onChange={handleCoverImageChange}
                    />
                    {coverImage ? (
                      <div className="relative flex flex-col items-center mb-2">
                        <img
                          src={coverImage}
                          alt="Cover"
                          className="h-48 w-full object-cover rounded-lg"
                        />
                        <button
                          className="absolute -top-2 -right-1 text-red-600 border-solid border p-2 border-red-600 rounded-full h-1 w-1 flex items-center justify-center"
                          onClick={() => setCoverImage(null)}
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="h-48 w-full border-dashed border-2 border-gray-300 flex items-center justify-center rounded-lg cursor-pointer"
                        onClick={() => coverImageInputRef.current.click()}
                      >
                        <p className="text-gray-400">Drag & Drop file here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div> */}
        <div className={`relative bg-white shadow-md rounded-3xl p-6 ${isAnimating ? "animate-zoomIn" : ""}`}>
     
            <div
              className={`flex items-center justify-between mb-4 cursor-pointer ${
                isGenerateOpen ? "bg-transparent" : ""
              }`}
              onClick={() => setIsGenerateOpen(!isGenerateOpen)}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full ${getStepClassName(
                    1
                  )}`}
                >
                  2
                </span>
                <p className="font-bold text-lg">Generate</p>
              </div>
              <FontAwesomeIcon
                icon={isGenerateOpen ? faAngleUp : faAngleDown}
              />
            </div>
            {isGenerateOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {generateOptions.map((option, index) => (
                  <div
                    key={index}
                    className="relative p-4 border-solid border border-black rounded-lg group cursor-pointer overflow-hidden text-sm"
                    onClick={() =>
                      handleGenerateContent(
                        option.url,
                        transcript,
                        option.speechThreadId,
                        index,
                        option.title
                      )
                    }
                  >
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity ${
                        generatedStatus[index]
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <button
                        className={`text-white px-4 py-2 rounded-3xl transition-colors duration-300 ${
                          generatedStatus[index]
                            ? "bg-gray-700"
                            : "bg-[#F2911B] hover:bg-[#e57d0e]"
                        }`}
                      >
                        {generatedStatus[index] ? "Generated" : "Generate"}
                        <FontAwesomeIcon
                          icon={faWandMagicSparkles}
                          className="text-white ml-2"
                        />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-sm">{option.title}</p>
                      <img
                        src={option.image}
                        alt={option.title}
                        className="h-6 w-6"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
       
        <div className="flex flex-col mt-8">
  {generatedContent && (
    <div
      className={`relative bg-white shadow-md rounded-3xl p-6 mb-6 overflow-hidden ${
        currentTitle === "Notes" ? "w-full" : "w-full max-w-5xl"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-lg">Generated {currentTitle}</p>
        <div className="flex items-center space-x-2">
  {isEditing && (
    <button
      onClick={handleSaveText}
      className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
    >
      <FontAwesomeIcon icon={faSave} className="" />
    </button>
  )}
  {!isEditing && (
    <button
      onClick={handleEditToggle}
      className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
    >
      <FontAwesomeIcon icon={faEdit} className="" />
    </button>
  )}
  <button
    onClick={() => handleCopyContent(generatedContent)}
    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
  >
    <FontAwesomeIcon icon={faCopy} className="" />
  </button>
  <button
    onClick={() => handleDownloadContent(currentTitle, generatedContent, speechThreadId)}
    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
  >
    <FontAwesomeIcon icon={faDownload} className="" />
  </button>
  <button
    onClick={() => handleShareContent(currentTitle, generatedContent)}
    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
  >
    <FontAwesomeIcon icon={faShareAlt} className="" />
  </button>
</div>


      </div>
      <div className="p-4 rounded-lg overflow-auto text-sm">
        {coverImage && (
          <img
            src={coverImage}
            alt="Cover"
            className="h-48 w-full object-cover rounded-lg mb-4"
          />
        )}
        {isEditing ? (
          <CKEditor
            editor={ClassicEditor}
            data={generatedContent}
            onReady={(editor) => {
              editorInstance.current = editor;
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              setGeneratedContent(data);
            }}
          />
        ) : (
          <div
            ref={generatedPostRef}
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />
        )}
       
      </div>
    </div>
  )}
</div>
</div>
      </div>
    </div>
  );
};

export default YoutubeLink;
