document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
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

  // --- Authentication & Session State Logic ---
  const loginModal = document.getElementById('loginModal');
  const authModalBtn = document.getElementById('authModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const emailLoginForm = document.getElementById('emailLoginForm');
  const loginEmailInput = document.getElementById('loginEmailInput');
  const loginPasswordInput = document.getElementById('loginPasswordInput');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  
  const userProfilePill = document.getElementById('userProfilePill');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const logoutBtn = document.getElementById('logoutBtn');
  const formAuthGate = document.getElementById('formAuthGate');
  const triggerLoginModal = document.getElementById('triggerLoginModal');
  const emailField = document.getElementById('email');

  // Dashboard elements
  const dashboardSection = document.getElementById('dashboardSection');
  const noOrdersMessage = document.getElementById('noOrdersMessage');
  const ordersListContainer = document.getElementById('ordersListContainer');

  function renderUserOrders(userEmail) {
    if (!dashboardSection) return;
    dashboardSection.classList.remove('hidden');

    const allOrders = JSON.parse(localStorage.getItem('wc_user_orders') || '{}');
    const userOrders = allOrders[userEmail] || [];

    if (userOrders.length === 0) {
      if (noOrdersMessage) noOrdersMessage.classList.remove('hidden');
      if (ordersListContainer) ordersListContainer.classList.add('hidden');
    } else {
      if (noOrdersMessage) noOrdersMessage.classList.add('hidden');
      if (ordersListContainer) {
        ordersListContainer.classList.remove('hidden');
        ordersListContainer.innerHTML = userOrders.map((order, idx) => `
          <div class="bg-gray-900/60 rounded-xl p-4 border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-indigo-400">Order #${idx + 1}</span>
                <span class="px-2 py-0.5 bg-yellow-900/40 text-yellow-400 text-xs rounded-md border border-yellow-800/40">Pending Review</span>
              </div>
              <h4 class="text-base font-semibold mt-1">${order.service}</h4>
              <p class="text-xs text-gray-400 mt-0.5 line-clamp-1">${order.description}</p>
            </div>
            <div class="text-right text-xs text-gray-400 shrink-0">
              <div>Submitted: <span class="text-gray-200 font-medium">${order.date}</span></div>
              <div>Deadline: <span class="text-gray-200 font-medium">${order.deadline || 'Flexible'}</span></div>
            </div>
          </div>
        `).join('');
      }
    }
  }

  function checkAuthState() {
    const savedUser = localStorage.getItem('wc_user_email');
    if (savedUser) {
      if (userProfilePill) userProfilePill.classList.remove('hidden');
      if (userProfilePill) userProfilePill.classList.add('flex');
      if (userEmailDisplay) userEmailDisplay.textContent = savedUser;
      if (emailField) emailField.value = savedUser;
      if (formAuthGate) formAuthGate.classList.add('hidden');
      renderUserOrders(savedUser);
    } else {
      if (userProfilePill) userProfilePill.classList.add('hidden');
      if (userProfilePill) userProfilePill.classList.remove('flex');
      if (emailField) emailField.value = '';
      if (formAuthGate) formAuthGate.classList.remove('hidden');
      if (dashboardSection) dashboardSection.classList.add('hidden');
    }
  }

  // Open / Close Modal Handlers
  if (authModalBtn) {
    authModalBtn.addEventListener('click', () => {
      const savedUser = localStorage.getItem('wc_user_email');
      if (!savedUser && loginModal) {
        loginModal.classList.remove('hidden');
      }
    });
  }

  if (triggerLoginModal) {
    triggerLoginModal.addEventListener('click', () => {
      if (loginModal) loginModal.classList.remove('hidden');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (loginModal) loginModal.classList.add('hidden');
    });
  }

  // Email & Password Login Submit
  if (emailLoginForm) {
    emailLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = loginEmailInput.value.trim();
      const passwordVal = loginPasswordInput.value.trim();

      if (emailVal && emailVal.includes('@') && passwordVal.length >= 6) {
        localStorage.setItem('wc_user_email', emailVal);
        if (loginModal) loginModal.classList.add('hidden');
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        checkAuthState();
      } else {
        alert('Please enter a valid email and a password of at least 6 characters.');
      }
    });
  }

  // Simulated Google Login
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
      const simulatedGoogleEmail = 'client.googleuser@gmail.com';
      localStorage.setItem('wc_user_email', simulatedGoogleEmail);
      if (loginModal) loginModal.classList.add('hidden');
      checkAuthState();
    });
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('wc_user_email');
      checkAuthState();
    });
  }

  // Initial check on page load
  checkAuthState();

  // --- Order form submission logic ---
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
    
    // Ensure user is logged in
    const currentUser = localStorage.getItem('wc_user_email');
    if (!currentUser) {
      if (loginModal) loginModal.classList.remove('hidden');
      return;
    }

    clearErrors();
    formStatus.textContent = '';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70');

    const name = orderForm.clientName.value.trim();
    const email = currentUser;
    const service = orderForm.service.value;
    const description = orderForm.description.value.trim();
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
      const payload = { clientName: name, email, service, deadline, description };
      const res = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Submission failed (${res.status}): ${text}`);
      }

      // Save order to local user history storage
      const allOrders = JSON.parse(localStorage.getItem('wc_user_orders') || '{}');
      if (!allOrders[email]) allOrders[email] = [];
      
      const newOrderRecord = {
        service,
        description,
        deadline,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      allOrders[email].unshift(newOrderRecord); // Add to beginning of array
      localStorage.setItem('wc_user_orders', JSON.stringify(allOrders));

      formStatus.textContent = 'Order submitted successfully & saved to your dashboard!';
      orderForm.reset();
      checkAuthState(); // re-fill email & refresh dashboard list
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
