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

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 921px)").matches) closeMenu();
  });
}

const sectionLinks = navigation
  ? Array.from(navigation.querySelectorAll('a[href^="#"]'))
      .map((link) => ({
        link,
        section: document.querySelector(link.getAttribute("href")),
      }))
      .filter(({ section }) => section instanceof HTMLElement)
  : [];

function updateActiveNavigation() {
  const activationLine =
    (document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0) +
    window.innerHeight * 0.28;
  let activeLink = null;

  sectionLinks.forEach(({ link, section }) => {
    if (section.getBoundingClientRect().top <= activationLine) {
      activeLink = link;
    }
  });

  sectionLinks.forEach(({ link }) => {
    if (link === activeLink) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let navigationUpdateQueued = false;
function queueNavigationUpdate() {
  if (navigationUpdateQueued) return;
  navigationUpdateQueued = true;
  window.requestAnimationFrame(() => {
    updateActiveNavigation();
    navigationUpdateQueued = false;
  });
}

if (sectionLinks.length > 0) {
  updateActiveNavigation();
  window.addEventListener("scroll", queueNavigationUpdate, { passive: true });
  window.addEventListener("resize", queueNavigationUpdate);
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const revealElements = document.querySelectorAll("[data-reveal]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  document.documentElement.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -48px 0px", threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const requestForm = document.querySelector("#request-form");
const feedback = document.querySelector("#form-feedback");

if (requestForm instanceof HTMLFormElement && feedback instanceof HTMLElement) {
  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "";

    if (!requestForm.reportValidity()) return;

    const formData = new FormData(requestForm);
    const getValue = (name) => {
      const value = formData.get(name);
      return typeof value === "string" ? value.trim() : "";
    };
    const name = getValue("name");
    const contact = getValue("contact");
    const download = getValue("download");
    const size = getValue("size");

    if (!name || !contact || !download || !size) {
      feedback.textContent = "Please provide your name, contact details, download name and approximate file size.";
      return;
    }

    const link = getValue("link");
    const notes = getValue("notes");
    const message = [
      `Hi, my name is ${name}, and the best way to reach me is through ${contact}.`,
      "",
      `I would like to get ${download}.`,
      `Approximate file size: ${size}.`,
      `File link: ${link || "Not provided"}`,
      ...(notes ? [`Additional details: ${notes}`] : []),
    ].join("\n");
    const telegramUrl = `https://t.me/DownloadaNG?text=${encodeURIComponent(message)}`;
    const telegramWindow = window.open(telegramUrl, "_blank");

    if (telegramWindow) {
      telegramWindow.opener = null;
      feedback.textContent = "Your request is ready in Telegram. Review it and tap Send to submit.";
      return;
    }

    feedback.replaceChildren(
      document.createTextNode("Telegram was blocked from opening. "),
    );
    const telegramLink = document.createElement("a");
    telegramLink.href = telegramUrl;
    telegramLink.target = "_blank";
    telegramLink.rel = "noopener noreferrer";
    telegramLink.textContent = "Open your prepared request in Telegram";
    feedback.append(telegramLink);
  });
}
