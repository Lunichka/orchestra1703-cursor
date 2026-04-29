/**
 * Main JavaScript (vanilla).
 * Toggles mobile menu open/close.
 */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var burgerBtn = document.querySelector(".burger-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  var closeBtn = document.querySelector(".mobile-menu-close");
  var mobileLinks = document.querySelectorAll(".mobile-nav a");

  function openMenu() {
    header.classList.add("is-menu-open");
    document.body.classList.add("is-menu-open");
    if (burgerBtn) burgerBtn.setAttribute("aria-expanded", "true");
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    header.classList.remove("is-menu-open");
    document.body.classList.remove("is-menu-open");
    if (burgerBtn) burgerBtn.setAttribute("aria-expanded", "false");
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", "true");
  }

  if (burgerBtn) {
    burgerBtn.addEventListener("click", function () {
      if (header.classList.contains("is-menu-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
})();

// ===============================
// Media gallery logic
// ===============================

// ===============================
// Media gallery logic
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  var featuredImage = document.querySelector(".featured-media-img");
  var thumbnails = document.querySelectorAll(".media-thumb");
  var dots = document.querySelectorAll(".dot");
  var featuredTitle = document.querySelector(".featured-media-title");
  var featuredSubtitle = document.querySelector(".featured-media-subtitle");
  var leftArrow = document.querySelector(".media-arrow-left");
  var rightArrow = document.querySelector(".media-arrow-right");

  if (!featuredImage || thumbnails.length === 0) return;

  var currentIndex = 0;

  function updateSlide(index) {

    var thumb = thumbnails[index];

    featuredImage.style.opacity = 0;

    setTimeout(function () {
      featuredImage.src = thumb.src;
      featuredTitle.textContent = thumb.dataset.title;
      featuredSubtitle.textContent = thumb.dataset.subtitle;
      featuredImage.style.opacity = 1;
    }, 150);

    thumbnails.forEach(function (t) {
      t.classList.remove("active");
    });

    dots.forEach(function (dot) {
      dot.classList.remove("active");
    });

    thumb.classList.add("active");

    if (dots[index]) {
      dots[index].classList.add("active");
    }

    currentIndex = index;
  }

  thumbnails.forEach(function (thumb, index) {
    thumb.addEventListener("click", function () {
      updateSlide(index);
    });
  });

  if (rightArrow) {
    rightArrow.addEventListener("click", function () {
      var next = (currentIndex + 1) % thumbnails.length;
      updateSlide(next);
    });
  }

  if (leftArrow) {
    leftArrow.addEventListener("click", function () {
      var prev = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
      updateSlide(prev);
    });
  }

});

// =====================================
// Events page logic
// =====================================

(function () {
  "use strict";

  var eventsData = {
    "02.2025": [
      {
        date: "20 ФЕВРАЛЯ",
        time: "19:00",
        title: "СКАЗОЧНЫЙ МИР РУССКОЙ КЛАССИКИ",
        image: "images/GrigoriyFedorovIgraet.jpg"
      },
      {
        date: "28 ФЕВРАЛЯ",
        time: "20:00",
        title: "АЛИСА В СТРАНЕ ЧУДЕС",
        image: "images/aliceinwonderlandNH.jpg"
      }
    ],
    "03.2025": [
      {
        date: "6 МАРТА",
        time: "19:00",
        title: "АЛЫЕ ПАРУСА",
        image: "images/NyagaNewHolland.jpg"
      },
      {
        date: "12 МАРТА",
        time: "20:00",
        title: "ЛУННЫЙ СВЕТ",
        image: "images/GrigoriyFedorovIgraet.jpg"
      },
      {
        date: "20 МАРТА",
        time: "19:00",
        title: "МУЗЫКА ИЗ КИНО",
        image: "images/aliceinwonderlandNH.jpg"
      }
    ]
  };

  var currentMonth = "03.2025";
  var visibleCount = 2;

  var eventsContainer = document.getElementById("eventsContainer");
  var loadMoreBtn = document.getElementById("loadMoreBtn");
  var prevMonthBtn = document.getElementById("prevMonth");
  var nextMonthBtn = document.getElementById("nextMonth");
  var currentMonthLabel = document.getElementById("currentMonth");

  if (!eventsContainer || !loadMoreBtn || !prevMonthBtn || !nextMonthBtn || !currentMonthLabel) {
    return;
  }

  function getSortedMonths() {
    return Object.keys(eventsData).sort(function (a, b) {
      var aParts = a.split(".");
      var bParts = b.split(".");
      var aMonth = parseInt(aParts[0], 10);
      var aYear = parseInt(aParts[1], 10);
      var bMonth = parseInt(bParts[0], 10);
      var bYear = parseInt(bParts[1], 10);

      if (aYear !== bYear) {
        return aYear - bYear;
      }

      return aMonth - bMonth;
    });
  }

  function getNextMonth(month) {
    var months = getSortedMonths();
    var index = months.indexOf(month);
    return index === -1 ? null : months[index + 1] || null;
  }

  function getPrevMonth(month) {
    var months = getSortedMonths();
    var index = months.indexOf(month);
    return index === -1 ? null : months[index - 1] || null;
  }

  function renderEvents() {
    eventsContainer.innerHTML = "";

    var events = eventsData[currentMonth] || [];

    events.slice(0, visibleCount).forEach(function (event) {
      var li = document.createElement("li");
      li.className = "concert-card";

      li.innerHTML = `
        <div class="concert-card-thumb">
          <span class="photo-halftone">
            <img src="${event.image}" alt="${event.title}">
          </span>
        </div>

        <div class="concert-card-content">
          <p class="concert-card-meta">
            <span class="concert-date">${event.date}</span>
            <span class="concert-time">${event.time}</span>
          </p>
          <h3 class="concert-card-title">${event.title}</h3>
        </div>

        <div class="concert-card-actions">
          <a href="#" class="btn btn-secondary btn-card">Подробнее</a>
          <a href="#" class="btn btn-primary btn-card">Купить билеты</a>
        </div>
      `;

      eventsContainer.appendChild(li);
    });

    // обновляем текст месяца
    currentMonthLabel.textContent = currentMonth;

    // кнопка "Еще"
    if (visibleCount >= events.length) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-block";
    }

    // блокировка стрелок
    var hasNext = !!eventsData[getNextMonth(currentMonth)];
    var hasPrev = !!eventsData[getPrevMonth(currentMonth)];

    nextMonthBtn.disabled = !hasNext;
    prevMonthBtn.disabled = !hasPrev;
  }

  loadMoreBtn.addEventListener("click", function () {
    visibleCount += 2;
    renderEvents();
  });

  prevMonthBtn.addEventListener("click", function () {
    var prev = getPrevMonth(currentMonth);
    if (!prev) return;

    currentMonth = prev;
    visibleCount = 2;
    renderEvents();
  });

  nextMonthBtn.addEventListener("click", function () {
    var next = getNextMonth(currentMonth);
    if (!next) return;

    currentMonth = next;
    visibleCount = 2;
    renderEvents();
  });

  renderEvents();
})();

// =====================================
// Brand motion (GSAP): reveals + parallax
// =====================================
(function () {
  function safeInitGsap() {
    if (!window.gsap || !window.ScrollTrigger) return false;
    if (safeInitGsap._done) return true;
    safeInitGsap._done = true;

    window.gsap.registerPlugin(window.ScrollTrigger);

    // Entrance animations for marked elements
    window.gsap.utils.toArray(".reveal").forEach(function (el, index) {
      window.gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: index * 0.03,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Parallax: move decorative layers with scroll
    window.gsap.utils.toArray(".parallax-layer").forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute("data-parallax-speed") || "0.18");
      if (isNaN(speed)) speed = 0.18;

      window.gsap.to(layer, {
        y: -220 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: layer,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return true;
  }

  // If GSAP is loaded later (CDN), wait briefly.
  var attempts = 0;
  var timer = window.setInterval(function () {
    attempts += 1;
    if (safeInitGsap()) window.clearInterval(timer);
    if (attempts > 30) window.clearInterval(timer);
  }, 100);
})();
