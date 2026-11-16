import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@xdev-asia/ui/fonts.css";
import "@xdev-asia/ui/styles.css";
import "./app.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
