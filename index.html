document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Theme toggle logic
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const toggleTrack = document.getElementById('toggleTrack');

  function applyTheme(theme) {
    if (!toggleTrack) return;
    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      toggleTrack.classList.add('toggle-checked');
      toggleTrack.style.backgroundColor = '#374151';
    } else {
      htmlEl.classList.remove('dark');
      toggleTrack.classList.remove('toggle-checked');
      toggleTrack.style.backgroundColor = '#e5e7eb';
    }
  }

  // Initialize theme
  const stored = localStorage.getItem('wc-theme');
  if (stored) {
    applyTheme(stored);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isNowDark = !htmlEl.classList.contains('dark');
      applyTheme(isNowDark ? 'dark' : 'light');
      localStorage.setItem('wc-theme', isNowDark ? 'dark' : 'light');
    });
  }

  // Set Minimum Deadline Date to 7 days from today
  const deadlineInput = document.getElementById('deadline');
  if (deadlineInput) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, '0');
    const dd = String(minDate.getDate()).padStart(2, '0');
    deadlineInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Order form logic
  const orderForm = document.getElementById('orderForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (!orderForm) return;

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function clearErrors() {
    ['errName','errEmail','errService','errDesc','errDeadline'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }

  orderForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearErrors();
    formStatus.textContent = '';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70');

    const name = orderForm.clientName.value.trim();
    const email = orderForm.email.value.trim();
    const service = orderForm.service.value;
    const description = orderForm.description.value.trim();
    const budget = orderForm.budget.value.trim();
    const deadline = orderForm.deadline.value;

    const formspreeEndpoint = "https://formspree.io/f/xnpjrnpk";

    let hasError = false;
    if (!name) { document.getElementById('errName').classList.remove('hidden'); hasError = true; }
    if (!isValidEmail(email)) { document.getElementById('errEmail').classList.remove('hidden'); hasError = true; }
    if (!service) { document.getElementById('errService').classList.remove('hidden'); hasError = true; }
    if (!description) { document.getElementById('errDesc').classList.remove('hidden'); hasError = true; }
    
    if (deadline) {
      const selectedDate = new Date(deadline);
      const minAllowedDate = new Date();
      minAllowedDate.setHours(0,0,0,0);
      minAllowedDate.setDate(minAllowedDate.getDate() + 7);

      if (isNaN(selectedDate.getTime()) || selectedDate < minAllowedDate) {
        document.getElementById('errDeadline').classList.remove('hidden'); 
        hasError = true;
      }
    }

    if (hasError) {
      formStatus.textContent = 'Please correct the highlighted fields.';
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
      return;
    }

    formStatus.textContent = 'Sending...';
    try {
      const payload = { clientName: name, email, service, budget, deadline, description };
      const res = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Submission failed (${res.status}): ${text}`);
      }

      formStatus.textContent = 'Order submitted successfully — thank you!';
      orderForm.reset();
    } catch (err) {
      console.error(err);
      formStatus.innerHTML = 'Error sending order. Please try again later or email us directly.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
    }
  });

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
