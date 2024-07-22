import React from 'react';
import Sidebar from '../Sidebar/Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <div className="flex-1 p-0 lg:p-4 overflow-auto scrollbar-Children pt-16" style={{ maxHeight: '100vh' }}>
                {children}
            </div>
        </div>
    );
};

export default Layout;
