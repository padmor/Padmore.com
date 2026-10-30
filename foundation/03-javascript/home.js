// Plain browser JavaScript foundation — no framework required.
const emailForm = document.querySelector("#contact form");

emailForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = emailForm.querySelector('input[type="email"]');
  if (!(input instanceof HTMLInputElement) || !input.checkValidity()) {
    input?.reportValidity();
    return;
  }
  // This foundation example validates locally; it does not transmit personal data.
  const notice = document.createElement("p");
  notice.setAttribute("role", "status");
  notice.textContent = "Your message form is valid. Connect a secure backend to send it.";
  emailForm.replaceWith(notice);
});
