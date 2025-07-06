import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { useAuthStore } from "./stores/authStore";

// Auth initializer component
function AuthInitializer() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthInitializer />
    <App />
    <Toaster position="top-right" />
  </StrictMode>
);
