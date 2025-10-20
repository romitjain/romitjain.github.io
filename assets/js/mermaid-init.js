document.addEventListener("DOMContentLoaded", () => {
  const mermaidApi = window.mermaid;
  if (!mermaidApi || typeof mermaidApi.initialize !== "function") return;

  const appearance = document.body.getAttribute("a");
  let theme = "default";
  if (appearance === "dark") {
    theme = "dark";
  } else if (appearance !== "light") {
    const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = systemPrefersDark ? "dark" : "default";
  }

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
    wrapper.textContent = code.textContent.trim();

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
