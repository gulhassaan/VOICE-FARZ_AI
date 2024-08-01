import React, { useState, useRef, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faCopy,
  faWandMagicSparkles,
  faPause,
  faRedo,
  faTimes,
  faEdit,
  faDownload,
  faShareAlt,
  faSave,
  faMicrophone,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Summary from "../../Assets/images/summary1.png";
import eBook from "../../Assets/images/ebook1.png";
import Blog from "../../Assets/images/blog1.png";
import MeetingNotes from "../../Assets/images/whitepaper.png";
import Facebook from "../../Assets/images/facebook1.png";
import Twitter from "../../Assets/images/twitter1.png";
import LinkedIn from "../../Assets/images/linkedin1.png";
import Instagram from "../../Assets/images/instagram1.png";
import "../../App.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { FacebookButton, FacebookCount } from "react-social";
import { TokenContext } from "../../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const getEncodedUrl = (content) => encodeURIComponent(content);

const RecordScreen = () => {
  const token = localStorage.getItem("token");
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
  }, [history, token]);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const currentUrl = window.location.href;
  const [files, setFiles] = useState([]);
  const [isLiveRecordOpen, setIsLiveRecordOpen] = useState(true);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isImgOpen, setIsImgOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isEditing, setIsEditing] = useState(true);
  const [speechThreadId, setSpeechThreadId] = useState(null);
  const [generatedStatus, setGeneratedStatus] = useState([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isStepCompleted, setIsStepCompleted] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [savedGeneratedPosts, setSavedGeneratedPosts] = useState({});
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureName, setProfilePictureName] = useState("");
  const [coverImage, setCoverImage] = useState(null); // Initialize coverImage state
  const [coverImageName, setCoverImageName] = useState("");
  const uploadedFile = useRef(null);
  const [dummyState, setDummyState] = useState(false);
  const [isEditingGenerated, setIsEditingGenerated] = useState(true);
  const [isEditingSavedGenerated, setIsEditingSavedGenerated] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const [generatedPost, setGeneratedPost] = useState(null);
  const [showButtons, setShowButtons] = useState(false);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const coverImageInputRef = useRef(null);
  const profilePictureInputRef = useRef(null);
  const audioRef = useRef(null);
  const Username = localStorage.getItem("Username") || "User";
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
        .get(
          "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/profile_picture/",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        )
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

  const handleSaveGeneratedText = async () => {
    setSavedGeneratedPosts((prev) => ({
      ...prev,
      [generatedPost.title]: generatedPost.content,
    }));
    setIsEditingGenerated(false);
  
    try {
      if (!token) {
        Swal.fire("Error", "Authentication required. Please login.", "error");
        return;
      }
  
      const dataToUpdate = {
        youtube_links: [],
        recording_file_names: files.map((file) => file.name),
        multiple_speakers: false,
        status: "completed",
        text: transcript,
        twitter_post:
          generatedPost.title === "Twitter" ? generatedPost.content : "",
        facebook_post:
          generatedPost.title === "Facebook" ? generatedPost.content : "",
        instagram_post:
          generatedPost.title === "Instagram" ? generatedPost.content : "",
        linkedin_post:
          generatedPost.title === "LinkedIn" ? generatedPost.content : "",
        meeting_notes:
          generatedPost.title === "Notes" ? generatedPost.content : "",
        summary: generatedPost.title === "Summary" ? generatedPost.content : "",
        whitepaper: "",
        blog_post: generatedPost.title === "Blog" ? generatedPost.content : "",
        ebook: generatedPost.title === "eBook" ? generatedPost.content : "",
        title: "Generated Post",
        user: 1,
        pdf_file: 0,
        picture_file: 0,
      };
  
      const response = await axios.put(
        `https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/speech_history/${speechThreadId}/update/`,
        dataToUpdate,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status === 200) {
        toast.success("Content saved successfully!", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        throw new Error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving generated content:", error);
    }
  };

  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };

  const markStepAsCompleted = (stepIndex) => {
    setIsStepCompleted((prev) => {
      const updated = [...prev];
      updated[stepIndex] = true;
      return updated;
    });
  };

  const handleStart = () => {
    if (!isRecording) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setIsRecording(true);
          setIsPaused(false);
          setTime(0);
          intervalRef.current = setInterval(() => {
            setTime((prevTime) => prevTime + 1);
          }, 1000);

          const newMediaRecorder = new MediaRecorder(stream);
          setMediaRecorder(newMediaRecorder);

          newMediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setAudioChunks((prevChunks) => [...prevChunks, event.data]);
              saveRecordingLocally([...audioChunks, event.data]);
            }
          };

          newMediaRecorder.start();
        })
        .catch((error) => {
          console.error("Error accessing media devices.", error);
          alert(
            "Error accessing microphone. Please ensure the microphone is available and permission is granted."
          );
        });
    }
  };

  const handlePause = () => {
    if (isRecording && !isPaused) {
      setIsPaused(true);
      clearInterval(intervalRef.current);
      mediaRecorder.pause();
    } else if (isRecording && isPaused) {
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      mediaRecorder.resume();
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
    toast.success("Your recording is saved", {
      position: "top-right",
      autoClose: 500,
    });

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

  const handleReset = () => {
    if (isRecording || isPaused) {
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
    }

    setTime(0);
    setFiles([]);
    setDummyState((prev) => !prev);
    setIsSubmitDisabled(false);
    setAudioChunks([]);
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
      setIsSubmitDisabled(true);

      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    } catch (error) {
      console.error("Error in transcription:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        if (error.response.data.detail) {
          Swal.fire("Error", error.response.data.detail, "error");
        } else {
          Swal.fire(
            "Error",
            "Transcription failed: " +
              (error.response.data.errors
                ? error.response.data.errors.join(", ")
                : error.message),
            "error"
          );
        }
      } else {
        Swal.fire("Error", "Transcription failed: " + error.message, "error");
      }
    }
    setIsLiveRecordOpen(!isLiveRecordOpen);
    setIsImgOpen(!isImgOpen);
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
  const toggleImgSection = () => {
    setIsImgOpen(!isImgOpen);
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
    const isHtmlContent = ["Summary", "eBook", "Blog", "Notes"].includes(title);

    if (savedGeneratedPosts[title]) {
      setGeneratedPost({
        title,
        content: savedGeneratedPosts[title],
        isHtmlContent,
      });
      setIsEditingGenerated(true);
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
      const generatedContent = response.data[contentKey];
      setGeneratedContent(generatedContent);

      setSavedGeneratedPosts((prev) => ({
        ...prev,
        [title]: generatedContent,
      }));

      Swal.close();

      setGeneratedPost({ title, content: generatedContent, isHtmlContent });
      setIsEditingGenerated(true);
      markStepAsCompleted(2);

      scrollToGeneratedPost();
      const updatedStatus = [...generatedStatus];
      updatedStatus[index] = true;
      setGeneratedStatus(updatedStatus);
      markStepAsCompleted(3);
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

  const handleCopyContent = async (content) => {
    const textContent = stripHtmlTags(content);
    try {
      await navigator.clipboard.writeText(textContent);
      toast.success("Copied! The content has been copied to clipboard.", {
        position: "top-right",
        autoClose: 5000,
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy the content. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  

  const handleDownloadTextContent = async (title, content, speechThreadId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      toast.error("Authentication required. Please login.");
      return;
    }
  
    const apiUrl = 'https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_pdf/';
    const formData = new FormData();
    formData.append('text', content);
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
     
    }
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
    const storedProfilePicture = localStorage.getItem("ProfilePicture");
    setUsername(storedUsername || "User");
    setProfilePicture(storedProfilePicture || "");
  }, []);

  const stripHtmlTags = (html) => {
    let doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const saveRecordingLocally = (chunks) => {
    const audioBlob = new Blob(chunks, { type: "audio/wav" });
    const url = URL.createObjectURL(audioBlob);
    localStorage.setItem("recording", url);
  };
  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png"];
      if (validImageTypes.includes(file.type)) {
        setCoverImageName(file.name);
        setCoverImage(URL.createObjectURL(file));
      } else {
        console.error("Invalid file type. Please select a JPG or PNG image.");
      }
    }
    markStepAsCompleted(1);
    setIsImgOpen(!isImgOpen);
    setIsGenerateOpen(!isGenerateOpen)

  };
  
  // Add this function with other functions
  const handleRemoveCoverImage = () => {
    setCoverImage(null);
    setCoverImageName("");
  };
  return (
    <div className="container mx-auto px-0">
      <p
        className="text-lg font-semibold my-4 cursor-pointer"
        onClick={() =>
          profilePictureInputRef.current &&
          profilePictureInputRef.current.click()
        }
      >
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
                  <div className="p-4 md:p-8 flex flex-col items-center justify-center w-full rounded-lg">
                    <div className="text-center w-full">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-xl font-bold">
                          {formatTime(time)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center justify-center space-x-8">
                          {!isRecording && audioChunks.length === 0 ? (
                            <button
                              onClick={handleStart}
                              className="w-20 h-20 flex items-center justify-center bg-[#F2911B] rounded-full text-white text-3xl shadow-lg z-10 hover:bg-white hover:border-2 hover:border-[#F2911B] hover:text-[#F2911B]"
                            >
                              <FontAwesomeIcon icon={faMicrophone} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={handlePause}
                                className={`flex items-center justify-center w-10 h-10 text-gray-700 text-2xl transition-opacity rounded-full hover:bg-gray-200 ${
                                  isPaused
                                    ? "opacity-50 animate-pulse bg-gray-200"
                                    : "opacity-100 bg-transparent"
                                }`}
                              >
                                <FontAwesomeIcon icon={faPause} />
                              </button>
                              <div className="relative flex items-center justify-center">
                                {isRecording && !isPaused && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="absolute w-20 h-20 rounded-full bg-[#F2911B] opacity-25 animate-pulse"></span>
                                    <span className="absolute w-12 h-12 rounded-full bg-[#F2911B] opacity-25 animate-pulse delay-200"></span>
                                    <span className="absolute w-8 h-8 rounded-full bg-[#F2911B] opacity-25 animate-pulse delay-400"></span>
                                  </div>
                                )}
                                <button
                                  onClick={handleSave}
                                  className="w-20 h-20 flex items-center justify-center bg-[#F2911B] rounded-full text-white text-3xl shadow-lg z-10 mx-4 hover:animate-pulse hover:delay-200"
                                >
                                  <FontAwesomeIcon icon={faStop} />
                                </button>
                              </div>
                              <button
                                onClick={handleReset}
                                className="flex items-center justify-center w-10 h-10 text-gray-700 bg-transparent text-2xl hover:text-[#F2911B]"
                              >
                                <FontAwesomeIcon icon={faRedo} />
                              </button>
                            </>
                          )}
                        </div>
                        {audioChunks.length > 0 && (
                          <div className="mt-4 pt-8">
                            <button
                              onClick={handleUploadClick}
                              className={`bg-${
                                isSubmitDisabled
                                  ? "gray-400 cursor-not-allowed"
                                  : "[#F2911B]"
                              } text-white px-6 py-2 rounded-3xl w-full lg:w-auto border-2 hover:text-[#f2911b] hover:bg-white hover:border-[#f2911b]`}
                              disabled={isSubmitDisabled}
                            >
                              Submit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <audio
                      ref={audioRef}
                      controls
                      className="mt-4 w-full hidden"
                    ></audio>
                  </div>
                  <div className="flex flex-col items-center w-full">
                    <input
                      type="file"
                      ref={inputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-wrap  space-x-2 w-full ">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="relative flex flex-col items-center mb-2"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>



          <div className="hidden">
            <div className="flex items-start ">
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
                  </div>
                )}
              </div>
            </div>
          </div>








          <div className="flex items-start">
  <div className="relative bg-white shadow-md rounded-3xl p-6 overflow-hidden w-full">
    <div
      className={`flex items-center justify-between mb-4 cursor-pointer ${
        isImgOpen ? "bg-transparent" : ""
      }`}
      onClick={() => setIsImgOpen(!isImgOpen)}
    >
      <div className="flex items-center space-x-2">
        <span
          className={`h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full ${getStepClassName(
            1
          )}`}
        >
          2
        </span>
        <p className="font-bold text-lg">Upload Image (Optional)</p>
      </div>
      <FontAwesomeIcon
        icon={isImgOpen ? faAngleUp : faAngleDown}
      />
    </div>
    {isImgOpen && (
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
              onClick={handleRemoveCoverImage}
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </div>
        ) : (
          <div
            className="h-48 w-full border-dashed border-2 border-gray-300 flex items-center justify-center rounded-lg cursor-pointer"
            onClick={() => coverImageInputRef.current.click()}
          >
            <p className="text-gray-400">Click or Drag & Drop file here</p>
          </div>
        )}
        {coverImageName && (
          <span className="mt-2 text-sm text-gray-600">
            {coverImageName}
          </span>
        )}
      </div>
    )}
  </div>
</div>


























          <div
            className={`flex items-start ${
              isAnimating ? "animate-zoomIn" : ""
            }`}
          >
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
                        <a
                          href={`#${option.title}`}
                          className="px-4 py-2 flex"
                          id={`generateBtn${option.title}`}
                        ></a>
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
            <div
              className="flex flex-col mt-8"
              id={generatedPost.title}
              ref={generatedPostRef}
            >
              <div className="relative bg-white shadow-md rounded-3xl p-6 mb-6 overflow-hidden w-full max-w-5xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-lg">
                    {" "}
                    Generated {generatedPost.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    {isEditingGenerated ? (
                      <button
                        onClick={handleSaveGeneratedText}
                        className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                      >
                        <FontAwesomeIcon icon={faSave} className="" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingGenerated(true)}
                        className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                      >
                        <FontAwesomeIcon icon={faEdit} className="" />
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyContent(generatedPost.content)}
                      className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                    >
                      <FontAwesomeIcon icon={faCopy} className="" />
                    </button>
                    <button
  onClick={() => handleDownloadTextContent(generatedPost.title, generatedPost.content, speechThreadId)}
  className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
>
  <FontAwesomeIcon icon={faDownload} className="" />
</button>

                    <button
                      onClick={() =>
                        handleShareContent(
                          generatedPost.title,
                          generatedPost.content
                        )
                      }
                      className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                    >
                      <FontAwesomeIcon icon={faShareAlt} className="" />
                    </button>
                  </div>
                </div>
                <div className="p-4  rounded-lg overflow-auto text-sm">
                  {isEditingGenerated ? (
                    <ReactQuill
                      value={generatedPost.content}
                      onChange={(content) => {
                        setGeneratedPost({ ...generatedPost, content });
                      }}
                    />
                  ) : generatedPost.isHtmlContent ? (
                    <>
                      {coverImage && (
                   <div className="h-48 w-full mb-4 overflow-y-auto scrollbar-custom">
                   <img
                     src={coverImage}
                     alt="Cover"
                     className="w-full object-cover rounded-lg"
                   />
                 </div>
                 
                     
                      )}
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: generatedPost.content,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {coverImage && (
                         <div className="h-48 w-full mb-4 overflow-y-auto scrollbar-custom">
                         <img
                           src={coverImage}
                           alt="Cover"
                           className="w-full object-cover rounded-lg"
                         />
                       </div>
                      )}
                      <div className="whitespace-pre-wrap">
                        {stripHtmlTags(generatedPost.content)}
                      </div>
                    </>
                  )}
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
