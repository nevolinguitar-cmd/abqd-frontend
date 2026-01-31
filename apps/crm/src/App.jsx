import React, { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import CrmApp from "./pages/CrmApp";
import "./App.css";

export default function App() {
  const BUILD = import.meta.env.VITE_BUILD_ID || "no-build-id";

  useEffect(() => {
    document.documentElement.setAttribute("data-build", BUILD);
    document.title = "CRM • " + BUILD;
    window.__ABQD_BUILD = BUILD;
  }, [BUILD]);

  return (
    <>

  {/* ABQD_TEST_BADGE */}
  <div style={{
    position:"fixed", right:12, top:12, zIndex:2147483647,
    background:"rgba(0,180,255,.92)", color:"#001",
    padding:"14px 16px", borderRadius:14,
    fontSize:18, fontWeight:900,
    boxShadow:"0 14px 40px rgba(0,0,0,.35)",
    pointerEvents:"none"
  }}>
    CRM TEST BADGE ✓
  </div>

      <div
        id="abqd-react-badge"
        style={{
          position: "fixed",
          left: 12,
          top: 12,
          zIndex: 2147483647,
          background: "rgba(255,0,80,.92)",
          color: "#fff",
          padding: "10px 12px",
          borderRadius: 12,
          fontSize: 13,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
          letterSpacing: 0.2,
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          pointerEvents: "none",
        }}
      >
        react build {BUILD}
      </div>

      <div
        id="abqd-react-mounted"
        style={{
          position: "fixed",
          right: 12,
          top: 12,
          zIndex: 2147483647,
          background: "rgba(0,0,0,.65)",
          color: "#fff",
          padding: "8px 10px",
          borderRadius: 10,
          fontSize: 12,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          pointerEvents: "none",
        }}
      >
        react-mounted ✓
      </div>

      <HashRouter>
        <Routes>
          <Route path="/" element={<CrmApp />} />
        </Routes>
      </HashRouter>
    </>
  );
}
