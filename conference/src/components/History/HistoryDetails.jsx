import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faWandMagicSparkles, faPenToSquare, faCopy, faSignOutAlt, faEdit, faSave, faDownload, faShareAlt, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import Summary from "../../Assets/images/summary1.png";
import eBook from "../../Assets/images/ebook1.png";
import Blog from "../../Assets/images/blog1.png";
import MeetingNotes from "../../Assets/images/whitepaper1.png";
import Facebook from "../../Assets/images/facebook1.png";
import Twitter from "../../Assets/images/twitter1.png";
import LinkedIn from "../../Assets/images/linkedin1.png";
import Instagram from "../../Assets/images/instagram1.png";
import FileIcon from "../../Assets/images/music-icon.png";
import "../../App.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShareHistory from './ShareHistory'; // Import the ShareHistory component
import Loading from '../../Assets/images/loading.svg'
import Nothing from '../../Assets/images/nothing.svg'

const HistoryDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  const [historyDetails, setHistoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedStatus, setGeneratedStatus] = useState({
    summary: false,
    ebook: false,
    blog_post: false,
    meeting_notes: false,
    facebook_post: false,
    twitter_post: false,
    linkedin_post: false,
    instagram_post: false,
  });
  const [isEditingTranscript, setIsEditingTranscript] = useState(true);
  const [isEditingGenerated, setIsEditingGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [isStep1Open, setIsStep1Open] = useState(false);
  const [isStep2Open, setIsStep2Open] = useState(false);
  const [isStep3Open, setIsStep3Open] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const editorInstance = useRef(null);
  const generatedPostRef = useRef(null);

  const fetchHistoryDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please login first.");
      return;
    }
    try {
      const response = await axios.get(
        `https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/speech_history/${id}/retrieve/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistoryDetails(response.data);
      updateGeneratedStatus(response.data);
    } catch (error) {
      console.error("Error fetching history details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log("HistoryDetails id:", id); // Debugging log
    setHistoryDetails(null);
    fetchHistoryDetails();
    const intervalId = setInterval(fetchHistoryDetails, 1000); 

    return () => clearInterval(intervalId); 
  }, [id]);

  useEffect(() => {
    console.log("HistoryDetails id:", id); // Debugging log
    // Clear the generatedPost state when the id changes
    setGeneratedContent(null);
  }, [id]);

  const updateGeneratedStatus = (data) => {
    setGeneratedStatus({
      summary: data.summary !== null,
      ebook: data.ebook !== null,
      blog_post: data.blog_post !== null,
      meeting_notes: data.meeting_notes !== null,
      facebook_post: data.facebook_post !== null,
      twitter_post: data.twitter_post !== null,
      linkedin_post: data.linkedin_post !== null,
      instagram_post: data.instagram_post !== null,
    });
  };

  const handleGenerateContent = async (type, title, isRegeneration = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "Authentication required. Please login.", "error");
      return;
    }

    if (!isRegeneration && generatedStatus[type]) {
      setGeneratedContent({
        type,
        title,
        content: historyDetails[type],
      });
      setIsEditingGenerated(false);
      return;
    }

    setRegenerating(true);

    try {
      Swal.fire({
        title: `Generating ${title}...`,
        html: `
          <div class="relative flex items-center justify-center overflow-hidden mt-4">
            <div class="w-16 h-16 border-4 border-solid border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            <div class="absolute flex items-center justify-center">
              <div class="w-12 h-12 border-4 border-solid border-transparent border-t-black rounded-full animate-spin m-2"></div>
              <div class="absolute w-8 h-8 border-4 border-solid border-transparent border-t-orange-500 rounded-full animate-spin m-2"></div>
            </div>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        customClass: {
          popup: "w-96 h-64 flex flex-col items-start justify-start p-4",
          title: "text-lg",
          htmlContainer: "flex flex-col items-center justify-center w-full h-full",
        },
      });

      const apiUrls = {
        summary: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_summary/",
        ebook: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_ebook/",
        blog_post: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_blog_post/",
        meeting_notes: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_meeting_notes/",
        facebook_post: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_facebook_post/",
        twitter_post: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_twitter_post/",
        linkedin_post: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_linkedin_post/",
        instagram_post: "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/generate_instagram_post/",
      };

      const formData = new FormData();
      formData.append("text", historyDetails.text);
      formData.append("SpeechThread_id", id);

      const response = await axios.post(apiUrls[type], formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setHistoryDetails({
          ...historyDetails,
          [type]: response.data[type],
        });

        setGeneratedStatus((prevStatus) => ({
          ...prevStatus,
          [type]: true,
        }));

        setGeneratedContent({
          type,
          title,
          content: response.data[type],
        });
        setIsEditingGenerated(true);
        setRegenerating(false);
        Swal.close();

        // Automatically open the next step
        if (type === "summary") {
          setIsStep1Open(false);
          setIsStep2Open(true);
        } else if (type === "ebook") {
          setIsStep2Open(false);
          setIsStep3Open(true);
        }

        // Scroll to the generated post
        scrollToGeneratedPost();
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setRegenerating(false);
      Swal.fire("Error", `Failed to generate ${title}. ${error.response ? error.response.data : "Please try again later."}`, "error");
    }
  };

  useEffect(() => {
    if (generatedContent) {
      scrollToGeneratedPost();
    }
  }, [generatedContent]);

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

  const handleDownloadContent = async (title, content, speechThreadId) => {
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
      // toast.error("Failed to generate PDF. Please try again.", {
      //   position: "top-right",
      //   autoClose: 5000,
      // });
    }
  };

  const handleShareContent = (content, title) => {
    if (navigator.share) {
      navigator
        .share({
          title: `Generated ${title}`,
          text: stripHtmlTags(content),
          html: content,
        })
        .then(() => {
          // Swal.fire("Shared!", "The content has been shared.", "success");
        })
        .catch((err) => {
          console.error("Failed to share:", err);
        });
    } else {
      Swal.fire("Error", "Web share is not supported on this browser.", "error");
    }
  };

  const stripHtmlTags = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleEditToggleTranscript = () => {
    setIsEditingTranscript(true);
  };

  const handleSaveTranscript = () => {
    setIsEditingTranscript(false);
  };

  const handleSaveGeneratedText = async () => {
    if (editorInstance.current) {
      const editedContent = editorInstance.current.getEditor().root.innerHTML;
      setGeneratedContent({
        ...generatedContent,
        content: editedContent
      });
      setIsEditingGenerated(false);
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Error", "Authentication required. Please login.", "error");
          return;
        }
  
        const dataToUpdate = {
          youtube_links: historyDetails.youtube_links,
          recording_file_names: historyDetails.recording_file_names,
          multiple_speakers: historyDetails.multiple_speakers,
          status: historyDetails.status,
          text: historyDetails.text,
          twitter_post: generatedContent.type === "twitter_post" ? editedContent : historyDetails.twitter_post,
          facebook_post: generatedContent.type === "facebook_post" ? editedContent : historyDetails.facebook_post,
          instagram_post: generatedContent.type === "instagram_post" ? editedContent : historyDetails.instagram_post,
          linkedin_post: generatedContent.type === "linkedin_post" ? editedContent : historyDetails.linkedin_post,
          meeting_notes: generatedContent.type === "meeting_notes" ? editedContent : historyDetails.meeting_notes,
          summary: generatedContent.type === "summary" ? editedContent : historyDetails.summary,
          whitepaper: historyDetails.whitepaper,
          blog_post: generatedContent.type === "blog_post" ? editedContent : historyDetails.blog_post,
          ebook: generatedContent.type === "ebook" ? editedContent : historyDetails.ebook,
          title: historyDetails.title,
          user: historyDetails.user, // Ensure this is a valid user ID
          pdf_file: historyDetails.pdf_file, // Ensure this is a valid file ID
          picture_file: historyDetails.picture_file // Ensure this is a valid file ID
        };
  
        const response = await axios.put(
          `https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/speech_history/${id}/update/`,
          dataToUpdate,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        if (response.status === 200) {
          toast.success("Content saved successfully!", {
            position: "top-right",
            autoClose: 5000
          });
        } else {
          throw new Error("Failed to save content");
        }
      } catch (error) {
        console.error("Error saving generated content:", error);
        // Swal.fire("Error", "Failed to save content. Please try again later.", "error");
      }
    }
  };
  
  

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
  };

  if (loading) {
    return  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div>Loading...</div>
      <div>
        <img src={Loading} alt="Loading" />
      </div>
    </div>
  </div>;
  }

  if (!historyDetails) {
    return  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
        <img class="w-1/2 h-1/2 mx-auto" src={Nothing} alt="Loading" />
        <div>No History detail found</div>
    </div>
</div>

;
  }

  const Username = localStorage.getItem("Username");

  const generateOptions = [
    { title: "Summary", type: "summary", image: Summary },
    { title: "Notes", type: "meeting_notes", image: MeetingNotes },
    { title: "Blog", type: "blog_post", image: Blog },
    { title: "eBook", type: "ebook", image: eBook },
    { title: "Instagram", type: "instagram_post", image: Instagram },
    { title: "Facebook", type: "facebook_post", image: Facebook },
    { title: "Twitter", type: "twitter_post", image: Twitter },
    { title: "LinkedIn", type: "linkedin_post", image: LinkedIn },
  ];

  const handleDashboardClick = () => {
    history.push("/dashboard");
  };

  return (
    <div className="container mx-auto px-0">
      <div className="flex flex-col items-center mt-4 py-10 bg-[#E8ECF4] rounded-2xl">
        <div className="space-y-6 mx-auto w-full max-w-5xl px-0">
          <ShareHistory speechThreadId={id} />
          {/* Add the ShareHistory component here */}
          <div className="relative bg-white shadow-md rounded-3xl p-6">
            <div
              className={`flex items-center justify-between mb-4 cursor-pointer`}
              onClick={() => setIsStep1Open(!isStep1Open)}
            >
              <div className="flex items-center space-x-2">
                <span className="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full bg-[#F2911B] text-white">
                  1
                </span>
                <p className="font-bold text-lg">
                  {historyDetails.youtube_links.length > 0
                    ? "YouTube Link"
                    : historyDetails.recording_file_names.length > 0
                    ? "Audio File"
                    : "Upload File"}
                </p>
              </div>
              <FontAwesomeIcon icon={isStep1Open ? faAngleUp : faAngleDown} />
            </div>
            {isStep1Open && (
              <div className="flex flex-wrap space-x-2">
                {historyDetails.recording_file_names.length > 0 &&
                  historyDetails.recording_file_names.map((file, index) => (
                    <div key={index} className="relative flex flex-col items-center mb-2">
                      <div className="bg-[rgba(242,145,27,0.2)] p-1 rounded-lg">
                        <img src={FileIcon} alt={file} className="h-12 w-12 mb-2" />
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{file}</p>
                    </div>
                  ))}
                {historyDetails.youtube_links.length > 0 &&
                  historyDetails.youtube_links.map((link, index) => (
                    <div key={index} className="relative flex flex-col items-center mb-2 ">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2 ">
                        {link}
                      </a>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="hidden">
            <div className="relative bg-white shadow-md rounded-3xl p-6">
              <div
                className={`flex items-center justify-between mb-4 cursor-pointer`}
                onClick={() => setIsStep2Open(!isStep2Open)}
              >
                <div className="flex items-center space-x-2">
                  <span className="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full bg-[#F2911B] text-white">
                    2
                  </span>
                  <p className="font-bold text-lg">Transcript</p>
                </div>
                <FontAwesomeIcon icon={isStep2Open ? faAngleUp : faAngleDown} />
              </div>
              {isStep2Open && (
                <>
                  <div className="w-full h-48 p-2 bg-gray-100 border border-gray-300 rounded-lg overflow-auto">
                    {isEditingTranscript ? (
                      <textarea
                        className="w-full h-48 p-2 bg-gray-100 border border-gray-300 rounded-lg"
                        value={historyDetails.text}
                        onChange={(e) => setHistoryDetails({ ...historyDetails, text: e.target.value })}
                      />
                    ) : (
                      <div className="w-full h-48 p-2 bg-gray-100 border border-gray-300 rounded-lg overflow-auto">
                        {historyDetails.text}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center mt-2">
                    {isEditingTranscript ? (
                      <button
                        onClick={handleSaveTranscript}
                        className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={handleEditToggleTranscript}
                        className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="relative bg-white shadow-md rounded-3xl p-6">
            <div
              className={`flex items-center justify-between mb-4 cursor-pointer`}
              onClick={() => setIsStep3Open(!isStep3Open)}
            >
              <div className="flex items-center space-x-2">
                <span className="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full bg-[#F2911B] text-white">
                  2
                </span>
                <p className="font-bold text-lg">Generate</p>
              </div>
              <FontAwesomeIcon icon={isStep3Open ? faAngleUp : faAngleDown} />
            </div>
            {isStep3Open && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {generateOptions.map((option, index) => (
                  <div
                    key={index}
                    className="relative p-4 border-solid border border-black rounded-lg group cursor-pointer hover:bg-gray-200"
                  >
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity ${
                        generatedStatus[option.type]
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <button
                        onClick={() => handleGenerateContent(option.type, option.title)}
                        className={`text-white px-4 py-2 rounded-3xl transition-colors duration-300 ${
                          generatedStatus[option.type]
                            ? "bg-gray-700"
                            : "bg-[#F2911B] hover:bg-[#e57d0e]"
                        }`}
                      >
                        {generatedStatus[option.type] ? `Generated ${option.title}` : `Generate `}
                        <FontAwesomeIcon
                          icon={faWandMagicSparkles}
                          className="text-white ml-2"
                        />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold">{option.title}</p>
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

          {generatedContent && (
            <div
              className="relative bg-white shadow-md rounded-3xl p-6 mb-6 overflow-hidden w-full max-w-5xl"
              ref={generatedPostRef}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-lg">Generated {generatedContent.title}</p>
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
                    onClick={() => handleCopyContent(generatedContent.content)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                  >
                    <FontAwesomeIcon icon={faCopy} className="" />
                  </button>
                  <button
                    onClick={() => handleDownloadContent(generatedContent.title, generatedContent.content, id)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                  >
                    <FontAwesomeIcon icon={faDownload} className="" />
                  </button>
                  <button
                    onClick={() => handleShareContent(generatedContent.content, generatedContent.title)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                  >
                    <FontAwesomeIcon icon={faShareAlt} className="" />
                  </button>
                  <button
                    onClick={() => handleGenerateContent(generatedContent.type, generatedContent.title, true)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full hover:bg-white text-white hover:text-[#F2911B] border-2 border-[#F2911B]"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} className="" />
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-lg overflow-auto text-sm">
                {isEditingGenerated ? (
                  <ReactQuill
                    value={generatedContent.content}
                    onChange={(content) => setGeneratedContent({ ...generatedContent, content })}
                    ref={editorInstance}
                  />
                ) : (
                  <div>
                    {historyDetails.picturefile_url && (
                        <div className="h-60 w-full mb-4 overflow-y-auto rounded-2xl scrollbar-custom">
                        <img src={historyDetails.picturefile_url} alt="Generated Content" className="w-full h-auto rounded-2xl" />
                      </div>
                    )}
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: regenerating ? "Generating content..." : generatedContent.content }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HistoryDetails;
