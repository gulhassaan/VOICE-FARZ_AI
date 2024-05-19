// Dashboard.js
import React from "react";
import Navbar from './Navbar';
import LeftSidebar from "./LeftSidebar";
import DashTextBox from "./DashTextBox";
const Dashboard = () => {
  return (
    <>
    <Navbar />
      <div className="flex bg-gray-100 ">
        <LeftSidebar {...{ Option: "dashboard" }} />
        <div className="flex-grow text-gray-800">
          {/* <DashHeader /> */}
          <main className="p-6 sm:p-10 space-y-6">
            <DashTextBox />
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
