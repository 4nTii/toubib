import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { BlindColorProvider } from "./context/BlindColorContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BlindColorProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BlindColorProvider>
  </StrictMode>,
);
