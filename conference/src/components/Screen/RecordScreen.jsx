import React, { useState, useRef, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { IoMdMoon } from "react-icons/io";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faTimes,
  faCopy,
  faPenToSquare,
  faWandMagicSparkles,
  faPlay,
  faPause,
  faRedo,
  faEdit,
  faDownload,
  faPaperPlane,
  faShareAlt,
  faSave,
  faMicrophone,
  faUpload,
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
import FileIcon from "../../Assets/images/music-icon.png";
import "../../App.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FacebookButton, FacebookCount } from "react-social";
import { TokenContext } from "../../App";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const getEncodedUrl = (content) => encodeURIComponent(content);

const RecordScreen = () => {
  const token = useContext(TokenContext);
  const history = useHistory();
  useEffect(() => {
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

  const currentUrl = window.location.href;
  const [files, setFiles] = useState([]);
  const [isLiveRecordOpen, setIsLiveRecordOpen] = useState(true);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isEditing, setIsEditing] = useState(true); // Set default editing mode to true
  const [speechThreadId, setSpeechThreadId] = useState(null);
  const [generatedStatus, setGeneratedStatus] = useState([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isStepCompleted, setIsStepCompleted] = useState([false, false, false]);
  const [savedGeneratedPosts, setSavedGeneratedPosts] = useState({});
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureName, setProfilePictureName] = useState("");
  const uploadedFile = useRef(null);
  const [dummyState, setDummyState] = useState(false);
  const [isEditingGenerated, setIsEditingGenerated] = useState(true); // Enable editing mode by default for generated content
  const [isEditingSavedGenerated, setIsEditingSavedGenerated] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const [generatedPost, setGeneratedPost] = useState(null);

  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const profilePictureInputRef = useRef(null);
  const audioRef = useRef(null);
  const Username = localStorage.getItem("Username") || "User";
  const generatedPostRef = useRef(null);
  const scrollToGeneratedPost = () => {
    setTimeout(() => {
      if (generatedPostRef.current) {
        generatedPostRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  let editorInstance = useRef(null);

  useEffect(() => {
    if (!token) {
      console.error("No token found. Please login first.");
    }
  }, [token]);

  useEffect(() => {
    setProfilePictureUrl(null);
    if (!token) {
      console.error("No token found. Please login first.");
    } else {
      axios
        .get("https://speechinsightsweb.azurewebsites.net/profile_picture/", {
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
    uploadedFile.current = event.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (validImageTypes.includes(file.type)) {
        setProfilePictureName(file.name);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("user", 1);

        axios
          .post(
            "https://speechinsightsweb.azurewebsites.net/profile_picture/",
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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && editorInstance.current) {
      const currentContent = editorInstance.current.getData();
      setGeneratedContent(currentContent);
    }
  };

  const handleEditToggleGenerated = () => {
    setIsEditingGenerated(!isEditingGenerated);
    if (isEditingGenerated && editorInstance.current) {
      const editedContent = editorInstance.current.getData();
      setGeneratedContent(editedContent);
      setSavedGeneratedPosts((prev) => ({
        ...prev,
        [generatedPost.title]: editedContent,
      }));
      setGeneratedPost({ ...generatedPost, content: editedContent });
    }
  };

  const handleSaveText = () => {
    if (editorInstance.current) {
      const editedContent = editorInstance.current.getData();
      setGeneratedContent(editedContent);
      setSavedGeneratedPosts((prev) => ({
        ...prev,
        [generatedContent.title]: editedContent,
      }));
    }
    setIsEditing(false);
    markStepAsCompleted(1);
    setIsTranscriptOpen(!isTranscriptOpen);

  };

  const handleSaveGeneratedText = () => {
    if (editorInstance.current) {
      const editedContent = editorInstance.current.getData();
      setGeneratedContent(editedContent);
      setSavedGeneratedPosts((prev) => ({
        ...prev,
        [generatedPost.title]: editedContent,
      }));
      setGeneratedPost({ ...generatedPost, content: editedContent });
    }
    setIsEditingGenerated(false);
  };

  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };

  const handleFileRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index));
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

    let formData = new FormData();
    if (profilePictureUrl) {
      formData.append("profile_picture", profilePictureUrl);
    }
    if (files.length > 0) {
      formData.append("file", files[0]);
    } else if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      formData.append("file", audioBlob, "recording.wav");
    } else {
      console.error("No files or audio chunks to upload.");
  // Success toast for copied content
toast.error("No files or audio chunks to upload.", {
  position: "top-right", 
  autoClose: 5000,      
});

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
          <div class="text-lg">Processing Your Recording</div>
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
        "https://speechinsightsweb.azurewebsites.net/transcribe/",
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
    } catch (error) {
      console.error("Error in transcription:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        Swal.fire(
          "Error",
          "Transcription failed: " + Array.isArray(error.response.data.errors) ? error.response.data.errors?.join(", ") : error.response.data.error,
          "error"
        );
      }
    }
    setIsLiveRecordOpen(!isLiveRecordOpen);
  };

  const handleDashboardClick = () => {
    history.push("/dashboard");
  };

  const toggleLiveRecordSection = () => {
    setIsLiveRecordOpen(!isLiveRecordOpen);
  };

  const toggleTranscriptSection = () => {
    setIsTranscriptOpen(!isTranscriptOpen);
    markStepAsCompleted(1);
  };

  const toggleGenerateSection = () => {
    setIsGenerateOpen(!isGenerateOpen);
  };

  const handleStartPause = () => {
    if (isRecording) {
      if (isPaused) {
        setIsPaused(false);
        intervalRef.current = setInterval(() => {
          setTime((prevTime) => prevTime + 1);
        }, 1000);
        mediaRecorder.resume();
      } else {
        setIsPaused(true);
        clearInterval(intervalRef.current);
        mediaRecorder.pause();
      }
    } else {
      setIsRecording(true);
      setIsPaused(false);
      setTime(0);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newMediaRecorder = new MediaRecorder(stream);
          setMediaRecorder(newMediaRecorder);

          newMediaRecorder.ondataavailable = (event) => {
            setAudioChunks((prevChunks) => [...prevChunks, event.data]);
          };

          newMediaRecorder.start();
        })
        .catch((error) => {
          console.error("Error accessing media devices.", error);
          alert(
            "Error accessing microphone. Please ensure the microphone is available."
          );
        });
    }
  };

  const handleSave = () => {
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const file = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
      });
      setFiles([file]);
      setDummyState((prev) => !prev);
    }
    toast.success(
      "Your recording is saved",
      {
        position: "top-right", // Use string values instead of constants
        autoClose: 500,
      }
    );
    
    setIsRecording(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setMediaRecorder(null);
    }
    setAudioChunks([]);
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleGenerateContent = async (
    url,
    text,
    speechThreadId,
    index,
    title
  ) => {
    if (!token) {
      console.error("No token found. Please login first.");
      alert("Please login to perform this action.");
      return;
    }

    if (!speechThreadId) {
      Swal.fire(
        "Error",
        "Oops!, Please Upload the correct audio. Thank you!",
        "error"
      );
      return;
    }
    const isHtmlContent = ["Summary", "eBook", "Blog", "White Paper"].includes(
      title
    );

    if (savedGeneratedPosts[title]) {
      setGeneratedPost({
        title,
        content: savedGeneratedPosts[title],
        isHtmlContent,
      });
      setIsEditingGenerated(true); // Enable editing mode by default for generated content
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
        "Meeting Notes": "meeting_notes",
        Blog: "blog_post",
        eBook: "ebook",
        Facebook: "facebook_post",
        Twitter: "twitter_post",
        LinkedIn: "linkedin_post",
      };

      const contentKey = contentKeyMap[title];
      const generatedContent = response.data[contentKey];
      setGeneratedContent(generatedContent);

      setSavedGeneratedPosts((prev) => ({
        ...prev,
        [title]: generatedContent,
      }));

      Swal.close();

      setGeneratedPost({ title, content: generatedContent, isHtmlContent });
      setIsEditingGenerated(true); // Enable editing mode by default for generated content

      const updatedStatus = [...generatedStatus];
      updatedStatus[index] = true;
      setGeneratedStatus(updatedStatus);
      markStepAsCompleted(2);
      setTimeout(() => {
        document.getElementById(`generateBtn${title}`).click();
      }, 400);
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
      }
    }
  };

  const handleCopyTranscriptContent = () => {
    const contentElement = isEditing
      ? document.querySelector("textarea")
      : document.querySelector(".transcript-content");
    if (contentElement) {
      const content = contentElement.value || contentElement.textContent;
      navigator.clipboard
        .writeText(content)
        .then(() => {
        // Success toast for copied content
toast.success("Copied! The content has been copied to clipboard.", {
  position: "top-right", // Position can be adjusted as needed
  autoClose: 5000,       // Auto close after 5 seconds
});

        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else {
      console.error("No content to copy.");
    }
  };

  const handleCopyContent = (content) => {
    const textContent = stripHtmlTags(content);
    navigator.clipboard
      .writeText(textContent)
      .then(() => {
       // Success toast for copied content
toast.success("Copied! The content has been copied to clipboard.", {
  position: "top-right", // Position can be adjusted as needed
  autoClose: 5000,       // Auto close after 5 seconds
});

      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  const handleDownloadHtmlContent = (title, content) => {
    const element = document.createElement("div");
    element.innerHTML = content;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text(title, 10, 10);
      pdf.addImage(imgData, "PNG", 0, 20, 210, 0);
      const dynamicTitle = title;
      const dynamicPostName = content.slice(0, 20).replace(/\s+/g, "_") || "Post";
      pdf.save(`${dynamicTitle}_${dynamicPostName}.pdf`);
    });
  };

  const handleDownloadTextContent = (title, content) => {
    const doc = new jsPDF();
    const textContent = stripHtmlTags(content);
    const textLines = doc.splitTextToSize(textContent, 180); // Adjust the line width to fit the PDF page

    doc.setFontSize(20);
    doc.text(title, 10, 10);
    doc.setFontSize(12);

    let y = 20;
    textLines.forEach((line, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 10, y);
      y += 10;
    });

    const dynamicTitle = title;
    const dynamicPostName = textContent.slice(0, 20).replace(/\s+/g, "_") || "Post";
    doc.save(`${dynamicTitle}_${dynamicPostName}.pdf`);
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
      url: "https://speechinsightsweb.azurewebsites.net/generate_summary/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Meeting Notes",
      description: "Generate concise and informative meeting notes.",
      image: MeetingNotes,
      url: "https://speechinsightsweb.azurewebsites.net/generate_meeting_notes/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Blog",
      description: "Create a comprehensive blog post.",
      image: Blog,
      url: "https://speechinsightsweb.azurewebsites.net/generate_blog_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "eBook",
      description: "Turn your content into a detailed eBook.",
      image: eBook,
      url: "https://speechinsightsweb.azurewebsites.net/generate_ebook/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Instagram",
      description: "A sample is a good way to see best practices for inspiration.",
      image: Instagram,
      url: "https://speechinsightsweb.azurewebsites.net/generate_instagram_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Facebook",
      description: "Create a Facebook post.",
      image: Facebook,
      url: "https://speechinsightsweb.azurewebsites.net/generate_facebook_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "Twitter",
      description: "Generate a tweet for Twitter.",
      image: Twitter,
      url: "https://speechinsightsweb.azurewebsites.net/generate_twitter_post/",
      speechThreadId: speechThreadId,
    },
    {
      title: "LinkedIn",
      description: "Create a post for LinkedIn.",
      image: LinkedIn,
      url: "https://speechinsightsweb.azurewebsites.net/generate_linkedin_post/",
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
    const storedProfilePicture = localStorage.getItem("ProfilePicture");
    setUsername(storedUsername || "User");
    setProfilePicture(storedProfilePicture || "");
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };

  const stripHtmlTags = (html) => {
    let doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className="container mx-auto px-0">
      <div className="flex mt-4 flex-col-reverse md:flex-row justify-between items-center bg-white border-b-2 lg:pb-2">
        <div className="flex items-center mb-4 md:mb-0">
          <p
            className="text-lg font-semibold mt-2 cursor-pointer"
            onClick={handleDashboardClick}
          >
            Dashboard &gt; <span className="text-gray-400">Live Recording</span>
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
            <div className="absolute -right-16 md:right-0 lg:right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg">
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
      </div>

      <p
        className="text-lg font-semibold my-8 cursor-pointer"
        onClick={() =>
          profilePictureInputRef.current &&
          profilePictureInputRef.current.click()
        }
      >
        <span className="border-2 border-[#F2911B] text-[#F2911B] rounded-full px-4 py-2 text-base">
          <FontAwesomeIcon
            className="text-[#F2911B] text-base"
            icon={faUpload}
          />{" "}
          Upload Photo
        </span>
        {profilePictureName && (
          <span className="ml-2 text-sm text-gray-600">
            {profilePictureName}
          </span>
        )}
        {profilePictureName && (
          <img
            alt="not found"
            src={URL.createObjectURL(uploadedFile.current)}
          />
        )}
      </p>
      <input
        type="file"
        ref={profilePictureInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleProfilePictureChange}
      />

      <div className="flex flex-col items-center mt-4 px-0 py-4 lg:p-4 md:p-10 bg-[#E8ECF4] rounded-2xl">
        <div className="space-y-6 mx-auto w-full max-w-5xl px-0">
          <div className="flex items-start">
            <div className="relative bg-white shadow-md rounded-3xl p-6 overflow-hidden w-full">
              <div
                className={`flex items-center justify-between mb-4 cursor-pointer ${
                  isLiveRecordOpen ? "bg-transparent" : ""
                }`}
                onClick={toggleLiveRecordSection}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full ${getStepClassName(
                      0
                    )}`}
                  >
                    1
                  </span>
                  <p className="font-bold text-lg">Live Recording</p>
                </div>
                <FontAwesomeIcon
                  icon={isLiveRecordOpen ? faAngleUp : faAngleDown}
                />
              </div>
              {isLiveRecordOpen && (
                <div className="flex flex-col">
                  <div className="bg-gray-50 border-dashed border-2 border-gray-300 p-4 md:p-8 flex flex-col items-center justify-center w-full rounded-lg">
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-xl font-bold">
                          {formatTime(time)}
                        </span>
                      </div>

                      <div className="flex items-center justify-center space-x-2 lg:space-x-4">
                        <div className="relative group">
                          <button
                            onClick={handleSave}
                            className="text-[#F2911B] px-4 py-2 rounded-full border border-[#F2911B] hover:py-3 hover:px-5"
                          >
                            <FontAwesomeIcon icon={faSave} />
                          </button>
                          <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-[#F2911B] text-white text-xs rounded py-1 px-3">
                            Save File
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-t-4 border-t-[#F2911B] border-l-4 border-l-transparent border-r-4 border-r-transparent"></div>
                          </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                          {isRecording && !isPaused && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="absolute w-20 h-20 rounded-full bg-[#F2911B] opacity-25 animate-pulse"></span>
                              <span className="absolute w-12 h-12 rounded-full bg-[#F2911B] opacity-25 animate-pulse delay-200"></span>
                              <span className="absolute w-8 h-8 rounded-full bg-[#F2911B] opacity-25 animate-pulse delay-400"></span>
                            </div>
                          )}
                          <button
                            onClick={handleStartPause}
                            className="w-14 h-14 flex items-center justify-center text-white bg-[#F2911B] rounded-full relative z-10"
                          >
                            <FontAwesomeIcon
                              icon={
                                isPaused || !isRecording
                                  ? faMicrophone
                                  : faPause
                              }
                            />
                          </button>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={handleUploadClick}
                            className="text-[#F2911B] px-4 py-2 rounded-full border border-[#F2911B] hover:py-3 hover:px-5"
                          >
                            <FontAwesomeIcon icon={faPaperPlane} />
                          </button>
                          <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-[#F2911B] text-white text-xs rounded py-1 px-3">
                            Upload file
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-t-4 border-t-[#F2911B] border-l-4 border-l-transparent border-r-4 border-r-transparent"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <audio
                      ref={audioRef}
                      controls
                      className="mt-4 w-full hidden"
                    ></audio>
                  </div>
                  <div className="flex flex-col items-center w-full mt-4">
                    <input
                      type="file"
                      ref={inputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-wrap mb-4 space-x-2 w-full">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="relative flex flex-col items-center mb-2"
                        >
                          <button
                            className="absolute -top-2 -right-1 text-red-600 border-solid border p-2 border-red-600 rounded-full h-1 w-1 flex items-center justify-center"
                            onClick={() => handleFileRemove(index)}
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="text-xs"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

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
                      {transcript}
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

          <div className="flex items-start">
            <div className="relative bg-white shadow-md rounded-3xl p-6 overflow-hidden w-full">
              <div
                className={`flex items-center justify-between mb-4 cursor-pointer ${
                  isGenerateOpen ? "bg-transparent" : ""
                }`}
                onClick={toggleGenerateSection}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full ${getStepClassName(
                      2
                    )}`}
                  >
                    3
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
                        <a href={`#${option.title}`} className="px-4 py-2 flex" id={`generateBtn${option.title}`}></a>
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
          </div>

          {generatedPost && (
            <div className="flex flex-col mt-8" id={generatedPost.title}>
              <div className="relative bg-white shadow-md rounded-3xl p-6 mb-6 overflow-hidden w-full max-w-5xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-lg">
                    {" "}
                    Generated {generatedPost.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyContent(generatedPost.content)}
                      className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                    >
                      <FontAwesomeIcon icon={faCopy} className="text-white" />
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadTextContent(
                          generatedPost.title,
                          generatedPost.content
                        )
                      }
                      className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                    >
                      <FontAwesomeIcon icon={faDownload} className="text-white" />
                    </button>
                    <button
                      onClick={() =>
                        handleShareContent(
                          generatedPost.title,
                          generatedPost.content
                        )
                      }
                      className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                    >
                      <FontAwesomeIcon icon={faShareAlt} className="text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4  rounded-lg overflow-auto text-sm">
                  {isEditingGenerated ? (
                    <CKEditor
                      editor={ClassicEditor}
                      data={generatedPost.content}
                      onInit={(editor) => {
                        editorInstance.current = editor;
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setGeneratedPost({ ...generatedPost, content: data });
                      }}
                    />
                  ) : generatedPost.isHtmlContent ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {stripHtmlTags(generatedPost.content)}
                    </div>
                  )}
                  <div className="flex justify-center mt-4">
                    {isEditingGenerated ? (
                      <button
                        onClick={handleSaveGeneratedText}
                        className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={handleEditToggleGenerated}
                        className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordScreen;