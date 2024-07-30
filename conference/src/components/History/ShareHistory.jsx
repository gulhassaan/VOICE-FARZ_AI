import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faWandMagicSparkles, faShareAlt ,faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Summary from "../../Assets/images/summary1.png";
import eBook from "../../Assets/images/ebook1.png";
import Blog from "../../Assets/images/blog1.png";
import MeetingNotes from "../../Assets/images/whitepaper1.png";
import Facebook from "../../Assets/images/facebook1.png";
import Twitter from "../../Assets/images/twitter1.png";
import LinkedIn from "../../Assets/images/linkedin1.png";
import Instagram from "../../Assets/images/instagram1.png";
import FileIcon from "../../Assets/images/music-icon.png";
import Mp4Icon from "../../Assets/images/file-icon.png";
import Mp3Icon from "../../Assets/images/file-icon.png";
import YouTubeIcon from "../../Assets/images/youtubeIcon.png";

const ShareHistory = ({ speechThreadId, viewMode = false }) => {
  const [sharableId, setSharableId] = useState(null);
  const [sharedLink, setSharedLink] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
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
  const [isStep1Open, setIsStep1Open] = useState(true);
  const [isStep2Open, setIsStep2Open] = useState(true);
  const generatedPostRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (viewMode && speechThreadId) {
      fetchSharedHistory(speechThreadId);
    }
  }, [speechThreadId, viewMode]);

  const fetchSharedHistory = async (id) => {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await axios.post(
        "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/shared_speech_thread_detail/retrieve/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistoryData(response.data);
      updateGeneratedStatus(response.data.speechthread_data);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch shared history. Please try again later.", "error");
    }
  };

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
    if (!token) {
      Swal.fire("Error", "Authentication required. Please login.", "error");
      return;
    }

    if (!isRegeneration && generatedStatus[type]) {
      setGeneratedContent({
        type,
        title,
        content: historyData.speechthread_data[type],
      });
      return;
    }

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
      formData.append("text", historyData.speechthread_data.text);
      formData.append("SpeechThread_id", speechThreadId);

      const response = await axios.post(apiUrls[type], formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setHistoryData({
          ...historyData,
          speechthread_data: {
            ...historyData.speechthread_data,
            [type]: response.data[type],
          },
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
        Swal.close();
        scrollToGeneratedPost();
      }
    } catch (error) {
      Swal.fire("Error", `Failed to generate ${title}. Please try again later.`, "error");
    }
  };

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

  const getSharableId = async () => {
    if (!token) {
      Swal.fire("Error", "Authentication required. Please login.", "error");
      return;
    }

    if (!speechThreadId) {
      console.error("SpeechThread_id is undefined.");
      Swal.fire("Error", "SpeechThread_id is undefined.", "error");
      return;
    }

    try {
      console.log("Sending request to share API with SpeechThread_id:", speechThreadId);

      const formData = new FormData();
      formData.append("SpeechThread_id", speechThreadId);

      console.log("Payload:", formData);

      const response = await axios.post(
        "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/share_speech_thread/share/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from share API:", response.data);
      setSharableId(response.data.id);
      shareHistory(response.data.id);
    } catch (error) {
      console.error("Error getting sharable ID:", error);
      Swal.fire("Error", "Failed to get sharable ID. Please try again later.", "error");
    }
  };

  const shareHistory = async (id) => {
    try {
      console.log("Sending request to retrieve shared history with ID:", id);

      const formData = new FormData();
      formData.append("id", id);

      const response = await axios.post(
        "https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/shared_speech_thread_detail/retrieve/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from retrieve API:", response.data);
    //   const link = `http://localhost:3000/shared/${response.data.id}`;
      const link = `https://voice.farz.ai/shared/${response.data.id}`;
      
      setSharedLink(link);

      // Show the link in SweetAlert
      Swal.fire({
        title: "Shareable Link",
        text: link,
        icon: "info",
        confirmButtonText: "Copy Link",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigator.clipboard.writeText(link);
        }
      });
    } catch (error) {
      console.error("Error sharing history:", error);
      Swal.fire("Error", "Failed to share history. Please try again later.", "error");
    }
  };

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

  if (viewMode && historyData) {
    const { speechthread_data } = historyData;

    const renderFileSection = (title, files, icon) => (
      <div className="relative bg-white shadow-md rounded-3xl p-6">
        <div
          className={`flex items-center justify-between mb-4 cursor-pointer`}
          onClick={() => setIsStep1Open(!isStep1Open)}
        >
          <div className="flex items-center space-x-2">
            <span className="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full bg-[#F2911B] text-white">
              1
            </span>
            <p className="font-bold text-lg">{title}</p>
          </div>
          <FontAwesomeIcon icon={isStep1Open ? faAngleUp : faAngleDown} />
        </div>
        {isStep1Open && (
          <div className="flex flex-wrap space-x-2">
            {files.map((file, index) => (
              <div key={index} className="relative flex flex-col items-center mb-2">
                <div className="bg-[rgba(242,145,27,0.2)] p-1 rounded-lg">
                  <img src={icon} alt={file} className="h-12 w-12 mb-2" />
                </div>
                {typeof file === "string" ? (
                  <a href={file} target="_blank" rel="noopener noreferrer" className="text-gray-700 text-sm mt-2">
                    {file}
                  </a>
                ) : (
                  <p className="text-gray-700 text-sm mt-2">{file}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div className="container mx-auto px-0">
        <div className="flex flex-col items-center mt-4 py-10 bg-[#E8ECF4] rounded-2xl">
          <div className="space-y-6 mx-auto w-full max-w-5xl px-0">
             {/* Title, Date, and Message Section */}
             <div className="text-left mb-6">
  <h1 className="text-3xl font-bold">{speechthread_data.title}</h1>
  <p className="text-gray-500">{new Date(speechthread_data.updated_at).toLocaleDateString()}</p>
  <div className="mt-2 p-4 bg-orange-50 text-gray-700 rounded-md flex items-start">
    <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5 text-black mr-2" />
    <p>This conversation may reflect the link creator’s personalized data, which isn’t shared and can meaningfully change how the model responds.</p>
  </div>
  <hr className="mt-4 border-gray-300" />
</div>

            {speechthread_data.recording_file_names.length > 0 &&
              renderFileSection("Dynamic Audio Files", speechthread_data.recording_file_names, FileIcon)}

            {speechthread_data.youtube_links.length > 0 &&
              renderFileSection("YouTube Links", speechthread_data.youtube_links, YouTubeIcon)}

            <div className="relative bg-white shadow-md rounded-3xl p-6">
              <div
                className={`flex items-center justify-between mb-4 cursor-pointer`}
                onClick={() => setIsStep2Open(!isStep2Open)}
              >
                <div className="flex items-center space-x-2">
                  <span className="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full bg-[#F2911B] text-white">
                    2
                  </span>
                  <p className="font-bold text-lg">Generate</p>
                </div>
                <FontAwesomeIcon icon={isStep2Open ? faAngleUp : faAngleDown} />
              </div>
              {isStep2Open && (
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
                    {/* Additional buttons or actions can be added here */}
                  </div>
                </div>
                <div className="p-4 rounded-lg overflow-auto text-sm">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!viewMode && (
        <button onClick={getSharableId} className="absolute right-24 top-24 md:top-24 md:right-32 lg:top-10 lg:right-28 border-2 text-white hover:border-[#F2911B] hover:bg-transparent bg-[#F2911B] hover:text-[#F2911B] rounded-3xl px-4 py-2">
           <FontAwesomeIcon className="mr-2" icon={faShareAlt} />
           <span>Share History</span>
        </button>
      )}
    </div>
  );
};

export default ShareHistory;
