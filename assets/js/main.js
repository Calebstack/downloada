const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

function closeMenu() {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu",
    );
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const requestForm = document.querySelector("#request-form");
const feedback = document.querySelector("#form-feedback");

if (requestForm instanceof HTMLFormElement && feedback instanceof HTMLElement) {
  requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";

    if (!requestForm.reportValidity()) return;

    const formData = new FormData(requestForm);
    const fields = [
      ["Name", formData.get("name")],
      ["Contact", formData.get("contact")],
      ["Download", formData.get("download")],
      ["Approximate size", formData.get("size")],
      ["File link", formData.get("link")],
      ["Additional details", formData.get("notes")],
    ];
    const message = [
      "Downloada download request",
      "",
      ...fields
        .filter(([, value]) => typeof value === "string" && value.trim())
        .map(([label, value]) => `${label}: ${value.trim()}`),
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "Downloada download request", text: message });
        feedback.textContent = "Your message was shared using your device. Contact details can be connected here before launch.";
        return;
      }
      if (!navigator.clipboard) {
        throw new Error("Sharing and clipboard access are unavailable in this browser.");
      }
      await navigator.clipboard.writeText(message);
      feedback.textContent = "Your request has been copied. Paste it into a message for Downloada.";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      feedback.textContent = "We couldn’t prepare your request on this device. Please try again or contact us directly.";
      console.error("Unable to prepare the download request.", error);
    }
  });
}
