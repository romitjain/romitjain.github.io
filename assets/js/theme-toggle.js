document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    // Keep body[a] in sync for mermaid-init.js
    document.body.setAttribute("a", dark ? "dark" : "light");
    btn.textContent = dark ? "[light]" : "[dark]";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  // Sync button label with whatever the inline <head> script already applied
  btn.textContent = isDark() ? "[light]" : "[dark]";
  // Also sync body[a] for mermaid
  document.body.setAttribute("a", isDark() ? "dark" : "light");

  btn.addEventListener("click", () => {
    var nextDark = !isDark();
    applyTheme(nextDark);
    reinitMermaid(nextDark ? "dark" : "default");
  });

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        applyTheme(e.matches);
      }
    });
  }
});

function reinitMermaid(theme) {
  var mermaidApi = window.mermaid;
  if (!mermaidApi || typeof mermaidApi.initialize !== "function") return;

  mermaidApi.initialize({ startOnLoad: false, securityLevel: "loose", theme });

  document.querySelectorAll(".mermaid").forEach(function(div) {
    var src = div.getAttribute("data-src");
    if (src) {
      div.removeAttribute("data-processed");
      div.textContent = src;
    }
  });

  if (document.querySelector(".mermaid")) {
    mermaidApi.run({ querySelector: ".mermaid" });
  }
}
