import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faWandMagicSparkles,
  faPenToSquare,
  faCopy,
  faSignOutAlt,
  faDownload,
  faShareAlt,
} from "@fortawesome/free-solid-svg-icons";
import Summary from "../../Assets/images/summary1.png";
import eBook from "../../Assets/images/ebook1.png";
import Blog from "../../Assets/images/blog1.png";
import WhitePaper from "../../Assets/images/whitepaper1.png";
import Facebook from "../../Assets/images/facebook1.png";
import Twitter from "../../Assets/images/twitter1.png";
import LinkedIn from "../../Assets/images/linkedin1.png";
import Instagram from "../../Assets/images/instagram1.png";
import FileIcon from "../../Assets/images/music-icon.png";
import "../../App.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const HistoryDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  const [historyDetails, setHistoryDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedStatus, setGeneratedStatus] = useState({
    summary: false,
    ebook: false,
    blog_post: false,
    whitepaper: false,
    facebook_post: false,
    twitter_post: false,
    linkedin_post: false,
    instagram_post: false,
  });
  const [isEditingTranscript, setIsEditingTranscript] = useState(true);
  const [isEditingGenerated, setIsEditingGenerated] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isStep1Open, setIsStep1Open] = useState(false);
  const [isStep2Open, setIsStep2Open] = useState(false);
  const [isStep3Open, setIsStep3Open] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const editorInstance = useRef(null);

  const fetchHistoryDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please login first.");
      return;
    }
    try {
      const response = await axios.get(
        `https://speechinsightsweb.azurewebsites.net/speech_history/${id}/retrieve/`,
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
    fetchHistoryDetails();
    const intervalId = setInterval(fetchHistoryDetails, 10000); // Fetch data every 10 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [id]);

  const updateGeneratedStatus = (data) => {
    setGeneratedStatus({
      summary: data.summary !== null,
      ebook: data.ebook !== null,
      blog_post: data.blog_post !== null,
      whitepaper: data.whitepaper !== null,
      facebook_post: data.facebook_post !== null,
      twitter_post: data.twitter_post !== null,
      linkedin_post: data.linkedin_post !== null,
      instagram_post: data.instagram_post !== null,
    });
  };

  const handleGenerateContent = async (type, title) => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "Authentication required. Please login.", "error");
      return;
    }

    if (generatedStatus[type]) {
      setGeneratedPost({
        title,
        content: historyDetails[type],
        isHtmlContent: true,
      });
      setIsEditingGenerated(true);
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
        summary: "https://speechinsightsweb.azurewebsites.net/generate_summary/",
        ebook: "https://speechinsightsweb.azurewebsites.net/generate_ebook/",
        blog_post: "https://speechinsightsweb.azurewebsites.net/generate_blog_post/",
        whitepaper: "https://speechinsightsweb.azurewebsites.net/generate_whitepaper/",
        facebook_post: "https://speechinsightsweb.azurewebsites.net/generate_facebook_post/",
        twitter_post: "https://speechinsightsweb.azurewebsites.net/generate_twitter_post/",
        linkedin_post: "https://speechinsightsweb.azurewebsites.net/generate_linkedin_post/",
        instagram_post: "https://speechinsightsweb.azurewebsites.net/generate_instagram_post/",
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

        setGeneratedPost({
          title,
          content: response.data[type],
          isHtmlContent: true,
        });
        setIsEditingGenerated(true);
        Swal.close();
      }
    } catch (error) {
      console.error("Error generating content:", error);
      Swal.fire("Error", `Failed to generate ${title}. ${error.response ? error.response.data : "Please try again later."}`, "error");
    }
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
    Swal.fire("Copied!", "The content has been copied to clipboard.", "success");
  };

  const handleDownloadContent = (title, content) => {
    const doc = new jsPDF("p", "pt", "a4");
    const contentElement = document.createElement("div");
    contentElement.innerHTML = content;
    document.body.appendChild(contentElement);
    
    html2canvas(contentElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      doc.save(`${title}.pdf`);
      document.body.removeChild(contentElement);
    }).catch((error) => {
      console.error("Error generating PDF:", error);
      Swal.fire("Error", "Failed to generate PDF. Please try again.", "error");
    });
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
          Swal.fire("Shared!", "The content has been shared.", "success");
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
    setIsEditingTranscript(!isEditingTranscript);
  };

  const handleSaveTranscript = () => {
    setIsEditingTranscript(false);
  };

  const handleSaveGeneratedText = () => {
    if (editorInstance.current) {
      const editedContent = editorInstance.current.getData();
      setGeneratedPost({ ...generatedPost, content: editedContent });
      setIsEditingGenerated(false);
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
    return <div>Loading...</div>;
  }

  if (!historyDetails) {
    return <div>No history details found.</div>;
  }

  const Username = localStorage.getItem("Username");

  const generateOptions = [
    { title: "Summary", type: "summary", image: Summary },
    { title: "eBook", type: "ebook", image: eBook },
    { title: "Blog", type: "blog_post", image: Blog },
    { title: "White Paper", type: "whitepaper", image: WhitePaper },
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
      <div className="flex mt-4 flex-col-reverse md:flex-row justify-between items-center bg-white border-b-2 lg:pb-2">
        <div className="flex items-center mb-4 md:mb-0">
          {/* <h1 className="lg:text-2xl text-sm font-bold">{Username}👋</h1> */}
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
            <span className="text-xl font-bold text-gray-700">
              {Username.charAt(0).toUpperCase()}
            </span>
          </button>
          {dropdownVisible && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg">
              <button
                className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-[#F2911B]"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mt-4 py-10 bg-[#E8ECF4] rounded-2xl">
        <div className="space-y-6 mx-auto w-full max-w-5xl px-0">
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
                <div className="flex flex-row space-x-2 mt-2">
                  <button
                    onClick={handleEditToggleTranscript}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-white" />
                  </button>
                  <button
                    onClick={() => handleCopyContent(historyDetails.text)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-white" />
                  </button>
                </div>
                {isEditingTranscript && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleSaveTranscript}
                      className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                    >
                      Save
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="relative bg-white shadow-md rounded-3xl p-6">
            <div
              className={`flex items-center justify-between mb-4 cursor-pointer`}
              onClick={() => setIsStep3Open(!isStep3Open)}
            >
              <div className="flex items-center space-x-2">
                <span className="h-10 w-10 lg:h-8 lg:w-8 flex items-center justify-center text-base rounded-full bg-[#F2911B] text-white">3</span>
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
                        {generatedStatus[option.type] ? "Generated" : "Generate"}
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

          {generatedPost && (
            <div className="relative bg-white shadow-md rounded-3xl p-6 mb-6 overflow-hidden w-full max-w-5xl">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-lg">Generated </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyContent(generatedPost.content)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-white" />
                  </button>
                  <button
                    onClick={() => handleDownloadContent(generatedPost.title, generatedPost.content)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                  >
                    <FontAwesomeIcon icon={faDownload} className="text-white" />
                  </button>
                  <button
                    onClick={() => handleShareContent(generatedPost.content, generatedPost.title)}
                    className="flex items-center justify-center w-10 h-10 bg-[#F2911B] rounded-full"
                  >
                    <FontAwesomeIcon icon={faShareAlt} className="text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4 rounded-lg overflow-auto text-sm">
                {isEditingGenerated ? (
                  <CKEditor
                    editor={ClassicEditor}
                    data={generatedPost.content}
                    onReady={(editor) => {
                      editorInstance.current = editor;
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setGeneratedPost({ ...generatedPost, content: data });
                    }}
                  />
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedPost.content }}
                  />
                )}
                <div className="flex justify-center mt-4">
                  {isEditingGenerated && (
                    <button
                      onClick={handleSaveGeneratedText}
                      className="mt-2 px-4 py-2 bg-[#F2911B] text-white rounded-3xl"
                    >
                      Save
                    </button>
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

export default HistoryDetails;