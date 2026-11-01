// ФОРМА — интерактив: фильтр карточек, выбор древесины, составление описания заказа.

const $ = (id) => document.getElementById(id);

/* ---------- 1. Фильтр направлений ---------- */
const filterButtons = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('.card');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((b) => {
      b.classList.toggle('active', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });

    cards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
  });
});

/* ---------- 2. Выбор древесины ---------- */
const woods = {
  oak:    { name: 'Дуб',    text: 'Тёплый оттенок, выразительная текстура. Для основательных вещей на каждый день.', number: '01' },
  ash:    { name: 'Ясень',  text: 'Светлая палитра и заметный рисунок волокон. Для лёгких, воздушных интерьеров.',   number: '02' },
  walnut: { name: 'Орех',   text: 'Глубокие коричневые оттенки и богатый рисунок. Для предметов с выразительным характером.', number: '03' },
};

const woodButtons = document.querySelectorAll('[data-wood]');
const woodSelect = $('wood-select');

function showWood(key) {
  const wood = woods[key];
  if (!wood) return;

  woodButtons.forEach((b) => {
    const active = b.dataset.wood === key;
    b.classList.toggle('selected', active);
    b.setAttribute('aria-pressed', String(active));
  });

  $('wood-panel').className = 'wood-panel ' + key;
  $('wood-title').textContent = wood.name;
  $('wood-description').textContent = wood.text;
  $('wood-number').textContent = wood.number;
}

woodButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.wood;
    showWood(key);
    woodSelect.value = woods[key].name; // синхронизируем поле формы
  });
});

// Работает и в обратную сторону: поменял материал в форме — панель тоже обновилась
woodSelect.addEventListener('change', () => {
  const key = Object.keys(woods).find((k) => woods[k].name === woodSelect.value);
  if (key) showWood(key);
});

/* ---------- 3. Карточка -> поле «Что хотите создать?» ---------- */
document.querySelectorAll('[data-project]').forEach((card) => {
  card.addEventListener('click', () => {
    $('project').value = card.dataset.project;
  });
});

/* ---------- 4. Составление описания ---------- */
$('details').addEventListener('input', () => {
  $('details').setCustomValidity('');
});
$('brief-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const details = $('details').value.trim();
  if (!details) {
    $('result').hidden = true;
    $('details').setCustomValidity('Опишите вашу идею — одних пробелов недостаточно.');
    $('details').reportValidity();
    return;
  }
  $('details').setCustomValidity('');
  const lines = [
    'Здравствуйте! Хочу обсудить изготовление изделия.',
    '',
    'Изделие: ' + $('project').value,
    'Материал: ' + woodSelect.value,
    'Пожелания: ' + details,
    '',
    'Подскажите, пожалуйста, возможные варианты, стоимость и сроки.',
  ];

  $('brief-result').value = lines.join('\n');
  $('result').hidden = false;
  $('copy-status').textContent = '';
  $('brief-result').focus();
});

/* ---------- 5. Копирование ---------- */
$('copy').addEventListener('click', async () => {
  const field = $('brief-result');
  const status = $('copy-status');

  try {
    // Современный способ (нужен https или localhost)
    await navigator.clipboard.writeText(field.value);
    status.textContent = 'Текст скопирован — можно отправить мастеру.';
  } catch {
    // Запасной способ: работает и при открытии файла двойным кликом
    field.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ничего */ }
    status.textContent = ok
      ? 'Текст скопирован — можно отправить мастеру.'
      : 'Выделите и скопируйте текст вручную.';
  }
});

/* ---------- 6. Мобильное меню ---------- */
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = $('site-nav');

function setMenu(open) {
  siteNav.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
}

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
siteNav.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && siteNav.classList.contains('open')) { setMenu(false); menuToggle.focus(); }
});
