const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  });
});

document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('details').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
}

const form = document.querySelector('#registration-form');
const success = document.querySelector('#form-success');
const goal = document.querySelector('#goal');
const counter = document.querySelector('#char-count');

goal.addEventListener('input', () => {
  counter.textContent = goal.value.length;
});

const messages = {
  valueMissing: 'Please complete this field.',
  typeMismatch: 'Please enter a valid email address.'
};

function showFieldError(field) {
  field.classList.toggle('invalid', !field.validity.valid);
  field.setAttribute('aria-invalid', String(!field.validity.valid));
  const error = field.closest('.field')?.querySelector('.error');
  if (!error) return;
  if (field.validity.valid) {
    error.textContent = '';
  } else if (field.validity.typeMismatch) {
    error.textContent = messages.typeMismatch;
  } else {
    error.textContent = messages.valueMissing;
  }
}

form.querySelectorAll('input:not([type="checkbox"]), select, textarea').forEach((field) => {
  field.addEventListener('blur', () => showFieldError(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('invalid')) showFieldError(field);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input:not([type="checkbox"]), select, textarea')];
  fields.forEach(showFieldError);

  const consent = form.elements.consent;
  const consentError = form.querySelector('.consent-error');
  consentError.textContent = consent.checked ? '' : 'Please confirm before submitting.';
  consent.setAttribute('aria-invalid', String(!consent.checked));

  if (!form.checkValidity()) {
    form.querySelector(':invalid')?.focus();
    return;
  }

  document.querySelector('#success-name').textContent = form.elements.firstName.value.trim();
  form.hidden = true;
  success.hidden = false;
  success.focus();
});

document.querySelector('.success-reset').addEventListener('click', () => {
  form.reset();
  counter.textContent = '0';
  success.hidden = true;
  form.hidden = false;
  form.querySelector('input').focus();
});

document.querySelector('#year').textContent = new Date().getFullYear();
