import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";

import "./global.css"

createRoot(
  document.getElementById("root"),
).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        top: 18,
        right: 18,
        zIndex: 99999999,
      }}
      toastOptions={{
        duration: 3500,

        style: {
          maxWidth: "380px",

          padding:
            "12px 14px",

          border:
            "1px solid #e5e7eb",

          borderRadius:
            "12px",

          background:
            "#ffffff",

          color:
            "#172033",

          fontSize:
            "13px",

          fontWeight:
            "600",

          boxShadow:
            "0 16px 40px rgba(15, 23, 42, 0.16)",
        },

        success: {
          duration: 3000,
        },

        error: {
          duration: 4500,
        },

        loading: {
          duration:
            Infinity,
        },
      }}
    />
  </StrictMode>,
);