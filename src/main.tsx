import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App";
import "./styles/index.css";
import OpusHealth from "./OpusHealth";
const health = new OpusHealth("landing_page");
health.start();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
