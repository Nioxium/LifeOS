import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { SmoothScroll } from "./components/smooth-scroll";
import { App } from "./app";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScroll />
      <App />
    </BrowserRouter>
  </StrictMode>,
);
