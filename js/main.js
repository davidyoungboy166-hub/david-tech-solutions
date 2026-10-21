/**
 * Tech Service & Portfolio Website - Modular Client-side Script
 * Architectural modules:
 * 1. ThemeController: Manages Dark/Light theme switching & persistence.
 * 2. FilterController: Handles category filtering on Services & Projects cards.
 * 3. ContactFormController: Handles validation (including strict email checking) and submission.
 * 4. ScrollController: Handles back-to-top floating button and smooth scrolling.
 */

// Reset scroll restoration so the browser does not jump down on page load
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
  // Reset URL hash and force scroll to top on clean reload if no specific anchor was clicked by user
  if (!window.location.hash || window.location.hash === '#contact') {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);
  }

  // Initialize Controllers
  ThemeController.init();
  FilterController.init();
  ContactFormController.init();
  ScrollController.init();
});

/* ==========================================================================
   1. Theme Controller
   ========================================================================== */
const ThemeController = (() => {
  const STORAGE_KEY = 'tech_portfolio_theme';
  const toggleBtn = document.getElementById('theme-toggle');
  const rootElement = document.documentElement;

  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme) {
      return savedTheme;
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme) => {
    rootElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', theme === 'dark');
      toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  };

  const toggleTheme = () => {
    const currentTheme = rootElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const init = () => {
    setTheme(getPreferredTheme());

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    // Listen for OS theme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  };

  return { init, toggleTheme };
})();

/* ==========================================================================
   2. Filter Controller
   ========================================================================== */
const FilterController = (() => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');

  const filterCards = (category) => {
    cards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      if (category === 'all' || cardCategory === category) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  const handleFilterClick = (event) => {
    const clickedBtn = event.currentTarget;
    const targetCategory = clickedBtn.getAttribute('data-filter');

    // Update active button state
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Apply filtering to cards
    filterCards(targetCategory);
  };

  const init = () => {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', handleFilterClick);
    });
  };

  return { init };
})();

/* ==========================================================================
   3. Contact Form Controller (Formspree Asynchronous Integration)
   ========================================================================== */
const ContactFormController = (() => {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const statusMessage = document.getElementById('form-status');
  const packageButtons = document.querySelectorAll('.package-btn');

  const setupPackagePrefill = () => {
    packageButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const packageName = btn.getAttribute('data-package');
        if (messageInput && packageName) {
          messageInput.value = `Hi David Tech Solutions, I would like to get started with the ${packageName} package. Here are my project details:\n`;
          messageInput.focus();
        }
      });
    });
  };

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  const showError = (inputElement, errorElementId, message) => {
    inputElement.classList.add('is-invalid');
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  };

  const clearError = (inputElement, errorElementId) => {
    inputElement.classList.remove('is-invalid');
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  };

  const validateEmail = () => {
    const value = emailInput.value.trim();
    if (!value) {
      showError(emailInput, 'email-error', 'Please enter your email address.');
      return false;
    }
    if (!emailRegex.test(value)) {
      showError(emailInput, 'email-error', 'Please enter a valid email address (e.g., name@domain.com).');
      return false;
    }
    clearError(emailInput, 'email-error');
    return true;
  };

  const validateName = () => {
    const value = nameInput.value.trim();
    if (!value) {
      showError(nameInput, 'name-error', 'Please enter your name.');
      return false;
    }
    clearError(nameInput, 'name-error');
    return true;
  };

  const validateMessage = () => {
    const value = messageInput.value.trim();
    if (!value) {
      showError(messageInput, 'message-error', 'Please write a message.');
      return false;
    }
    clearError(messageInput, 'message-error');
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (isNameValid && isEmailValid && isMessageValid) {
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Submit form data asynchronously to Formspree endpoint
      const formData = new FormData(form);

      fetch('https://formspree.io/f/mjygnoqz', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then((response) => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        if (response.ok) {
          // Display success banner
          if (statusMessage) {
            statusMessage.textContent = 'Thank you! Your message has been sent successfully. David Tech Solutions will get back to you shortly.';
            statusMessage.className = 'form-status success';
            statusMessage.style.display = 'block';
          }
          // Reset form inputs
          form.reset();

          // Clear status banner after 7 seconds
          setTimeout(() => {
            if (statusMessage) {
              statusMessage.style.display = 'none';
              statusMessage.className = 'form-status';
            }
          }, 7000);
        } else {
          response.json().then((data) => {
            if (statusMessage) {
              statusMessage.textContent = data.errors ? data.errors.map(err => err.message).join(', ') : 'Oops! There was a problem submitting your form. Please try again or WhatsApp us directly.';
              statusMessage.className = 'form-status error';
              statusMessage.style.display = 'block';
            }
          });
        }
      })
      .catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        if (statusMessage) {
          statusMessage.textContent = 'Network error. Please check your internet connection or use WhatsApp directly.';
          statusMessage.className = 'form-status error';
          statusMessage.style.display = 'block';
        }
      });
    }
  };

  const init = () => {
    if (!form) return;

    setupPackagePrefill();

    form.addEventListener('submit', handleSubmit);

    // Real-time validation feedback on blur and input
    if (emailInput) {
      emailInput.addEventListener('blur', validateEmail);
      emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('is-invalid')) {
          validateEmail();
        }
      });
    }

    if (nameInput) {
      nameInput.addEventListener('blur', validateName);
      nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('is-invalid')) {
          validateName();
        }
      });
    }

    if (messageInput) {
      messageInput.addEventListener('blur', validateMessage);
      messageInput.addEventListener('input', () => {
        if (messageInput.classList.contains('is-invalid')) {
          validateMessage();
        }
      });
    }
  };

  return { init };
})();

/* ==========================================================================
   4. Scroll Controller (Back to Top Button)
   ========================================================================== */
const ScrollController = (() => {
  const backToTopBtn = document.getElementById('back-to-top');
  const SCROLL_THRESHOLD = 300;

  const handleScroll = () => {
    if (!backToTopBtn) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const init = () => {
    if (!backToTopBtn) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    backToTopBtn.addEventListener('click', scrollToTop);
    handleScroll(); // Initial check
  };

  return { init };
})();
