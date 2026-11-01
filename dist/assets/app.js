'use strict';
const $ = (selector) => document.querySelector(selector);

/* ---------- Меню ---------- */
const menuButton = $('.menu-button');
const nav = $('#navigation');

function setMenu(open) {
  if (!menuButton || !nav) return;
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}

menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    setMenu(false);
    menuButton.focus();
  }
});
// Если окно расширили до десктопа, сбрасываем состояние меню
matchMedia('(min-width: 701px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

/* ---------- Появление блоков при прокрутке ---------- */
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('js-reveal');
    observer.observe(el);
  });
}

/* ---------- Бриф ---------- */
const form = $('#brief-form');

if (form) {
  const details = $('#project-details');
  const type = $('#project-type');
  const output = $('#brief-output');
  const briefText = $('#brief-text');
  const status = $('#copy-status');

  // ?service=... со страницы услуг -> нужный пункт списка (по тексту, а не по номеру)
  const SERVICES = {
    landing: 'Лендинг или сайт-визитка',
    design: 'Редизайн сайта',
    development: 'Вёрстка и интерактив',
    support: 'Доработка существующего сайта',
  };
  const service = new URLSearchParams(location.search).get('service');
  if (service && Object.hasOwn(SERVICES, service)) type.value = SERVICES[service];

  details.addEventListener('input', () => details.setCustomValidity(''));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = details.value.trim();

    if (!text) {
      details.setCustomValidity('Расскажите о задаче — одних пробелов недостаточно.');
      details.reportValidity();
      return;
    }

    briefText.value = `Бриф для ILYA DIGITAL\n\nУслуга: ${type.value}\n\nЗадача:\n${text}`;
    output.hidden = false;
    status.textContent = 'Бриф готов. Нажмите кнопку Telegram, затем вставьте текст заявки в переписку и отправьте.';
    briefText.focus();
  });

  $('#send-telegram').addEventListener('click', async () => {
    window.open('https://t.me/Yaropolk_2', '_blank', 'noopener,noreferrer');
    try {
      await navigator.clipboard.writeText(briefText.value);
      status.textContent = 'Бриф скопирован. Вставьте его в чат Telegram и отправьте. Если чат не открылся, воспользуйтесь ссылкой @Yaropolk_2.';
    } catch {
      briefText.focus();
      briefText.select();
      status.textContent = 'Не удалось автоматически скопировать текст. Скопируйте выделенный бриф вручную и отправьте в Telegram.';
    }

  });

  $('#copy-brief').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(briefText.value);
      status.textContent = 'Бриф скопирован.';
    } catch {
      briefText.focus();
      briefText.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* запасной способ не сработал */ }
      status.textContent = copied
        ? 'Бриф скопирован.'
        : 'Текст выделен. Нажмите Ctrl+C или выберите «Копировать» на телефоне.';
    }
  });
}
