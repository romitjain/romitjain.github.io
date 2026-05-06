document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("toc-container");
  if (!container) return;
  if (document.getElementById("markdown-toc")) return;

  const article = document.querySelector("article");
  if (!article) return;

  const headings = article.querySelectorAll("h2, h3");
  if (headings.length < 2) return;

  headings.forEach((h, i) => { if (!h.id) h.id = "heading-" + i; });

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "contents";
  details.appendChild(summary);

  const ul = document.createElement("ul");
  headings.forEach(h => {
    const li = document.createElement("li");
    if (h.tagName === "H3") li.classList.add("toc-h3");
    const a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    ul.appendChild(li);
  });

  details.appendChild(ul);
  container.appendChild(details);
});
