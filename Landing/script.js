/**
 * GRAVY Landing Page - script.js
 * Interactividad, conmutador de precios, filtrado de módulos y soporte móvil.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. SCROLL-DEPENDENT HEADER & ACTIVE LINKS
     ========================================================================== */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    // Add border/compact style on scroll
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    // Active link highlighting
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120; // offset for header

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
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

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial run

  /* ==========================================================================
     2. MOBILE MENU NAVIGATION TOGGLE
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const menuIcon = navToggle.querySelector('i');

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isOpen = navMenu.classList.contains('open');
    
    // Toggle icon fa-bars / fa-xmark
    if (isOpen) {
      menuIcon.className = 'fas fa-xmark';
    } else {
      menuIcon.className = 'fas fa-bars';
    }
  });

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuIcon.className = 'fas fa-bars';
    });
  });

  /* ==========================================================================
     3. DYNAMIC PRICING TOGGLE (MONTHLY VS LIFETIME)
     ========================================================================== */
  const pricingToggle = document.getElementById('pricing-toggle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelLifetime = document.getElementById('label-lifetime');
  
  // Pricing Card Elements
  const planPrices = document.querySelectorAll('.plan-price');
  const pricingDeploymentDesc = document.getElementById('pricing-deployment-desc');
  const deploymentFeatures = document.querySelectorAll('.deployment-feature');
  
  // Periods labels
  const periodCore = document.getElementById('period-core');
  const periodPyme = document.getElementById('period-pyme');
  const periodCopropiedades = document.getElementById('period-copropiedades');
  const periodFull = document.getElementById('period-full');

  // Modular/A-la-Carta price values in table
  const modularValues = document.querySelectorAll('.modular-item-val');
  const modularPeriods = document.querySelectorAll('.modular-item-period');

  const updatePricing = () => {
    const isLifetime = pricingToggle.checked;

    if (isLifetime) {
      // Toggle labels classes
      labelLifetime.classList.add('active');
      labelMonthly.classList.remove('active');

      // Update Card Prices (using data-lifetime)
      planPrices.forEach(price => {
        const lifetimeVal = price.getAttribute('data-lifetime');
        if (lifetimeVal) {
          price.textContent = lifetimeVal;
        }
      });

      // Update period subtext
      if (periodCore) periodCore.textContent = ' pago único';
      if (periodPyme) periodPyme.textContent = ' pago único';
      if (periodCopropiedades) periodCopropiedades.textContent = ' pago único';
      if (periodFull) periodFull.textContent = ' pago único';

      // Update deployment description
      if (pricingDeploymentDesc) {
        pricingDeploymentDesc.innerHTML = '<i class="fas fa-server"></i> Licenciamiento 100% Local (Ejecución en tu red LAN. No requiere Nube ni Internet)';
        pricingDeploymentDesc.style.color = 'var(--accent-cyan-strong)';
      }

      // Update card features list
      deploymentFeatures.forEach(el => {
        el.innerHTML = '<i class="fas fa-server"></i> Ejecución 100% Local (LAN)';
      });

      // Update Modular Table Values
      // Index mapping: 
      // 0: Core ($49.000 / $599.000)
      // 1: POS (+$15.000 / +$150.000)
      // 2: Inventarios (+$15.000 / +$150.000)
      // 3: DIAN (+$20.000 / +$200.000)
      // 4: Importaciones (+$20.000 / +$200.000)
      // 5: Copropiedades (+$35.000 / +$350.000)
      const lifetimeModularVals = ['$979.000', '+$385.000', '+$385.000', '+$495.000', '+$550.000', '+$715.000'];
      
      modularValues.forEach((val, idx) => {
        if (lifetimeModularVals[idx]) {
          val.textContent = lifetimeModularVals[idx];
        }
      });

      modularPeriods.forEach((period, idx) => {
        if (idx === 0) {
          period.textContent = 'Base único';
        } else {
          period.textContent = 'Adicional único';
        }
      });

    } else {
      // Toggle labels classes
      labelMonthly.classList.add('active');
      labelLifetime.classList.remove('active');

      // Update Card Prices (using data-monthly)
      planPrices.forEach(price => {
        const monthlyVal = price.getAttribute('data-monthly');
        if (monthlyVal) {
          price.textContent = monthlyVal;
        }
      });

      // Update period subtext
      if (periodCore) periodCore.textContent = '/ mes';
      if (periodPyme) periodPyme.textContent = '/ mes';
      if (periodCopropiedades) periodCopropiedades.textContent = '/ mes';
      if (periodFull) periodFull.textContent = '/ mes';

      // Update deployment description
      if (pricingDeploymentDesc) {
        pricingDeploymentDesc.innerHTML = '<i class="fas fa-cloud"></i> Servicio Cloud Integrado (Suscripción incluye base de datos Cloud sincronizada)';
        pricingDeploymentDesc.style.color = 'var(--accent-violet-strong)';
      }

      // Update card features list
      deploymentFeatures.forEach(el => {
        el.innerHTML = '<i class="fas fa-cloud"></i> Servidor Cloud Sincronizado';
      });

      // Update Modular Table Values (Monthly)
      const monthlyModularVals = ['$89.000', '+$35.000', '+$35.000', '+$45.000', '+$50.000', '+$65.000'];
      
      modularValues.forEach((val, idx) => {
        if (monthlyModularVals[idx]) {
          val.textContent = monthlyModularVals[idx];
        }
      });

      modularPeriods.forEach((period, idx) => {
        if (idx === 0) {
          period.textContent = 'Base / mes';
        } else {
          period.textContent = 'Adicional / mes';
        }
      });
    }
  };

  pricingToggle.addEventListener('change', updatePricing);
  
  // Click on labels triggers the toggle
  labelMonthly.addEventListener('click', () => {
    if (pricingToggle.checked) {
      pricingToggle.checked = false;
      updatePricing();
    }
  });

  labelLifetime.addEventListener('click', () => {
    if (!pricingToggle.checked) {
      pricingToggle.checked = true;
      updatePricing();
    }
  });

  /* ==========================================================================
     4. MODULES DYNAMIC CATEGORY FILTER
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const moduleCards = document.querySelectorAll('.module-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle button active classes
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      moduleCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterValue === 'all' || cardCategory === filterValue) {
          // Show card with smooth transitions
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          // Hide card
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  /* ==========================================================================
     5. CONTACT FORM VALIDATION & SIMULATED SUBMIT
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset alert states
    formSuccess.style.display = 'none';
    formError.style.display = 'none';

    // Get input values
    const name = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const plan = document.getElementById('form-plan').value;
    const msg = document.getElementById('form-msg').value.trim();

    // Basic Validation
    if (!name || !phone || !email || !msg) {
      formError.style.display = 'flex';
      formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Submit state representation
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    // Simulate Network Request
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      // Success feedback
      formSuccess.style.display = 'flex';
      contactForm.reset();
      
      // Auto scroll to success message
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Optional: Redirect or open WhatsApp after 1.5 seconds to close the sales funnel
      setTimeout(() => {
        const textMsg = encodeURIComponent(
          `Hola, mi nombre es ${name}. Estoy interesado en adquirir el Plan ${plan.toUpperCase()} de GRAVY. ` +
          `Mi correo de contacto es ${email}. Detalle del negocio: ${msg}`
        );
        window.open(`https://wa.me/573233273136?text=${textMsg}`, '_blank');
      }, 1500);

    }, 1500);
  });
});
