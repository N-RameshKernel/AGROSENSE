import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./index.css";
import ChatPage from "./pages/ChatPage";
import ExpertPanel from "./pages/ExpertPanel";
import HistoryPage from "./pages/HistoryPage";
import LandingPage from "./pages/LandingPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/expert" element={<ExpertPanel />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
