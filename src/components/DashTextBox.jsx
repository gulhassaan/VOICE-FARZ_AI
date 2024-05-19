import React, { useState, useEffect } from "react";
import axios from "axios";

const DashTextBox = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isSummary, setIsSummary] = useState(false);
  const [isWhitePaper, setIsWhitePaper] = useState(false);
  const [step, setStep] = useState(1);
  const [recordedText, setRecordedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isEditable, setIsEditable] = React.useState(false);
  const [token, setToken] = useState("");
  const [speechThread, setSpeechThread] = useState(null);
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
          console.log("Error verifying token on Navbar: ", error);
        });
    } else {
      // If token is not available, set login status to false
      setIsLoggedIn(false);
    }
  }, [token]);
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = []; // Create an array to store audio chunks

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data); // Push each audio chunk to the array
        };

        mediaRecorder.onstop = () => {
          // const audioBlob = new Blob(chunks, { type: mediaRecorder.mimeType });
          // concatenate all the audio chunks into a single blob with the correct mime type from first chunk
          const audioBlob = new Blob(chunks, { type: chunks[0].type });
          setAudioChunks(chunks); // Save chunks to state
          setRecording(false);
          setIsLoading(true); // Start loading before sending data

          const formData = new FormData();
          formData.append("file", audioBlob);

          axios
            .post("http://localhost:8000/transcribe/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Token ${token}`,
              },
            })
            .then((response) => {
              const { data } = response;
              setRecordedText(data.text);
              setSpeechThread(data.SpeechThread_id);
            })
            .catch((error) => {
              console.error("Error transcribing audio:", error);
              alert("Error transcribing audio");
            })
            .finally(() => {
              setIsLoading(false); // Stop loading after request completes
            });
        };

        mediaRecorder.start();
        setRecording(true);
        setMediaRecorder(mediaRecorder);
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  const stopRecording = () => {
    if (recording) {
      mediaRecorder.stop();
    }
  };

  const handleMicOption = () => {
    if (!recording) {
      setRecordedText("");
      
      setSpeechThread(null);
      setStep(5);
      startRecording();
    } else {
      setStep(2);
      stopRecording();
    }
  };
  const handleFileOption = (event) => {
    setIsLoading(true);
    const file = event.target.files[0];

    // Create a FormData instance
    const formData = new FormData();
    // Append the file to the form data
    formData.append("file", file);

    // Send formData to backend
    axios
      .post("http://localhost:8000/transcribe/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      })
      .then((response) => {
        const { data } = response;
        setRecordedText(data.text);
        
        setSpeechThread(data.SpeechThread_id);
      })
      .catch((error) => {
        console.error("Error transcribing file:", error);
        // Handle error
        alert("Error transcribing file");
        setIsLoading(false);
      })
      .finally(() => {
        setStep(2);
        setIsLoading(false);
      });
  };

  const handleYouTubeOption = () => {
    setStep(6);
  };

  const handleGenerateSummary = () => {
    setIsLoading(true);
    axios
      .post(
        "http://localhost:8000/generate_summary/",
        {
          text: recordedText,
          SpeechThread_id: speechThread,

        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Token ${token}`,
          },
        }
      )
      .then((response) => {
        const { data } = response;
        setRecordedText(data.summary);
        
        setSpeechThread(data.SpeechThread_id);
        setIsSummary(true);
        setIsWhitePaper(false);
        setStep(3);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error generating summary:", error);
        alert("Error generating summary");
        setIsLoading(false);
        // handleRestart();
      });
  };

  const handleGenerateWhitePaper = () => {
    setIsLoading(true);
    axios
      .post(
        "http://localhost:8000/generate_whitepaper/",
        {
          text: recordedText,
          SpeechThread_id: speechThread,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Token ${token}`,
          },
        }
      )
      .then((response) => {
        const { data } = response;
        // setWhitePaperText(data.whitepaper);
        setRecordedText(data.whitepaper);
        
        setSpeechThread(data.SpeechThread_id);
        setIsWhitePaper(true);
        setIsSummary(false);
        setStep(3);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error generating whitepaper:", error);
        alert("Error generating whitepaper");
        // Handle error
        setIsLoading(false);
        // handleRestart();
      });
  };

  const handleDownloadPDF = () => {
    setIsLoading(true);
    axios
      .post(
        "http://localhost:8000/generate_pdf/",
        {
          text: recordedText,
          SpeechThread_id: speechThread,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          responseType: "blob",
          crossorigin: true,
        }
      )
      .then((response) => {
        console.log("PDF response:", response);
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF");
        setIsLoading(false);
      });
  };

  const handleGenerateBlogPost = () => {
    setIsLoading(true); // set loading state to true
    axios
      .post(
        "http://localhost:8000/generate_blog_post/",
        {
          text: recordedText,
          SpeechThread_id: speechThread,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Token ${token}`,
          },
        }
      )
      .then((response) => {
        const { data } = response;
        setRecordedText(data.blog_post);
        
        setSpeechThread(data.SpeechThread_id);
        setIsLoading(false); // set loading state to false
        setStep(4); // move to the next step
      })
      .catch((error) => {
        console.error("Error generating blog post:", error);
        setIsLoading(false); // set loading state to false
        alert("Error generating blog post");
      });
  };

  const handleGenerateInstagramPost = () => {
    setIsLoading(true); // set loading state to true
    axios
      .post(
        "http://localhost:8000/generate_instagram_post/",
        {
          text: recordedText,
          SpeechThread_id: speechThread,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Token ${token}`,
          },
        }
      )
      .then((response) => {
        const { data } = response;
        setRecordedText(data.instagram_post);
        
        setSpeechThread(data.SpeechThread_id);
        setIsLoading(false); // set loading state to false
        setStep(4); // move to the next step
      })
      .catch((error) => {
        console.error("Error generating Instagram post:", error);
        setIsLoading(false); // set loading state to false
        alert("Error generating Instagram post");
      });
  };

  const handleGenerateLinkedInPost = () => {
    setIsLoading(true); // set loading state to true
    axios
      .post(
        "http://localhost:8000/generate_linkedin_post/",
        {
          text: recordedText,
          SpeechThread_id: speechThread,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Token ${token}`,
          },
        }
      )
      .then((response) => {
        const { data } = response;
        setRecordedText(data.linkedin_post);
        
        setSpeechThread(data.SpeechThread_id);
        setIsLoading(false); // set loading state to false
        setStep(4); // move to the next step
      })
      .catch((error) => {
        console.error("Error generating LinkedIn post:", error);
        setIsLoading(false); // set loading state to false
        alert("Error generating LinkedIn post");
      });
  };

  const handleYoutubeSubmit = () => {
    setIsLoading(true); // set loading state to true

    axios
      .post(
        "http://localhost:8000/transcribe/",
        { youtube_url: youtubeUrl },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Token ${token}`,
          },
        }
      )
      .then((response) => {
        const { data } = response;
        setRecordedText(data.text);
        
        setSpeechThread(data.SpeechThread_id);
        setYoutubeUrl("");
        setIsLoading(false); // set loading state to false
        setStep(2); // move to the next step
      })
      .catch((error) => {
        console.error("Error transcribing YouTube video:", error);
        setIsLoading(false); // set loading state to
        setYoutubeUrl("");
        // show error message to user in an alert that was received in data
        const message = error.response.data.error;
        alert(message);
      });
  };
  const handleRestart = () => {
    setStep(1);
    setRecordedText("");
    setSpeechThread(null);
    setIsWhitePaper(false);
    setIsSummary(false);
    setYoutubeUrl("");
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
      {isLoading ? (
        <>
          <p className="animate-pulse text-2xl font-bold">Loading...</p>
        </>
      ) : !isLoggedIn ? (
        <div>
          <h1 className="text-3xl font-semibold mb-4 text-center text-yellow-600">
            Please login to continue
          </h1>
        </div>
      ) : step === 1 ? (
        <>
          <h1 className="text-3xl font-semibold mb-4 text-center text-yellow-600">
            Choose Input
          </h1>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-700"
              onClick={handleMicOption}
            >
              Record
            </button>
            <label className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base bg-green-500 text-white rounded-md hover:bg-green-700 cursor-pointer">
              File Input
              <input
                type="file"
                className="hidden"
                onChange={handleFileOption}
              />
            </label>
            <button
              type="button"
              className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base bg-red-500 text-white rounded-md hover:bg-red-700"
              onClick={handleYouTubeOption}
            >
              YouTube Link
            </button>
            <button
              type="button"
              className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base bg-purple-500 text-white rounded-md hover:bg-purple-700"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </>
      ) : step === 2 ? (
        <>
  <div className="w-full">
    <h1 className="text-xl sm:text-3xl font-semibold mb-4 text-center text-yellow-600">
      Transcribed Text
    </h1>
    <textarea
      className="w-full h-3/4 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 resize-none"
      rows="10"
      placeholder="Enter your text here"
      readOnly={!isEditable}
      onChange={(e) => setRecordedText(e.target.value)}
      value={recordedText}
    ></textarea>
  </div>
  <div className="flex space-x-2 sm:space-x-4">
  <button
    type="button"
    className="w-24 h-10 sm:w-32 sm:h-12 text-xs sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-700"
    onClick={() => setIsEditable(!isEditable)}
  >
    {isEditable ? "Save" : "Edit"}
  </button>
  <button
    type="button"
    className="w-24 h-10 sm:w-32 sm:h-12 text-xs sm:text-base bg-blue-500 text-white rounded-md hover:bg-blue-700"
    onClick={handleGenerateWhitePaper}
    disabled={isWhitePaper}
    hidden={isWhitePaper}
  >
    Generate White Paper
  </button>
  <button
    type="button"
    className="w-24 h-10 sm:w-32 sm:h-12 text-xs sm:text-base bg-green-500 text-white rounded-md hover:bg-green-700"
    onClick={handleGenerateSummary}
    disabled={isSummary}
    hidden={isSummary}
  >
    Generate Summary
  </button>
  <button
    type="button"
    className="w-24 h-10 sm:w-32 sm:h-12 text-xs sm:text-base bg-purple-500 text-white rounded-md hover:bg-purple-700"
    onClick={handleRestart}
  >
    Restart
  </button>
</div>
</>
      ) : step === 3 ? (
        <>
          <div className="w-full">
            <h1 className="text-3xl font-semibold mb-4 text-center text-yellow-600">
              {isSummary ? "Generated Summary" : "Generated White Paper"}
            </h1>
            <textarea
              className="w-full h-3/4 px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 resize-none"
              rows="10"
              placeholder="Enter your text here"
              readOnly={!isEditable}
              onChange={(e) => setRecordedText(e.target.value)}
              value={recordedText}
            ></textarea>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
              onClick={() => setIsEditable(!isEditable)}
            >
              {isEditable ? "Save" : "Edit"}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
              onClick={handleGenerateWhitePaper}
              disabled={isWhitePaper}
              hidden={isWhitePaper}
            >
              Generate White Paper
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
              onClick={handleGenerateSummary}
              disabled={isSummary}
              hidden={isSummary}
            >
              Generate Summary
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
              onClick={handleGenerateInstagramPost}
            >
              Generate Instagram Post
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
              onClick={handleGenerateBlogPost}
            >
              Generate Blog Post
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
              onClick={handleGenerateLinkedInPost}
            >
              Generate LinkedIn Post
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-700"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </>
      ) : step === 4 ? (
        <>
          <div className="w-full">
            <h1 className="text-3xl font-semibold mb-4 text-center text-yellow-600">
              Generated Post
            </h1>
            <textarea
              className="w-full h-3/4 px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 resize-none"
              rows="10"
              placeholder="Enter your text here"
              readOnly={!isEditable}
              onChange={(e) => setRecordedText(e.target.value)}
              value={recordedText}
            ></textarea>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
              onClick={() => setIsEditable(!isEditable)}
            >
              {isEditable ? "Save" : "Edit"}
            </button>{" "}
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
              onClick={() => navigator.clipboard.writeText(recordedText)}
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-700"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </>
      ) : step === 5 ? (
        <>
          <h2 className="text-2xl font-bold mb-8 text-yellow-600">
            Recording Voice
          </h2>
          {recording && (
            <div className="h-4 w-4 bg-red-500 rounded-full pulse"></div>
          )}
          <div className="flex items-center space-x-4 mt-8">
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 "
              onClick={handleMicOption}
            >
              Stop Recording
            </button>
          </div>
        </>
      ) : step === 6 ? (
        <div>
          <h1 className="text-3xl font-semibold mb-4 text-center text-yellow-600">
            Enter YouTube URL
          </h1>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="border border-gray-300 p-2 rounded-md mb-4"
          />
          <button
            type="button"
            onClick={handleYoutubeSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DashTextBox;
