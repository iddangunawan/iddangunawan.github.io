const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const mobile = window.matchMedia("(max-width: 767px)");
const closeMenu = () => menu.setAttribute("aria-expanded", "false");
menu.hidden = !mobile.matches;
mobile.addEventListener("change", () => {
  menu.hidden = !mobile.matches;
  closeMenu();
});
menu.addEventListener("click", () =>
  menu.setAttribute(
    "aria-expanded",
    String(menu.getAttribute("aria-expanded") !== "true"),
  ),
);
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});

const filters = document.querySelector(".filters");
if (filters) {
  filters.hidden = false;
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filters.querySelectorAll("button").forEach((item) => {
      const selected = item === button;
      item.setAttribute("aria-pressed", String(selected));
      item.classList.toggle("selected", selected);
    });
    let count = 0;
    document.querySelectorAll(".project-card").forEach((card) => {
      card.hidden =
        button.dataset.filter !== "All" &&
        card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.querySelector("#filter-status").textContent =
      `${count} ${count === 1 ? "project" : "projects"} shown. ${button.dataset.filter}.`;
  });
}
const copyEmail = document.querySelector(".copy-email");
if (copyEmail)
  copyEmail.addEventListener("click", async () => {
    const status = document.querySelector(".copy-status");
    try {
      await navigator.clipboard.writeText(copyEmail.dataset.email);
      status.textContent = "Email copied. Say hello!";
    } catch {
      status.textContent = `Couldn’t copy automatically. Email: ${copyEmail.dataset.email}`;
    }
  });
document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        nav.querySelectorAll("a").forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
  );
  document
    .querySelectorAll("#work, #about, #writing, #contact")
    .forEach((section) => observer.observe(section));
}

const gallery = document.querySelector(".gallery-grid");
if (
  gallery &&
  typeof HTMLDialogElement !== "undefined" &&
  typeof HTMLDialogElement.prototype.showModal === "function"
) {
  const dialog = document.createElement("dialog");
  dialog.className = "image-dialog";
  dialog.setAttribute("aria-label", "Project image preview");
  dialog.innerHTML =
    '<form method="dialog"><button autofocus>Close ×</button></form><img alt="">';
  document.body.append(dialog);
  const preview = dialog.querySelector("img");
  gallery
    .querySelectorAll("[data-gallery-image]")
    .forEach((link) => link.setAttribute("aria-haspopup", "dialog"));
  gallery.addEventListener("click", (event) => {
    const link = event.target.closest("[data-gallery-image]");
    if (
      !link ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    preview.src = link.href;
    preview.alt = link.querySelector("img").alt;
    dialog.showModal();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
}
