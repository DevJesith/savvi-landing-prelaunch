/**
 * landing_custom.js
 *
 * Archivo que contiene el comportamiento de la UI en la landing:
 * - Animación tipo "typewriter" en el título
 * - Reveals (elementos que aparecen al hacer scroll)
 * - Navegación con estado activo según la sección visible
 * - Validación y envío del formulario de lista de espera
 * - Manejo de los modales de Privacidad y Contacto
 *
 * Comentarios: el envío al backend está delegado a `window.sendWaitlist`
 * que se define en `custom_send.js` (esto mantiene esta capa enfocada
 * en la UI y validaciones).
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== Typewriter (animación del título) =====
  // `titleWords` contiene las partes que se irán mostrando una a una.
  const titleWords = ['Toma el', 'control total', 'de tus finanzas'];
  const prefix = document.getElementById('title-prefix');
  const highlight = document.getElementById('title-highlight');
  const suffix = document.getElementById('title-suffix');

  // Si falta algún elemento del DOM, salimos para evitar errores.
  if (!prefix || !highlight || !suffix) {
    return;
  }

  // Velocidad de tipeo (ms por carácter) y pequeño retraso al terminar.
  const typingSpeed = 100;
  const delayAfter = 200;

  // Limpiamos contenido previo (por si el HTML tiene algo estático).
  prefix.textContent = '';
  highlight.textContent = '';
  suffix.textContent = '';

  /**
   * showText(element, text, callback)
   * - Escribe `text` carácter por carácter dentro de `element`.
   * - Llama a `callback` cuando termina.
   */
  const showText = (element, text, callback) => {
    let index = 0;
    element.textContent = '';
    const interval = setInterval(() => {
      element.textContent += text[index];
      index += 1;
      if (index >= text.length) {
        clearInterval(interval);
        setTimeout(callback, delayAfter);
      }
    }, typingSpeed);
  };

  // Cuando el tipo termina, añadimos una clase para ocultar el cursor.
  const finishTyping = () => {
    const title = document.querySelector('.typewriter-title');
    if (title) title.classList.add('finished');
  };

  // ===== Reveal on scroll =====
  // Observa elementos con la clase `.animate-on-scroll` y añade `.visible`
  // cuando entran en el viewport para activar las transiciones CSS.
  const revealOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve para que la animación sólo ocurra una vez.
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      },
    );

    elements.forEach((element) => observer.observe(element));
  };

  // Ejecutamos la secuencia de tipeo para cada parte del título.
  showText(prefix, titleWords[0], () => {
    showText(highlight, titleWords[1], () => {
      showText(suffix, titleWords[2], () => {
        finishTyping();
      });
    });
  });

  // Iniciamos los observers de scroll.
  revealOnScroll();

  const navLinks = document.querySelectorAll('a.nav-link[href^="#"]');
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveNav = (activeHash) => {
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === activeHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  const initialHash = window.location.hash || '#plataforma';
  setActiveNav(initialHash);

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveNav(targetId);
      }
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNav(`#${entry.target.id}`);
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: '-30% 0px -50% 0px',
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const waitlistForm = document.getElementById('waitlist-form');
  const waitlistEmail = document.getElementById('waitlist-email');
  const waitlistName = document.getElementById('waitlist-name');
  const waitlistEmailError = document.getElementById('waitlist-email-error');
  const waitlistNameError = document.getElementById('waitlist-name-error');
  const waitlistSuccess = document.getElementById('waitlist-success');

  const resetValidation = () => {
    [waitlistEmail, waitlistName].forEach((input) => {
      if (input) input.classList.remove('input-invalid');
    });
    [waitlistEmailError, waitlistNameError, waitlistSuccess].forEach((el) => {
      if (el) el.classList.add('hidden');
      if (el) el.textContent = '';
    });
  };

  const showError = (input, messageElement, message) => {
    if (input) input.classList.add('input-invalid');
    if (messageElement) {
      messageElement.classList.remove('hidden');
      messageElement.textContent = message;
    }
  };

  const showSuccess = (message) => {
    if (!waitlistSuccess) return;
    waitlistSuccess.classList.remove('hidden');
    waitlistSuccess.textContent = message;
  };

  const isValidEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
  };

  if (waitlistForm && waitlistEmail && waitlistName) {
    waitlistForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      resetValidation();

      const emailValue = waitlistEmail.value.trim();
      const nameValue = waitlistName.value.trim();
      let isFormValid = true;

      if (!emailValue) {
        showError(waitlistEmail, waitlistEmailError, 'El correo electrónico es obligatorio.');
        isFormValid = false;
      } else if (!isValidEmail(emailValue)) {
        showError(waitlistEmail, waitlistEmailError, 'Ingresa un correo electrónico válido.');
        isFormValid = false;
      }

      if (!nameValue) {
        showError(waitlistName, waitlistNameError, 'El nombre es obligatorio.');
        isFormValid = false;
      } else if (nameValue.length < 2) {
        showError(waitlistName, waitlistNameError, 'El nombre debe tener al menos 2 caracteres.');
        isFormValid = false;
      } else if (nameValue.length > 50) {
        showError(
          waitlistName,
          waitlistNameError,
          'El nombre no puede tener más de 50 caracteres.',
        );
        isFormValid = false;
      } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(nameValue)) {
        showError(
          waitlistName,
          waitlistNameError,
          'El nombre solo puede contener letras, espacios, guiones y apóstrofes.',
        );
        isFormValid = false;
      }

      if (!isFormValid) {
        return;
      }

      // Deshabilitar botón mientras se envía
      const submitBtn = waitlistForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      // ===== Envío =====
      // Delegamos el envío a la función `window.sendWaitlist` definida
      // en `custom_send.js`. Esa función hace dos cosas:
      //  1) obtiene el país aproximado mediante `getCountry()`
      //  2) inserta el registro en la tabla `waitlist` usando `sb`
      // La función retorna un objeto con `data` y/o `error` (estilo Supabase).
      const { error } = await window.sendWaitlist({ nombre: nameValue, correo: emailValue });

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      if (error) {
        if (error.code === '23505') {
          showError(waitlistEmail, waitlistEmailError, 'Este correo ya está registrado.');
        } else {
          showError(waitlistEmail, waitlistEmailError, 'Algo salió mal. Intenta de nuevo.');
          console.error(error);
        }
        return;
      }

      showSuccess('¡Perfecto! Te avisaremos cuando Savvi esté disponible 🚀');
      waitlistForm.reset();
    });
  }

  const privacyLink = document.getElementById('privacy-link');
  const privacyModal = document.getElementById('privacy-modal');
  const privacyClose = document.getElementById('privacy-close');
  const contactLink = document.getElementById('contact-link');
  const contactModal = document.getElementById('contact-modal');
  const contactClose = document.getElementById('contact-close');

  const toggleModal = (modal, show) => {
    if (!modal) return;
    modal.classList.toggle('hidden', !show);
    modal.classList.toggle('flex', show);
  };

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      toggleModal(privacyModal, false);
      toggleModal(contactModal, false);
    }
  };

  if (privacyLink && privacyModal && privacyClose) {
    privacyLink.addEventListener('click', () => toggleModal(privacyModal, true));
    privacyClose.addEventListener('click', () => toggleModal(privacyModal, false));
    privacyModal.addEventListener('click', (event) => {
      if (event.target === privacyModal) toggleModal(privacyModal, false);
    });
  }

  if (contactLink && contactModal && contactClose) {
    contactLink.addEventListener('click', () => toggleModal(contactModal, true));
    contactClose.addEventListener('click', () => toggleModal(contactModal, false));
    contactModal.addEventListener('click', (event) => {
      if (event.target === contactModal) toggleModal(contactModal, false);
    });
  }

  document.addEventListener('keydown', handleKeydown);
});
