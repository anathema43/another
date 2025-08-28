import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initializeCostOptimization } from "./utils/costOptimization.js";

// Initialize cost optimization measures
initializeCostOptimization();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
