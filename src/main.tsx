import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress noisy unhandled promise rejections coming from browser extensions (e.g. MetaMask).
// This app does not use web3, but some extensions inject scripts that can throw globally.
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason as any;
  const message = typeof reason === "string" ? reason : reason?.message;
  const stack = reason?.stack as string | undefined;

  const isMetaMaskNoise =
    (typeof message === "string" && message.includes("MetaMask")) ||
    (typeof stack === "string" &&
      (stack.includes("chrome-extension://") ||
        stack.includes("nkbihfbeogaeaoehlefnkodbefgpgknn")));

  if (isMetaMaskNoise) event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
