import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "../styles/app.css";

const mount = document.getElementById("root");

if (!mount) {
  throw new Error("Renderer root element was not found.");
}

createRoot(mount).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
