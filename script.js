const header = document.querySelector(".site-header");

if (header) {
  window.addEventListener("scroll", () => {
    const hasScrolled = window.scrollY > 12;
    header.style.boxShadow = hasScrolled ? "0 10px 30px rgba(24, 32, 31, 0.08)" : "none";
  });
}
