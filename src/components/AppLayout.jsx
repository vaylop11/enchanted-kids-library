import React from "react";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-16 sm:pt-18">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
