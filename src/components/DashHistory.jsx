import React from "react";

import Navbar from './Navbar';
import LeftSidebar from "./LeftSidebar";
const DashHistory = () => {
  
  // Dummy data for demonstration
  const [historyData, setHistoryData] = React.useState([
    { id: 1, text: "Created Pdf 1", date: "2024-04-11" },
    { id: 2, text: "Created Pdf 2", date: "2024-04-11" },
    { id: 3, text: "Created Pdf 3", date: "2024-04-11" },
    { id: 4, text: "Created Pdf 4", date: "2024-04-11" },
    { id: 5, text: "Created Pdf 5", date: "2024-04-11" },
    // Add more data as needed
  ]);

  const handleDelete = (id) => {
    // Filter out the item with the specified ID
    const updatedHistory = historyData.filter((item) => item.id !== id);
    // Update the state with the filtered history data
    setHistoryData(updatedHistory);
  };

  return (
    <><Navbar />
    <div className="flex bg-gray-100 min-h-screen">
          <LeftSidebar {...{ Option: "dashboard" }} />
          <div className="flex-grow text-gray-800">
            {/* <DashHeader /> */}
            <main className="p-6 sm:p-10 space-y-6">
            <div className="flex flex-col bg-white shadow rounded-lg p-6 w-50">
        <h2 className="text-lg font-semibold mb-4">History</h2>
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Text
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyData.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.text}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
            </main>
          </div>
        </div>
    
    </>
  );
};

export default DashHistory;
