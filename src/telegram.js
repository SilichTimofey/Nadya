const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export async function notifyTelegram(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn(
      '[telegram] Заполни VITE_TELEGRAM_BOT_TOKEN и VITE_TELEGRAM_CHAT_ID в .env',
    );
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[telegram] send failed:', err);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[telegram] network error:', error);
    return false;
  }
}
