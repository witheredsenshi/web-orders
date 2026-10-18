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

  // Order form logic
  const orderForm = document.getElementById('orderForm');
  const formspreeBlock = document.getElementById('formspreeBlock');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (!orderForm) return;

  function updateSubmissionUI() {
    const method = orderForm.submitMethod.value;
    if (method === 'formspree') {
      if (formspreeBlock) formspreeBlock.classList.add('hidden'); // Hide manual input since URL is built-in
    } else {
      if (formspreeBlock) formspreeBlock.classList.add('hidden');
    }
  }

  orderForm.addEventListener('change', (e) => {
    if (e.target.name === 'submitMethod') updateSubmissionUI();
  });

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
    const method = orderForm.submitMethod.value;

    // Hardcoded Formspree endpoint
    const formspreeEndpoint = "https://formspree.io/f/xnpjrnpk";

    let hasError = false;
    if (!name) { document.getElementById('errName').classList.remove('hidden'); hasError = true; }
    if (!isValidEmail(email)) { document.getElementById('errEmail').classList.remove('hidden'); hasError = true; }
    if (!service) { document.getElementById('errService').classList.remove('hidden'); hasError = true; }
    if (!description) { document.getElementById('errDesc').classList.remove('hidden'); hasError = true; }
    if (deadline) {
      const d = new Date(deadline);
      const now = new Date();
      now.setHours(0,0,0,0);
      if (isNaN(d.getTime()) || d < now) {
        document.getElementById('errDeadline').classList.remove('hidden'); hasError = true;
      }
    }

    if (hasError) {
      formStatus.textContent = 'Please correct the highlighted fields.';
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
      return;
    }

    // Build order summary for mailto
    const summaryLines = [
      `Client Name: ${name}`,
      `Email: ${email}`,
      `Service: ${service}`,
      `Budget: ${budget || 'Not specified'}`,
      `Deadline: ${deadline || 'Not specified'}`,
      '',
      'Project Description:',
      description
    ];
    const summary = summaryLines.join('\n');

    if (method === 'mailto') {
      const subject = encodeURIComponent(`WebCraft Studio Order — ${service} — ${name}`);
      const body = encodeURIComponent(summary);
      const mailto = `mailto:witheredsenshi999@gmail.com?subject=${subject}&body=${body}`;
      
      formStatus.textContent = 'Opening your email client...';
      window.location.href = mailto;
      
      setTimeout(() => {
        formStatus.textContent = 'Email client opened! If it didn’t open, email witheredsenshi999@gmail.com directly.';
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70');
      }, 500);
      return;
    }

    // method === 'formspree'
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
      updateSubmissionUI();
    } catch (err) {
      console.error(err);
      formStatus.innerHTML = 'Error sending order. Please try again or use the mailto option.';
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

  updateSubmissionUI();
});
