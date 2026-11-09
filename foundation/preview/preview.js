const toggle = document.querySelector("#theme-toggle");
toggle?.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
});
const menuButton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#mobile-menu");
menuButton?.addEventListener("click", () => {
  if (!menu) return;
  menu.style.display = menu.style.display === "grid" ? "none" : "grid";
});
document.querySelector("#preview-newsletter")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const notice = document.createElement("p");
  notice.className = "form-notice";
  notice.textContent = "Form validated in preview mode. Newsletter delivery is not connected.";
  form.replaceWith(notice);
});
