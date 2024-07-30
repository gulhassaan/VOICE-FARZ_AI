// src/components/History/SharedHistoryWrapper.jsx
import React from "react";
import { useParams } from "react-router-dom";
import ShareHistory from './ShareHistory'; // Import the ShareHistory component

const SharedHistoryWrapper = () => {
  const { id } = useParams();
  console.log("SharedHistoryWrapper id:", id); // Debugging log

  return <ShareHistory speechThreadId={id} viewMode={true} />;
};

export default SharedHistoryWrapper;
