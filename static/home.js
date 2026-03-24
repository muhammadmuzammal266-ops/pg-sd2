document.addEventListener("DOMContentLoaded", function () {

  // ✅ IMAGE SLIDES (NOT gradients anymore)
  const slideThemes = {
    home: [
      "url('/images/about-hero.jpg')",
      
    ],
    action: [
      "url('/images/action1.jpg')",
      "url('/images/action2.jpg')",
      "url('/images/action3.jpg')"
    ],
    strategy: [
      "url('/images/strategy1.jpg')",
      "url('/images/strategy2.jpg')",
      "url('/images/strategy3.jpg')"
    ],
    racing: [
      "url('/images/racing1.jpg')",
      "url('/images/racing2.jpg')",
      "url('/images/racing3.jpg')"
    ],
    survival: [
      "url('/images/survival1.jpg')",
      "url('/images/survival2.jpg')",
      "url('/images/survival3.jpg')"
    ]
  };

  // ✅ AUTO IMAGE SLIDER
  document.querySelectorAll(".auto-slide").forEach((card) => {
    const theme = card.dataset.theme;
    const slides = slideThemes[theme] || slideThemes.home;
    let index = 0;

    function rotate() {
      card.style.backgroundImage = slides[index];
      card.style.backgroundSize = "cover";
      card.style.backgroundPosition = "center";
      index = (index + 1) % slides.length;
    }

    rotate();
    setInterval(rotate, 3000);
  });

  // ✅ DARK MODE
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

  // ✅ MENU DROPDOWN
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