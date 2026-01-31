import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const BUILD = import.meta.env.VITE_BUILD_ID || "no-build-id";

function bootBox() {
  let el = document.getElementById("abqd-boot");
  if (!el) {
    el = document.createElement("pre");
    el.id = "abqd-boot";
    el.style.cssText =
      "position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483647;" +
      "background:rgba(0,0,0,.86);color:#fff;padding:12px 14px;border-radius:14px;" +
      "font-size:12px;line-height:1.35;white-space:pre-wrap;max-height:40vh;overflow:auto;" +
      "box-shadow:0 14px 40px rgba(0,0,0,.35)";
    document.body.appendChild(el);
  }
  return el;
}

function log(msg) {
  const el = bootBox();
  el.textContent = msg + "\n" + el.textContent;
}

window.addEventListener("error", (e) => {
  log(
    "JS ERROR: " + e.message + "\n" +
    (e.filename || "") + ":" + e.lineno + ":" + e.colno + "\n" +
    (e.error && e.error.stack ? e.error.stack : "")
  );
});

window.addEventListener("unhandledrejection", (e) => {
  const r = e.reason;
  log("UNHANDLED REJECTION: " + (r && r.stack ? r.stack : String(r)));
});

try {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("No #root element in DOM");

  log("BOOT: start build=" + BUILD + " url=" + location.href);

  createRoot(rootEl).render(<App />);
  window.__ABQD_MOUNTED = true;

  setTimeout(() => {
    if (rootEl.childNodes.length === 0) {
      log("BOOT: render called, but #root STILL empty → crash BEFORE mount or bundle not executed");
    } else {
      log("BOOT: #root has nodes ✓");
    }
  }, 1200);
} catch (e) {
  log("BOOT CRASH: " + (e && e.stack ? e.stack : String(e)));
  throw e;
}
