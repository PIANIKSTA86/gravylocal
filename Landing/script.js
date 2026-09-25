/**
 * GRAVY Landing Page — script.js
 * Interactividad moderna, scroll reveal, contadores numéricos, acordeón FAQ y conexión WhatsApp.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. HEADER ELEVADO & NAVEGACIÓN ACTIVA AL HACER SCROLL
     ========================================================================== */
  const header   = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleHeaderScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    let currentSectionId = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ==========================================================================
     2. MENÚ MÓVIL TOGGLE
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    const menuIcon = navToggle.querySelector('i');

    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      menuIcon.className = isOpen ? 'fas fa-xmark' : 'fas fa-bars';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuIcon.className = 'fas fa-bars';
      });
    });
  }

  /* ==========================================================================
     3. FILTRADO DINÁMICO DE MÓDULOS
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const moduleCards   = document.querySelectorAll('.module-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      moduleCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 240);
        }
      });
    });
  });

  /* ==========================================================================
     4. CONTADORES NUMÉRICOS ANIMADOS
     ========================================================================== */
  const counterEls = document.querySelectorAll('.stat-number[data-target]');

  const animateCounter = (el) => {
    const target   = parseFloat(el.getAttribute('data-target'));
    const suffix   = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1600;
    const startTime = performance.now();
    const easeOut   = t => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = target * easeOut(progress);

      el.textContent = value.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counterEls.forEach(el => counterObserver.observe(el));

  /* ==========================================================================
     5. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = answer.classList.contains('open');

        // Cierra los demás acordeones para mantener orden visual
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherQuestion = otherItem.querySelector('.faq-question');
            const otherAnswer   = otherItem.querySelector('.faq-answer');
            if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            if (otherAnswer)   otherAnswer.classList.remove('open');
          }
        });

        item.classList.toggle('active', !isOpen);
        answer.classList.toggle('open', !isOpen);
        question.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    }
  });

  /* ==========================================================================
     6. FORMULARIO DE CONTACTO & ASESORÍA CON WHATSAPP
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError   = document.getElementById('form-error');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formSuccess) formSuccess.style.display = 'none';
      if (formError)   formError.style.display   = 'none';

      const name  = document.getElementById('form-name')?.value.trim();
      const phone = document.getElementById('form-phone')?.value.trim();
      const email = document.getElementById('form-email')?.value.trim();
      const plan  = document.getElementById('form-plan')?.value || 'general';
      const msg   = document.getElementById('form-msg')?.value.trim();

      if (!name || !phone || !email || !msg) {
        if (formError) {
          formError.style.display = 'flex';
          formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      const submitBtn    = contactForm.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando solicitud...';

      setTimeout(() => {
        submitBtn.disabled  = false;
        submitBtn.innerHTML = originalHtml;
        if (formSuccess) {
          formSuccess.style.display = 'flex';
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        contactForm.reset();

        // Enlace automático a WhatsApp con el mensaje estructurado
        setTimeout(() => {
          const textMsg = encodeURIComponent(
            `*Solicitud de Información GRAVY v2.0*\n` +
            `• *Nombre:* ${name}\n` +
            `• *Teléfono:* ${phone}\n` +
            `• *Correo:* ${email}\n` +
            `• *Módulo:* ${plan.toUpperCase()}\n` +
            `• *Detalle:* ${msg}`
          );
          window.open(`https://wa.me/573233273136?text=${textMsg}`, '_blank');
        }, 1200);
      }, 1000);
    });
  }

  /* ==========================================================================
     7. SCROLL REVEAL SUAVE
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

});
