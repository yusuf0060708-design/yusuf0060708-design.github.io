// Настройки оплаты TrakVisual Store
// Выбери способ: 'mydonate' | 'boosty' | 'donatalerts' | 'yookassa' | 'manual' | 'demo'
window.TV_PAYMENT = {
  method: 'mydonate',

  // MyDonate: ссылка на твой магазин (после регистрации вставь сюда)
  mydonateUrl: 'https://trakvisuals.mydonate.io',

  // РУЧНАЯ ОПЛАТА (без паспорта и регистрации магазина)
  // Впиши свои реквизиты — они появятся в окне покупки.
  manual: {
    telegram: '@traktorist006',
    bank: 'Озон Банк',
    card: '',
    sbpPhone: '+7 (962) 640-88-40',
    usdtTrc20: '',
    hint: 'Перевод по СБП в Озон Банк по номеру телефона. После оплаты напиши в Telegram — вышлю ключ вручную.'
  },

  // boosty: логин канала БЕЗ https://boosty.to/
  boostyUsername: 'YOUR_BOOSTY_NAME',

  // donatalerts: логин на donatalerts.ru
  donatalertsUsername: 'YOUR_DONATALERTS_NAME',

  // yookassa: адрес твоего бэкенда (см. server.js)
  yookassaEndpoint: 'http://localhost:3000/api/create-payment'
};
