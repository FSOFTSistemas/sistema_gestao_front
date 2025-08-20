import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CaixaProvider } from "./contexts/CaixaContextWeb";
import { PDVProvider } from "./contexts/PDVContextWeb";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CaixaProvider>
        <PDVProvider>
          <App />
        </PDVProvider>
      </CaixaProvider>
    </AuthProvider>
  </StrictMode>
);
