/**
 * GRAVY Landing Page — script.js
 * Lógica interactiva de alta gama:
 * 1. Header scroll y navegación activa.
 * 2. Menú móvil táctil.
 * 3. Vitrina interactiva de software (Showcase con pestañas).
 * 4. Filtrado reactivo de 20+ módulos.
 * 5. Wizard de diagnóstico y cotización paso a paso (Lead Funnel a WhatsApp).
 * 6. Acordeón accesible de preguntas frecuentes (FAQ).
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. HEADER ELEVADO & NAVEGACIÓN ACTIVA
     ========================================================================== */
  const header   = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleHeaderScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    let currentSectionId = '';
    const scrollPosition = window.scrollY + 130;

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
        if (menuIcon) menuIcon.className = 'fas fa-bars';
      });
    });
  }

  /* ==========================================================================
     3. VITRINA INTERACTIVA DE PANTALLAS (SHOWCASE TABS)
     ========================================================================== */
  const showcaseTabs   = document.querySelectorAll('.showcase-tab');
  const showcasePanels = document.querySelectorAll('.showcase-panel');

  showcaseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showcaseTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.getAttribute('data-tab');

      showcasePanels.forEach(panel => {
        if (panel.id === `tab-panel-${targetTab}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  /* ==========================================================================
     4. FILTRADO DINÁMICO DE 20+ MÓDULOS
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
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  /* ==========================================================================
     5. WIZARD INTERACTIVO DE DIAGNÓSTICO & COTIZACIÓN
     ========================================================================== */
  const wizardState = {
    sector: '',
    challenge: '',
    name: '',
    phone: '',
    company: '',
    city: ''
  };

  // Nodos de pasos y contenidos
  const stepNodes = [
    document.getElementById('wizard-node-1'),
    document.getElementById('wizard-node-2'),
    document.getElementById('wizard-node-3')
  ];

  const stepContents = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3')
  ];

  const btnNext1 = document.getElementById('btn-next-step-1');
  const btnPrev2 = document.getElementById('btn-prev-step-2');
  const btnNext2 = document.getElementById('btn-next-step-2');
  const btnPrev3 = document.getElementById('btn-prev-step-3');
  const leadForm = document.getElementById('wizard-lead-form');

  const goToStep = (targetStepIndex) => {
    stepNodes.forEach((node, idx) => {
      node.classList.remove('active');
      if (idx < targetStepIndex) {
        node.classList.add('completed');
      } else {
        node.classList.remove('completed');
      }
      if (idx === targetStepIndex) {
        node.classList.add('active');
      }
    });

    stepContents.forEach((content, idx) => {
      content.classList.toggle('active', idx === targetStepIndex);
    });
  };

  // Selección en Paso 1 (Sector)
  const sectorCards = document.querySelectorAll('.wizard-option-card[data-wizard-type="sector"]');
  sectorCards.forEach(card => {
    card.addEventListener('click', () => {
      sectorCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      wizardState.sector = card.getAttribute('data-value') || '';
      if (btnNext1) btnNext1.removeAttribute('disabled');
    });
  });

  if (btnNext1) {
    btnNext1.addEventListener('click', () => {
      if (wizardState.sector) goToStep(1);
    });
  }

  // Selección en Paso 2 (Reto)
  const challengeCards = document.querySelectorAll('.wizard-option-card[data-wizard-type="challenge"]');
  challengeCards.forEach(card => {
    card.addEventListener('click', () => {
      challengeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      wizardState.challenge = card.getAttribute('data-value') || '';
      if (btnNext2) btnNext2.removeAttribute('disabled');
    });
  });

  if (btnPrev2) {
    btnPrev2.addEventListener('click', () => goToStep(0));
  }

  if (btnNext2) {
    btnNext2.addEventListener('click', () => {
      if (wizardState.challenge) goToStep(2);
    });
  }

  if (btnPrev3) {
    btnPrev3.addEventListener('click', () => goToStep(1));
  }

  // Envío final del formulario y generación de WhatsApp
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput    = document.getElementById('wizard-name');
      const phoneInput   = document.getElementById('wizard-phone');
      const companyInput = document.getElementById('wizard-company');
      const cityInput    = document.getElementById('wizard-city');

      wizardState.name    = nameInput ? nameInput.value.trim() : '';
      wizardState.phone   = phoneInput ? phoneInput.value.trim() : '';
      wizardState.company = companyInput ? companyInput.value.trim() : 'No indicada';
      wizardState.city    = cityInput ? cityInput.value.trim() : 'Colombia';

      if (!wizardState.name || !wizardState.phone) {
        alert('Por favor completa tu Nombre y WhatsApp para recibir la demostración.');
        return;
      }

      // Mensaje estructurado para el asesor
      const textMessage = 
`¡Hola equipo GRAVY! 👋 Acabo de realizar el diagnóstico express en su sitio web:

🏢 *Modelo de Empresa:* ${wizardState.sector || 'Comercial'}
⚠️ *Dificultad a resolver:* ${wizardState.challenge || 'Optimización operativa'}
👤 *Contacto:* ${wizardState.name}
📱 *WhatsApp:* ${wizardState.phone}
🏬 *Empresa:* ${wizardState.company}
📍 *Ciudad:* ${wizardState.city}

Quiero agendar una demostración guiada del ERP y recibir la cotización correspondiente.`;

      const encodedMessage = encodeURIComponent(textMessage);
      // Número comercial de atención (formato internacional Colombia +57)
      const whatsappUrl = `https://wa.me/573105550000?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  /* ==========================================================================
     6. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Cierra los demás para navegación limpia
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('open');
            const otherTrigger = otherItem.querySelector('.faq-trigger');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        // Alterna el actual
        item.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });
    }
  });

});
