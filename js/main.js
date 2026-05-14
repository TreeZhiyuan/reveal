document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const backToTop = document.querySelector(".back-to-top");
  const navbarCollapse = document.getElementById("navbarReveal");
  const navLinks = Array.from(
    document.querySelectorAll("#navbarReveal .nav-link.scrollto")
  );
  const scrollLinks = Array.from(document.querySelectorAll('a.scrollto[href^="#"]'));
  const sectionAnchors = [
    { id: "body", element: document.body },
    ...Array.from(document.querySelectorAll("main section[id]")).map((section) => ({
      id: section.id,
      element: section,
    })),
  ];
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const getHeaderOffset = () => {
    if (!header) {
      return 0;
    }

    return header.getBoundingClientRect().height + 12;
  };

  const setActiveNav = () => {
    const currentPosition = window.scrollY + getHeaderOffset() + 24;
    let activeId = "body";

    for (const section of sectionAnchors) {
      if (section.id === "body") {
        continue;
      }

      if (currentPosition >= section.element.offsetTop) {
        activeId = section.id;
      }
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === `#${activeId}`);
    });
  };

  const updateScrollState = () => {
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 100);
    }

    if (header) {
      header.classList.toggle("header-scrolled", window.scrollY > 12);
    }

    setActiveNav();
  };

  const scrollToTarget = (target, behavior) => {
    const nextBehavior = behavior || (prefersReducedMotion ? "auto" : "smooth");
    const destination =
      target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

    window.scrollTo({
      top: Math.max(0, destination),
      behavior: nextBehavior,
    });
  };

  const closeMobileNav = () => {
    if (!navbarCollapse || !window.bootstrap?.Collapse) {
      return;
    }

    const collapse = window.bootstrap.Collapse.getOrCreateInstance(
      navbarCollapse,
      { toggle: false }
    );

    if (navbarCollapse.classList.contains("show")) {
      collapse.hide();
    }
  };

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = href ? document.querySelector(href) : null;

      if (!href || !href.startsWith("#") || !target) {
        return;
      }

      event.preventDefault();
      scrollToTarget(target);
      closeMobileNav();

      if (href === "#body") {
        history.replaceState(null, "", window.location.pathname);
      } else {
        history.replaceState(null, "", href);
      }
    });
  });

  if (backToTop) {
    backToTop.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", setActiveNav);

  window.addEventListener("load", () => {
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        scrollToTarget(target, "auto");
      }
    }
  });

  const revealItems = Array.from(document.querySelectorAll(".wow"));

  revealItems.forEach((item) => {
    const delay = item.getAttribute("data-wow-delay");
    if (delay) {
      item.style.setProperty("--reveal-delay", delay);
    }
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -48px 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  class ResponsiveCarousel {
    constructor(root) {
      this.root = root;
      this.items = Array.from(root.children);
      this.currentPage = 0;
      this.currentPerView = 1;
      this.intervalId = null;
      this.options = {
        autoplay: root.dataset.autoplay !== "false" && !prefersReducedMotion,
        interval: Number(root.dataset.interval || 5000),
        transition: root.dataset.transition || "slide",
        perView: {
          base: Number(root.dataset.perView || 1),
          md: Number(root.dataset.perViewMd || root.dataset.perView || 1),
          lg: Number(root.dataset.perViewLg || root.dataset.perViewMd || root.dataset.perView || 1),
        },
      };

      this.track = document.createElement("div");
      this.track.className = "carousel-track";
      this.root.classList.add("is-enhanced");

      if (this.options.transition === "fade") {
        this.root.classList.add("is-fade");
      }

      this.root.innerHTML = "";
      this.root.appendChild(this.track);
      this.dots = document.createElement("div");
      this.dots.className = "carousel-dots";

      this.handleResize = this.handleResize.bind(this);
      this.next = this.next.bind(this);

      this.root.addEventListener("mouseenter", () => this.stopAutoplay());
      this.root.addEventListener("mouseleave", () => this.startAutoplay());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.stopAutoplay();
        } else {
          this.startAutoplay();
        }
      });

      this.buildPages();
      window.addEventListener("resize", this.handleResize);
    }

    resolvePerView() {
      if (window.innerWidth >= 992) {
        return this.options.perView.lg;
      }

      if (window.innerWidth >= 768) {
        return this.options.perView.md;
      }

      return this.options.perView.base;
    }

    buildPages() {
      const previousItemIndex = this.currentPage * this.currentPerView;
      const nextPerView = this.resolvePerView();

      this.currentPerView = nextPerView;
      this.root.style.setProperty("--items-per-view", String(nextPerView));
      this.track.innerHTML = "";

      const pages = [];

      for (let index = 0; index < this.items.length; index += nextPerView) {
        const page = document.createElement("div");
        page.className = "carousel-page";

        this.items.slice(index, index + nextPerView).forEach((item) => {
          page.appendChild(item);
        });

        this.track.appendChild(page);
        pages.push(page);
      }

      this.pages = pages;
      this.currentPage = Math.min(
        Math.floor(previousItemIndex / nextPerView),
        Math.max(pages.length - 1, 0)
      );

      this.renderDots();
      this.goTo(this.currentPage, false);
      this.startAutoplay();
    }

    renderDots() {
      this.dots.remove();

      if (this.pages.length <= 1) {
        return;
      }

      this.dots.innerHTML = "";

      this.pages.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.addEventListener("click", () => this.goTo(index));
        this.dots.appendChild(dot);
      });

      this.root.appendChild(this.dots);
    }

    goTo(index, restartAutoplay = true) {
      if (!this.pages.length) {
        return;
      }

      this.currentPage = index;

      if (this.options.transition === "fade") {
        this.pages.forEach((page, pageIndex) => {
          const isActive = pageIndex === index;
          page.classList.toggle("active", isActive);
          page.setAttribute("aria-hidden", String(!isActive));
        });
      } else {
        this.track.style.transform = `translateX(-${index * 100}%)`;
        this.pages.forEach((page, pageIndex) => {
          page.setAttribute("aria-hidden", String(pageIndex !== index));
        });
      }

      Array.from(this.dots.children).forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });

      if (restartAutoplay) {
        this.startAutoplay();
      }
    }

    next() {
      if (this.pages.length <= 1) {
        return;
      }

      const nextIndex = (this.currentPage + 1) % this.pages.length;
      this.goTo(nextIndex, false);
    }

    startAutoplay() {
      this.stopAutoplay();

      if (!this.options.autoplay || this.pages.length <= 1 || document.hidden) {
        return;
      }

      this.intervalId = window.setInterval(this.next, this.options.interval);
    }

    stopAutoplay() {
      if (this.intervalId) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }

    handleResize() {
      const nextPerView = this.resolvePerView();
      if (nextPerView !== this.currentPerView) {
        this.buildPages();
      }
    }
  }

  document
    .querySelectorAll("[data-carousel]")
    .forEach((carouselRoot) => new ResponsiveCarousel(carouselRoot));

  const portfolioModalElement = document.getElementById("portfolioLightbox");
  const portfolioImage = document.getElementById("portfolioLightboxImage");
  const portfolioCaption = document.getElementById("portfolioLightboxCaption");

  if (portfolioModalElement && portfolioImage && portfolioCaption && window.bootstrap?.Modal) {
    const portfolioModal = new window.bootstrap.Modal(portfolioModalElement);

    document.querySelectorAll(".portfolio-popup").forEach((link) => {
      link.addEventListener("click", (event) => {
        const imageUrl = link.getAttribute("href");
        const title = link.querySelector(".portfolio-info h2")?.textContent?.trim() || "";
        const imageAlt = link.querySelector("img")?.alt || title;

        if (!imageUrl) {
          return;
        }

        event.preventDefault();
        portfolioImage.src = imageUrl;
        portfolioImage.alt = imageAlt;
        portfolioCaption.textContent = title;
        portfolioModal.show();
      });
    });

    portfolioModalElement.addEventListener("hidden.bs.modal", () => {
      portfolioImage.removeAttribute("src");
      portfolioImage.alt = "";
      portfolioCaption.textContent = "";
    });
  }

  const contactForm = document.querySelector(".contactForm");

  if (contactForm) {
    const successMessage = document.getElementById("sendmessage");
    const errorMessage = document.getElementById("errormessage");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const emailExpression = /^[^\s()<>@,;:/]+@\w[\w.-]+\.[a-z]{2,}$/i;

    const showStatus = (element, message) => {
      if (!element) {
        return;
      }

      element.textContent = message;
      element.classList.add("is-visible");
    };

    const hideStatuses = () => {
      successMessage?.classList.remove("is-visible");
      errorMessage?.classList.remove("is-visible");
    };

    const validateField = (field) => {
      const value = field.value.trim();
      const validation = field.parentElement?.querySelector(".validation");
      let message = "";

      if (field.required && !value) {
        message = field.dataset.msg || "This field is required.";
      } else if (field.type === "email" && value && !emailExpression.test(value)) {
        message = field.dataset.msg || "Please enter a valid email address.";
      } else if (field.minLength > 0 && value && value.length < field.minLength) {
        message =
          field.dataset.msg ||
          `Please enter at least ${field.minLength} characters.`;
      } else if (field.dataset.rule) {
        const [rule, ruleValue] = field.dataset.rule.split(":");

        if (rule === "regexp" && ruleValue) {
          const expression = new RegExp(ruleValue);
          if (value && !expression.test(value)) {
            message = field.dataset.msg || "Please review this field.";
          }
        }
      }

      field.classList.toggle("is-invalid", Boolean(message));
      field.setAttribute("aria-invalid", String(Boolean(message)));

      if (validation) {
        validation.textContent = message;
        validation.classList.toggle("is-visible", Boolean(message));
      }

      return message;
    };

    const resetFieldState = (field) => {
      const validation = field.parentElement?.querySelector(".validation");
      field.classList.remove("is-invalid");
      field.setAttribute("aria-invalid", "false");

      if (validation) {
        validation.textContent = "";
        validation.classList.remove("is-visible");
      }
    };

    const fields = Array.from(
      contactForm.querySelectorAll("input, textarea")
    );

    fields.forEach((field) => {
      field.addEventListener("input", () => {
        hideStatuses();
        if (field.classList.contains("is-invalid")) {
          validateField(field);
        } else {
          resetFieldState(field);
        }
      });

      field.addEventListener("blur", () => validateField(field));
    });

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideStatuses();

      const errors = fields.map(validateField).filter(Boolean);

      if (errors.length) {
        showStatus(
          errorMessage,
          "Please correct the highlighted fields and try again."
        );
        return;
      }

      const endpoint =
        contactForm.dataset.endpoint?.trim() ||
        contactForm.getAttribute("action")?.trim();

      if (!endpoint || endpoint === "#") {
        showStatus(
          successMessage,
          "Validation passed. Add a value to data-endpoint to connect this form to your backend."
        );
        return;
      }

      const originalLabel = submitButton?.textContent || "Send Message";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      try {
        const response = await fetch(endpoint, {
          method: contactForm.getAttribute("method") || "POST",
          body: new FormData(contactForm),
          headers: {
            Accept: "application/json",
          },
        });

        const contentType = response.headers.get("content-type") || "";
        let payload = {};

        if (contentType.includes("application/json")) {
          payload = await response.json();
        } else {
          payload = { message: (await response.text()).trim() };
        }

        if (!response.ok) {
          throw new Error(
            payload.message || "Unable to send your message right now."
          );
        }

        const successCopy =
          payload.message && payload.message.toUpperCase() !== "OK"
            ? payload.message
            : "Your message has been sent. Thank you!";

        showStatus(successMessage, successCopy);
        contactForm.reset();
        fields.forEach(resetFieldState);
      } catch (error) {
        showStatus(
          errorMessage,
          error instanceof Error && error.message
            ? error.message
            : "Unable to send your message right now."
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalLabel;
        }
      }
    });
  }
});
