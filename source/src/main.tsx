import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);

// Offline support and home-screen install (HTTPS only, e.g. GitHub Pages).
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js").catch(() => {}); });
}

/* ---------- New version check ----------
   An app opened from the home screen can be restored from memory without reloading.
   When it comes back to the foreground, compare the deployed bundle with the running one. */
const running = (document.querySelector('script[type="module"][src]') as HTMLScriptElement | null)?.src.split("/").pop();
async function checkForUpdate() {
  if (!running || location.protocol !== "https:") return;
  try {
    const html = await (await fetch("./index.html", { cache: "no-store" })).text();
    const deployed = html.match(/src="\.\/(index-[\w-]+\.js)"/)?.[1];
    if (deployed && deployed !== running) window.dispatchEvent(new Event("app-update"));
  } catch { /* offline */ }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") void checkForUpdate(); });
window.setTimeout(checkForUpdate, 4000);
