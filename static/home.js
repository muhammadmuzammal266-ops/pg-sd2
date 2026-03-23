document.addEventListener("DOMContentLoaded", function () {
  const slideThemes = {
    home: [
      "linear-gradient(135deg, #2563eb, #7c3aed)",
      "linear-gradient(135deg, #0ea5e9, #2563eb)",
      "linear-gradient(135deg, #8b5cf6, #ec4899)"
    ],
    action: [
      "linear-gradient(135deg, #ef4444, #f97316)",
      "linear-gradient(135deg, #dc2626, #fb7185)",
      "linear-gradient(135deg, #f97316, #eab308)"
    ],
    strategy: [
      "linear-gradient(135deg, #2563eb, #06b6d4)",
      "linear-gradient(135deg, #1d4ed8, #0ea5e9)",
      "linear-gradient(135deg, #3b82f6, #14b8a6)"
    ],
    racing: [
      "linear-gradient(135deg, #111827, #ef4444)",
      "linear-gradient(135deg, #1f2937, #f59e0b)",
      "linear-gradient(135deg, #0f172a, #3b82f6)"
    ]
  };

  document.querySelectorAll(".auto-slide").forEach((card) => {
    const theme = card.dataset.theme;
    const slides = slideThemes[theme] || slideThemes.home;
    let index = 0;

    function rotate() {
      card.style.background = slides[index];
      index = (index + 1) % slides.length;
    }

    rotate();
    setInterval(rotate, 3000);
  });

  const toggle = document.getElementById("themeToggle");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    if (toggle) toggle.checked = true;
  }

  if (toggle) {
    toggle.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark-theme");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-theme");
        localStorage.setItem("theme", "light");
      }
    });
  }

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      document.querySelectorAll(".menu-dropdown").forEach((menu) => {
        if (menu !== btn.nextElementSibling) {
          menu.classList.remove("show-menu");
        }
      });

      const menu = btn.nextElementSibling;
      if (menu) menu.classList.toggle("show-menu");
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".menu-dropdown").forEach((menu) => {
      menu.classList.remove("show-menu");
    });
  });
});