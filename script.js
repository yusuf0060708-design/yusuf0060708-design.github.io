const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const closeModal = document.getElementById('closeModal');
const form = document.getElementById('leadForm');
const emailInput = document.getElementById('leadEmail');
const submitBtn = form.querySelector('button[type="submit"]');

let selectedPlan = null;

function copyText(text, e) {
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  const old = e.target.textContent;
  e.target.textContent = '✓ Скопировано';
  setTimeout(() => { e.target.textContent = old; }, 1400);
}

function showManual(plan, price) {
  const m = (window.TV_PAYMENT && window.TV_PAYMENT.manual) || {};
  const tg = (m.telegram || '@traktorist006').replace('@', '');
  const phone = m.sbpPhone || '+7 (962) 640-88-40';
  modalTitle.textContent = 'Оплата: ' + plan + ' — ' + price + ' ₽';
  modalText.innerHTML =
    '<b>Реквизиты для перевода:</b><br>' +
    (m.bank ? 'Банк: <b>' + m.bank + '</b><br>' : '') +
    '<div class="req-row"><span>СБП: <a href="tel:' + phone.replace(/[^\d+]/g, '') + '">' + phone + '</a></span>' +
    '<button type="button" class="copy-btn" data-copy="' + phone + '">Копировать</button></div>' +
    '<div class="req-row"><span>Telegram: <a href="https://t.me/' + tg + '" target="_blank">@' + tg + '</a></span>' +
    '<button type="button" class="copy-btn" data-copy="@' + tg + '">Копировать</button></div>' +
    '<br><span style="opacity:.8">' + (m.hint || 'После оплаты пришли скрин в Telegram — вышлю ключ вручную.') + '</span>';
  modalText.querySelectorAll('.copy-btn').forEach(b => {
    b.onclick = ev => copyText(b.dataset.copy, ev);
  });
  emailInput.placeholder = 'Твой Telegram или e-mail';
  submitBtn.textContent = 'Я оплатил(а)';
  modal.classList.add('open');
}

function restoreForm() {
  emailInput.placeholder = 'Твой e-mail';
  submitBtn.textContent = 'Уведомить меня';
  form.style.display = 'flex';
}

async function startPayment(plan, price) {
  const cfg = window.TV_PAYMENT || { method: 'demo' };

  if (cfg.method === 'mydonate') {
    const base = cfg.mydonateUrl;
    if (base && base.indexOf('YOUR_STORE') === -1) {
      window.location.href = base;
      return;
    }
    modalTitle.textContent = 'MyDonate — магазин визуалов';
    modalText.innerHTML = 'Подключи <b>MyDonate</b>: зарегистрируй магазин на mydonate.io, создай товары «7 дней — 149 ₽», «90 дней — 449 ₽», «360 дней — 1199 ₽» и вставь ссылку на магазин в <b>payment-config.js</b> (поле mydonateUrl). После этого кнопки «Купить» поведут прямо на оплату картой, СБП или криптой.';
    restoreForm();
    modal.classList.add('open');
    return;
  }

  if (cfg.method === 'manual') {
    showManual(plan, price);
    return;
  }

  if (cfg.method === 'yookassa') {
    try {
      const res = await fetch(cfg.yookassaEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, price, description: 'TrakVisual — ' + plan })
      });
      const data = await res.json();
      if (data.confirmationUrl) { window.location.href = data.confirmationUrl; return; }
      throw new Error(data.error || 'Не удалось создать платёж');
    } catch (e) {
      modalTitle.textContent = 'Ошибка оплаты';
      modalText.textContent = String(e.message || e);
      modal.classList.add('open');
    }
    return;
  }

  const comment = encodeURIComponent('TrakVisual — ' + plan);
  let url = null;
  if (cfg.method === 'boosty' && cfg.boostyUsername && cfg.boostyUsername !== 'YOUR_BOOSTY_NAME') {
    url = 'https://boosty.to/' + encodeURIComponent(cfg.boostyUsername) + '/donate?amount=' + price + '&comment=' + comment;
  }
  if (cfg.method === 'donatalerts' && cfg.donatalertsUsername && cfg.donatalertsUsername !== 'YOUR_DONATALERTS_NAME') {
    url = 'https://donatalerts.ru/' + encodeURIComponent(cfg.donatalertsUsername) + '?amount=' + price + '&comment=' + comment;
  }
  if (url) { window.location.href = url; return; }

  modalTitle.textContent = 'Тариф: ' + plan;
  modalText.textContent = 'Стоимость ' + price + ' ₽. Укажи реквизиты в payment-config.js, чтобы кнопка вела сразу на оплату. Пока оставь e-mail.';
  restoreForm();
  modal.classList.add('open');
}

document.querySelectorAll('.buy').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedPlan = { name: btn.dataset.plan, price: btn.dataset.price };
    startPayment(selectedPlan.name, selectedPlan.price);
  });
});

function hideModal() { modal.classList.remove('open'); }
closeModal.addEventListener('click', hideModal);
modal.addEventListener('click', e => { if (e.target === modal) hideModal(); });

form.addEventListener('submit', e => {
  e.preventDefault();
  const value = emailInput.value.trim();
  if (!value) return;
  const orders = JSON.parse(localStorage.getItem('tv_orders') || '[]');
  orders.push({ contact: value, plan: selectedPlan, date: new Date().toISOString() });
  localStorage.setItem('tv_orders', JSON.stringify(orders));
  modalTitle.textContent = 'Заявка принята!';
  modalText.textContent = 'Записали: ' + value + '. Напиши в Telegram после перевода — вышлем ключ на ' + selectedPlan.name + '.';
  form.style.display = 'none';
  setTimeout(() => { hideModal(); restoreForm(); }, 2800);
});
