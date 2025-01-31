const menuButton = document.querySelector(".menu-button");
const menuClose = document.querySelector(".menu-close");
const navContainer = document.querySelector(".nav-container");
const overlay = document.querySelector(".overlay");

function openMenu() {
  navContainer.classList.add("active");
  overlay.classList.add("active");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.style.display = "none"; // Hide menu button
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  navContainer.classList.remove("active");
  overlay.classList.remove("active");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.style.display = "block"; // Show menu button
  document.body.style.overflow = "";
}

menuButton.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

// Close menu on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
  }
});

// Handle focus trap within menu
const focusableElements = navContainer.querySelectorAll(
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
);
const firstFocusable = focusableElements[0];
const lastFocusable = focusableElements[focusableElements.length - 1];

function handleTabKey(e) {
  if (e.key === "Tab") {
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }
}

navContainer.addEventListener("keydown", handleTabKey);
