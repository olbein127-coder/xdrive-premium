const header = document.querySelector(".site-header");
    const menuBtn = document.querySelector("#menuBtn");
    const nav = document.querySelector("#nav");
    const revealItems = document.querySelectorAll(".reveal");
    const bookingModal = document.querySelector("#bookingModal");
    const bookingForm = document.querySelector("#bookingForm");
    const bookingStatus = document.querySelector("#bookingStatus");
    const bookingOpeners = document.querySelectorAll("[data-booking-open]");
    const bookingClosers = document.querySelectorAll("[data-booking-close]");

    function updateHeader() {
      header.classList.toggle("scrolled", window.scrollY > 24);
    }

    menuBtn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuBtn.classList.toggle("open", isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("locked", isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuBtn.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        document.body.classList.remove("locked");
      });
    });

    function openBooking(event) {
      if (event) event.preventDefault();
      nav.classList.remove("open");
      menuBtn.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      bookingModal.classList.add("open");
      bookingModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("locked");
      window.setTimeout(() => document.querySelector("#clientName").focus(), 120);
    }

    function closeBooking() {
      bookingModal.classList.remove("open");
      bookingModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("locked");
    }

    function buildTelegramDraft(formData) {
      return [
        "Нова заявка X-drive",
        `Ім'я: ${formData.get("clientName")}`,
        `Телефон: ${formData.get("clientPhone")}`,
        `Комплект: ${formData.get("gearType")}`,
        `Локація: ${formData.get("locationChoice")}`,
        `Дата: ${formData.get("rentalDate")}`,
        `Термін: ${formData.get("rentalDays")}`,
        `Коментар: ${formData.get("bookingComment") || "немає"}`
      ].join("\n");
    }

    bookingOpeners.forEach((opener) => opener.addEventListener("click", openBooking));
    bookingClosers.forEach((closer) => closer.addEventListener("click", closeBooking));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && bookingModal.classList.contains("open")) {
        closeBooking();
      }
    });

    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(bookingForm);
      const payload = Object.fromEntries(formData.entries());
      const telegramDraft = buildTelegramDraft(formData);

      console.info(telegramDraft);

      bookingStatus.textContent = "Відправляємо заявку...";
      bookingStatus.classList.add("show");

      fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((response) => response.json().then((data) => ({ response, data })))
        .then(({ response, data }) => {
          if (!response.ok || !data.ok) {
            throw new Error(data.error || "Не вдалося відправити заявку.");
          }

          bookingStatus.textContent = "Заявку відправлено. Менеджер X-drive отримає її в Telegram.";
          bookingForm.reset();
        })
        .catch((error) => {
          bookingStatus.textContent = `Заявку не відправлено: ${error.message}`;
        });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    revealItems.forEach((item) => observer.observe(item));
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
