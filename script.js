// small startup tasks: set year, theme, and interaction handlers
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle (persist in localStorage)
const htmlEl = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const toggleTrack = document.getElementById('toggleTrack');

function applyTheme(theme) {
  if (theme === 'dark') {
    htmlEl.classList.add('dark');
    toggleTrack.classList.add('toggle-checked');
    toggleTrack.style.backgroundColor = '#374151'; // dark gray
  } else {
    htmlEl.classList.remove('dark');
    toggleTrack.classList.remove('toggle-checked');
    toggleTrack.style.backgroundColor = '#e5e7eb'; // light gray
  }
}

// initialize theme from localStorage or system
const stored = localStorage.getItem('wc-theme');
if (stored) {
  applyTheme(stored);
} else {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const isNowDark = !htmlEl.classList.contains('dark');
  applyTheme(isNowDark ? 'dark' : 'light');
  localStorage.setItem('wc-theme', isNowDark ? 'dark' : 'light');
});

// Order form logic
const orderForm = document.getElementById('orderForm');
const formspreeBlock = document.getElementById('formspreeBlock');
const formStatus = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

// Show/hide formspree endpoint input based on radio
function updateSubmissionUI() {
  const method = orderForm.submitMethod.value;
  if (method === 'formspree') {
    formspreeBlock.classList.remove('hidden');
  } else {
    formspreeBlock.classList.add('hidden');
  }
}
orderForm.addEventListener('change', (e) => {
  if (e.target.name === 'submitMethod') updateSubmissionUI();
});

// Simple validators
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
  const formspreeEndpoint = orderForm.formspreeEndpoint.value.trim();

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

  // Build order summary
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
    // Fixed mailto to send directly to your business email instead of client's email input
    const mailto = `mailto:hello@webcraft.example?subject=${subject}&body=${body}`;
    formStatus.textContent = 'Opening your email client...';
    setTimeout(() => {
      window.location.href = mailto;
      formStatus.textContent = 'If your email client did not open, copy the order text from the description above and email hello@webcraft.example.';
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
    }, 350);
    return;
  }

  // method === 'formspree'
  if (!formspreeEndpoint) {
    formStatus.innerHTML = 'No Formspree endpoint provided — to enable Formspree submission: create a free form at <a class="text-indigo-600 underline" href="https://formspree.io" target="_blank" rel="noopener">formspree.io</a>, copy the endpoint (e.g. https://formspree.io/f/your-id), paste it into the "Formspree endpoint" field, and submit again.';
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70');
    return;
  }

  // Attempt to POST to Formspree endpoint
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

    formStatus.textContent = 'Order submitted — thank you! You will receive a confirmation shortly.';
    orderForm.reset();
    updateSubmissionUI();
  } catch (err) {
    console.error(err);
    formStatus.innerHTML = 'There was an error sending your order. Please try again later or use the mailto option.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-70');
  }
});

// Smooth scroll when clicking header CTAs
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// init submission UI visibility
updateSubmissionUI();