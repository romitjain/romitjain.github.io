document.addEventListener("DOMContentLoaded", () => {
  const mermaidApi = window.mermaid;
  if (!mermaidApi || typeof mermaidApi.initialize !== "function") return;

  const saved = localStorage.getItem("theme");
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved === "dark" || (!saved && systemDark);
  const theme = isDark ? "dark" : "default";

  mermaidApi.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme,
  });

  const mermaidBlocks = document.querySelectorAll(
    "pre > code.language-mermaid, code.language-mermaid"
  );

  mermaidBlocks.forEach(code => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("mermaid");
    const src = code.textContent.trim();
    wrapper.textContent = src;
    // Store original source so theme toggle can re-render
    wrapper.setAttribute("data-src", src);

    const parentPre = code.closest("pre");
    if (parentPre) {
      parentPre.replaceWith(wrapper);
    } else {
      code.replaceWith(wrapper);
    }
  });

  if (document.querySelector(".mermaid")) {
    mermaidApi.run({ querySelector: ".mermaid" });
  }
});
