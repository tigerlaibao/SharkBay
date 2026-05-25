import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UsageReport } from "./UsageReport.js";
import "../styles/app.css";
import "./usage-window.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UsageReport />
  </StrictMode>
);
