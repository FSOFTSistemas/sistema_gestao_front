import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CaixaProvider } from "./contexts/CaixaContextWeb";
import { PDVProvider } from "./contexts/PDVContextWeb";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CaixaProvider>
      <PDVProvider>
        <App />
      </PDVProvider>
    </CaixaProvider>
  </StrictMode>
);
