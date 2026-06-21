/**
 * GRAVY Landing Page - script.js
 * Interactividad, partículas, scroll-reveal, contadores animados y soporte móvil.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. SCROLL-DEPENDENT HEADER & ACTIVE LINKS
     ========================================================================== */
  const header   = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop    = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
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

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ==========================================================================
     2. MOBILE MENU NAVIGATION TOGGLE
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');
  const menuIcon  = navToggle.querySelector('i');

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

  /* ==========================================================================
     3. PRICING TOGGLE — SINGLE BASE PLAN (LOCAL / HÍBRIDO)
     ========================================================================== */
  const pricingToggle = document.getElementById('pricing-toggle');
  const labelMonthly  = document.getElementById('label-monthly');
  const labelLifetime = document.getElementById('label-lifetime');
  const basePrice     = document.getElementById('base-price');
  const periodBase    = document.getElementById('period-base');

  const updatePricing = () => {
    const isLifetime = pricingToggle && pricingToggle.checked;

    if (labelLifetime) labelLifetime.classList.toggle('active',  isLifetime);
    if (labelMonthly)  labelMonthly.classList.toggle('active', !isLifetime);

    if (basePrice) {
      basePrice.textContent = isLifetime
        ? basePrice.getAttribute('data-lifetime')
        : basePrice.getAttribute('data-monthly');
    }
    if (periodBase) {
      periodBase.textContent = isLifetime ? ' pago único' : '/ mes';
    }
  };

  if (pricingToggle) {
    pricingToggle.addEventListener('change', updatePricing);
    if (labelMonthly)  labelMonthly.addEventListener('click',  () => { if (pricingToggle.checked)  { pricingToggle.checked = false; updatePricing(); } });
    if (labelLifetime) labelLifetime.addEventListener('click', () => { if (!pricingToggle.checked) { pricingToggle.checked = true;  updatePricing(); } });
    updatePricing();
  }

  /* ==========================================================================
     4. MODULES DYNAMIC CATEGORY FILTER
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
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });

  /* ==========================================================================
     5. CONTACT FORM VALIDATION & SUBMIT
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError   = document.getElementById('form-error');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formSuccess.style.display = 'none';
    formError.style.display   = 'none';

    const name  = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const plan  = document.getElementById('form-plan').value;
    const msg   = document.getElementById('form-msg').value.trim();

    if (!name || !phone || !email || !msg) {
      formError.style.display = 'flex';
      formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    const submitBtn    = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    setTimeout(() => {
      submitBtn.disabled  = false;
      submitBtn.textContent = originalText;
      formSuccess.style.display = 'flex';
      contactForm.reset();
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      setTimeout(() => {
        const textMsg = encodeURIComponent(
          `Hola, mi nombre es ${name}. Estoy interesado en GRAVY — módulos: ${plan.toUpperCase()}. ` +
          `Correo: ${email}. Detalle: ${msg}`
        );
        window.open(`https://wa.me/573233273136?text=${textMsg}`, '_blank');
      }, 1500);
    }, 1500);
  });

  /* ==========================================================================
     6. HERO FLOATING PARTICLES
     ========================================================================== */
  const particlesContainer = document.getElementById('hero-particles');
  if (particlesContainer) {
    const PARTICLE_COUNT = 28;
    const colors = ['#00b4d8', '#6c5ce7', '#64e1ff', '#7f7cff'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p     = document.createElement('div');
      p.className = 'hero-particle';

      const size  = Math.random() * 4 + 2;
      const left  = Math.random() * 100;
      const dur   = (Math.random() * 10 + 7).toFixed(1);
      const del   = (Math.random() * 10).toFixed(1);
      const drift = ((Math.random() - 0.5) * 120).toFixed(0);
      const color = colors[Math.floor(Math.random() * colors.length)];

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: -10px;
        position: absolute;
        border-radius: 50%;
        background: ${color};
        --dur: ${dur}s;
        --delay: ${del}s;
        --drift: ${drift}px;
        opacity: 0;
        animation: particleFloat var(--dur) var(--delay) ease-in-out infinite;
      `;
      particlesContainer.appendChild(p);
    }
  }

  /* ==========================================================================
     7. SCROLL-REVEAL — INTERSECTION OBSERVER
     ========================================================================== */
  const revealTargets = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));

  // Staggered card reveal observer
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  const assignStagger = (selector, step = 80) => {
    const groups = {};
    document.querySelectorAll(selector).forEach(card => {
      const parent = card.parentElement;
      if (!groups[parent]) groups[parent] = [];
      groups[parent].push(card);
    });
    Object.values(groups).forEach(cards => {
      cards.forEach((card, i) => {
        card.style.setProperty('--stagger', `${i * step}ms`);
        cardObserver.observe(card);
      });
    });
  };

  assignStagger('.module-card',   70);
  assignStagger('.pricing-card', 100);
  assignStagger('.stat-item',     80);
  assignStagger('.feature-card', 100);

  /* ==========================================================================
     8. ANIMATED COUNTERS
     ========================================================================== */
  const counterEls = document.querySelectorAll('.stat-number[data-target]');

  const animateCounter = (el) => {
    const target   = parseFloat(el.getAttribute('data-target'));
    const suffix   = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1800;
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
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  /* ==========================================================================
     9. SMOOTH MOCKUP PARALLAX ON MOUSE MOVE (Hero only)
     ========================================================================== */
  const mockupBase  = document.querySelector('.mockup-base');
  const heroSection = document.querySelector('.hero');

  if (mockupBase && heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / rect.width;
      const dy   = (e.clientY - cy) / rect.height;

      const rotY = -8 + dx * 12;
      const rotX =  8 - dy *  8;

      mockupBase.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      mockupBase.style.transform = 'rotateY(-8deg) rotateX(8deg)';
    }, { passive: true });
  }

  /* ==========================================================================
     10. FAQ ACCORDION TOGGLE
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = answer.classList.contains('open');

        // Close other items for accordion behavior
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherQuestion = otherItem.querySelector('.faq-question');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
            if (otherAnswer) otherAnswer.classList.remove('open');
          }
        });

        // Toggle current item
        item.classList.toggle('active', !isOpen);
        answer.classList.toggle('open', !isOpen);
        question.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    }
  });

});
