import React, { useState, useRef, useEffect } from 'react';
import { notifyTelegram } from './telegram';

export default function App() {
  const [step, setStep] = useState(1);
  const [skipStyle, setSkipStyle] = useState({});
  const [skipFleeing, setSkipFleeing] = useState(false);
  const [refuseLabel, setRefuseLabel] = useState('Нет, я все таки не хочу');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTransport, setSelectedTransport] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const skipRef = useRef(null);
  const videoRef = useRef(null);
  const lastDodgeRef = useRef(0);
  const answersRef = useRef({
    started: false,
    accepted: false,
    confirmed: false,
    vibe: null,
    time: '',
    transport: '',
    contact: '',
  });

  useEffect(() => {
    const images = ['/second.jpg', '/33.jpg', '/444.jpg'];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.src = '/video.mp4';
    video.load();
  }, []);

  useEffect(() => {
    if (step !== 8) return;
    const video = videoRef.current;
    if (!video) return;
    video.volume = 0.5;
    video.play().catch(() => {});
  }, [step]);

  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const dodge = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const now = Date.now();
    if (now - lastDodgeRef.current < 120) return;
    lastDodgeRef.current = now;

    const btn = skipRef.current;
    const btnW = btn ? btn.offsetWidth : 180;
    const btnH = btn ? btn.offsetHeight : 52;
    const pad = 16;
    const maxX = Math.max(pad, window.innerWidth - btnW - pad);
    const maxY = Math.max(pad, window.innerHeight - btnH - pad);

    let x = pad + Math.random() * (maxX - pad);
    let y = pad + Math.random() * (maxY - pad);

    // если курсор рядом — уводим кнопку подальше от него
    if (e && typeof e.clientX === 'number') {
      const cx = e.clientX;
      const cy = e.clientY;
      let tries = 0;
      while (tries < 8) {
        const dx = x + btnW / 2 - cx;
        const dy = y + btnH / 2 - cy;
        if (Math.hypot(dx, dy) > 140) break;
        x = pad + Math.random() * (maxX - pad);
        y = pad + Math.random() * (maxY - pad);
        tries += 1;
      }
    }

    setSkipFleeing(true);
    setSkipStyle({
      position: 'fixed',
      left: `${Math.round(x)}px`,
      top: `${Math.round(y)}px`,
      width: `${btnW}px`,
      zIndex: 50,
      margin: 0,
    });
  };

  const trackAnswer = (patch) => {
    answersRef.current = { ...answersRef.current, ...patch };
  };

  const sendFinalSummary = () => {
    const a = answersRef.current;
    const transportLabel =
      a.transport === 'drive'
        ? 'Заехать'
        : a.transport === 'pickup'
          ? 'Зайти'
          : '—';

    const text = [
      `<b>✅ Новый ответ в invite-app</b>`,
      '',
      `• Старт: ${a.started ? 'да' : 'нет'}`,
      `• Согласие: ${a.accepted ? 'да' : 'нет'}`,
      `• Подтверждение: ${a.confirmed ? 'да' : 'нет'}`,
      `• Vibe: ${a.vibe?.label || '—'}`,
      `• Время: ${a.time || '—'}`,
      `• Транспорт: ${transportLabel}`,
      `• Контакт: ${a.contact || '—'}`,
      '',
      `<i>${new Date().toLocaleString('ru-RU')}</i>`,
    ].join('\n');

    notifyTelegram(text);
  };

  const handleRefuse = () => {
    if (refuseLabel !== 'Нет, я все таки не хочу') return;
    setRefuseLabel('Эта кнопка тоже не работает');
    setTimeout(() => {
      setStep(4);
    }, 2500);
  };

  const selectVibe = (vibe) => {
    setSelectedVibe(vibe);
    trackAnswer({ vibe });
    setStep(5);
  };

  const selectTime = (label) => {
    setSelectedTime(label);
    trackAnswer({ time: label });
    setShowCustomTime(false);
    setStep(6);
  };

  const submitCustomTime = () => {
    const value = customTime.trim();
    if (!value) return;
    setSelectedTime(value);
    trackAnswer({ time: value });
    setShowCustomTime(false);
    setStep(6);
  };

  const chooseTransport = (mode) => {
    setSelectedTransport(mode);
    trackAnswer({ transport: mode });
    setStep(7);
  };

  const submitContact = () => {
    const value = contactInfo.trim();
    if (!value || !/^[a-zA-Z0-9@._+\-]+$/.test(value)) return;
    setContactInfo(value);
    trackAnswer({ contact: value });
    sendFinalSummary();
    setStep(8);
  };

  const goBack = () => {
    if (step === 5 && showCustomTime) {
      setShowCustomTime(false);
      return;
    }
    if (step <= 1) return;

    if (step === 2) {
      setSkipStyle({});
      setSkipFleeing(false);
    }
    if (step === 3) {
      setRefuseLabel('Нет, я все таки не хочу');
    }
    if (step === 5) {
      setShowCustomTime(false);
      setCustomTime('');
      setSelectedVibe(null);
      trackAnswer({ vibe: null });
    }
    if (step === 6) {
      setSelectedTime('');
      setShowCustomTime(false);
      trackAnswer({ time: '' });
    }
    if (step === 7) {
      setSelectedTransport('');
      trackAnswer({ transport: '' });
    }
    if (step === 8) {
      setContactInfo('');
      trackAnswer({ contact: '' });
    }

    setStep(step - 1);
  };

  const transportVerb =
    selectedTransport === 'drive' ? 'заеду' : 'зайду';

  const softenCaps = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/(^|[/\s])(\S)/g, (_, sep, ch) => sep + ch.toUpperCase());

  const summarySentence = selectedTime
    ? `Отличный выбор, я ${transportVerb} за тобой в ${softenCaps(selectedTime).replace(/\s*\/\s*/g, '\u00A0/\u00A0')}.`
    : '';

  const vibes = [
    {
      id: 'rope',
      tag: '01',
      label: 'Веревочный городок',
      desc: 'Такая проверка на ловкость будет',
    },
    {
      id: 'walk',
      tag: '02',
      label: 'Прогулка',
      desc: 'Просто прогулка',
    },
    {
      id: 'rematch',
      tag: '03',
      label: 'Реванш',
      desc: 'Я понимаю, что ты соперник сильный, титулованный, но я могу обыграть',
    },
    {
      id: 'trampolines',
      tag: '04',
      label: 'Батуты',
      desc: 'Кстати прикольно',
    },
    {
      id: 'gallery',
      tag: '05',
      label: 'Галерея',
      desc: 'Место, где висят картины. В этом что-то есть',
    },
    {
      id: 'coffee',
      tag: '06',
      label: 'Кофе',
      desc: 'База да',
    },
  ];

  const timeSlots = [
    'ВТОРНИК / 19:00',
    'ЧЕТВЕРГ / 08:00',
    'ЧЕТВЕРГ / 18:30',
    'ПЯТНИЦА / 18:30',
    'СУББОТА / 17:00',
    'ВОСКРЕСЕНЬЕ / ЛЮБОЕ ВРЕМЯ',
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,700;1,500;1,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        input {
          font-size: 16px;
          touch-action: manipulation;
        }

        button {
          touch-action: manipulation;
        }

        .shell {
          min-height: 100svh;
          width: 100%;
          background: #ffffff;
          color: #050505;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 0;
          margin: 0;
          position: relative;
          overflow: hidden;
        }

        .shell::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
          mix-blend-mode: multiply;
        }

        .frame {
          width: 100%;
          max-width: none;
          min-height: 100svh;
          height: 100svh;
          border: none;
          background: #ffffff;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 40px 24px 32px;
          z-index: 1;
          overflow: hidden;
        }

        .meta {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8a8a8a;
          margin-bottom: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .back-btn {
          appearance: none;
          border: none;
          background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8a8a8a;
          cursor: pointer;
          padding: 0;
          touch-action: manipulation;
          transition: color 0.15s ease;
        }

        .back-btn:hover {
          color: #050505;
        }

        .frame.reveal .back-btn,
        .frame.last-chance .back-btn,
        .frame.timing .back-btn {
          color: rgba(245, 245, 245, 0.5);
        }

        .frame.reveal .back-btn:hover,
        .frame.last-chance .back-btn:hover,
        .frame.timing .back-btn:hover {
          color: #f5f5f5;
        }

        .title {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 42px;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
          color: #050505;
        }

        .title.sm { font-size: 34px; }
        .title.xl { font-size: 48px; }

        .body {
          font-size: 14px;
          line-height: 1.55;
          color: #555555;
          max-width: 280px;
          margin-bottom: 36px;
        }

        .spacer { flex: 1; }

        .btn {
          appearance: none;
          border: 1px solid #050505;
          background: #050505;
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 16px 18px;
          width: 100%;
          cursor: pointer;
          touch-action: manipulation;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          border-radius: 0;
        }

        .btn:hover {
          background: transparent;
          color: #050505;
        }

        .btn.ghost {
          background: transparent;
          color: #050505;
          border-color: #c8c8c8;
        }

        .btn.ghost:hover {
          border-color: #050505;
          background: #050505;
          color: #ffffff;
        }

        .btn.tiny {
          width: auto;
          border: none;
          background: transparent;
          color: #8a8a8a;
          padding: 8px 0;
          letter-spacing: 0.16em;
          font-size: 10px;
        }

        .btn.tiny:hover {
          color: #050505;
          background: transparent;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          position: relative;
          min-height: 110px;
        }

        .skip-wrap {
          position: relative;
          width: 100%;
          min-height: 52px;
        }

        .skip-btn {
          position: relative;
          transition: left 0.18s ease-out, top 0.18s ease-out;
          will-change: left, top;
          touch-action: none;
        }

        .skip-btn.fleeing {
          position: fixed;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-auto-rows: 1fr;
          gap: 0;
          border-top: 1px solid #1a1a1a;
          border-left: 1px solid #1a1a1a;
          margin-top: 0;
          width: 100%;
          flex: 1;
          min-height: 0;
        }

        @media (min-width: 720px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .card {
          border-right: 1px solid #1a1a1a;
          border-bottom: 1px solid #1a1a1a;
          background: #ffffff;
          min-height: 0;
          height: 100%;
          padding: 14px 14px 16px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          gap: 10px;
          text-align: left;
          cursor: pointer;
          color: #050505;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s ease, color 0.15s ease;
          border-radius: 0;
          overflow: hidden;
        }

        .card:hover {
          background: #050505;
          color: #ffffff;
        }

        .card-tag {
          display: block;
          font-size: 10px;
          letter-spacing: 0.22em;
          line-height: 1;
          color: #8a8a8a;
          flex-shrink: 0;
        }

        .card:hover .card-tag { color: #b0b0b0; }

        .card-copy {
          display: grid;
          grid-template-rows: auto auto;
          gap: 10px;
          flex: 1;
          min-height: 0;
          align-content: start;
        }

        .card-label {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;
          margin: 0;
          color: #050505;
          height: 2.4em;
          overflow: hidden;
        }

        .card:hover .card-label { color: #ffffff; }

        .card-desc {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          line-height: 1.45;
          color: #555;
          font-weight: 400;
          margin: 0;
        }

        .card:hover .card-desc { color: rgba(245, 245, 245, 0.75); }

        .step-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          animation: rise 0.35s ease-out;
        }

        .step-view.vibes {
          max-width: 640px;
          width: 100%;
          height: 100%;
          min-height: 0;
        }

        .step-view.vibes .title.sm {
          font-size: 28px;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .step-view.vibes .body {
          margin-bottom: 20px;
          max-width: none;
          font-size: 13px;
          color: #666;
        }

        .frame.vibes-frame {
          padding: 24px 16px 20px;
        }

        .frame.vibes-frame .meta {
          max-width: 640px;
          width: 100%;
          margin: 0 auto 18px;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .footer-line {
          margin-top: auto;
          padding-top: 28px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          justify-content: center;
        }

        .accent { color: #ff003c; }

        .rule {
          width: 40px;
          height: 1px;
          background: #050505;
          margin: 0 0 22px;
        }

        .shell.survey {
          background: #ffffff;
        }

        .shell.survey::before { display: none; }

        .frame.survey {
          border: none;
          background: #ffffff;
          color: #222;
          align-items: center;
          justify-content: center;
        }

        .survey-view {
          text-align: center;
          width: 100%;
          max-width: 280px;
          margin: 0 auto;
          animation: rise 0.35s ease-out;
        }

        .survey-title {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.3;
          color: #222;
          margin-bottom: 20px;
        }

        .survey-text {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.55;
          color: #555;
          margin-bottom: 40px;
        }

        .survey-btn {
          appearance: none;
          width: 100%;
          border: none;
          border-radius: 8px;
          background: #2B65EC;
          color: #ffffff;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px;
          font-weight: 600;
          padding: 14px 24px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .survey-btn:hover { background: #1f54d4; }

        /* Step 2 — photo background full screen */
        .shell.reveal {
          background: #050505;
        }

        .shell.reveal::before {
          display: none;
        }

        .frame.reveal {
          border: none;
          background: transparent;
          color: #f5f5f5;
          padding: 28px 24px 36px;
          justify-content: flex-start;
          z-index: 1;
          isolation: isolate;
        }

        .frame.reveal::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.55) 0%,
              rgba(0, 0, 0, 0.68) 45%,
              rgba(0, 0, 0, 0.82) 100%
            ),
            url('/second.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .frame.reveal > * {
          position: relative;
          z-index: 1;
        }

        .frame.reveal .meta {
          max-width: 420px;
          width: 100%;
          margin: 0 auto 36px;
          color: rgba(245, 245, 245, 0.5);
        }

        .step-view.reveal-copy {
          justify-content: space-between;
          gap: 28px;
        }

        .reveal-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .frame.reveal .rule {
          width: 28px;
          background: rgba(245, 245, 245, 0.9);
          margin: 0 0 20px;
        }

        .frame.reveal .title {
          font-style: italic;
          font-weight: 500;
          color: #f5f5f5;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }

        .frame.reveal .title.xl {
          font-size: 28px;
        }

        .frame.reveal .subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 500;
          line-height: 1.35;
          color: #f5f5f5;
          margin-bottom: 72px;
          max-width: 360px;
        }

        .frame.reveal .subtitle .smiley {
          white-space: nowrap;
        }

        .frame.reveal .body {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: rgba(245, 245, 245, 0.88);
          margin-bottom: 0;
          max-width: 340px;
        }

        .frame.reveal .actions {
          width: 100%;
          gap: 12px;
          min-height: 0;
        }

        .frame.reveal .btn {
          background: rgba(245, 245, 245, 0.1);
          border: 1px solid rgba(245, 245, 245, 0.9);
          color: #f5f5f5;
          backdrop-filter: blur(8px);
          border-radius: 0;
          text-transform: none;
          letter-spacing: 0.02em;
          font-size: 14px;
          font-weight: 500;
          padding: 15px 18px;
        }

        .frame.reveal .btn:hover {
          background: rgba(245, 245, 245, 0.95);
          color: #050505;
          border-color: #f5f5f5;
        }

        .frame.reveal .btn.ghost {
          background: transparent;
          border-color: rgba(245, 245, 245, 0.4);
          color: rgba(245, 245, 245, 0.88);
        }

        .frame.reveal .btn.ghost:hover {
          background: rgba(245, 245, 245, 0.12);
          border-color: rgba(245, 245, 245, 0.9);
          color: #f5f5f5;
        }

        .frame.reveal .spacer {
          flex: 1;
          min-height: 48px;
        }

        /* Step 3 — Last Chance / photo background */
        .shell.last-chance {
          background: #050505;
        }

        .shell.last-chance::before {
          display: none;
        }

        .frame.last-chance {
          background: transparent;
          color: #f5f5f5;
          padding: 28px 24px 36px;
          justify-content: flex-start;
          isolation: isolate;
        }

        .frame.last-chance::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.45) 0%,
              rgba(0, 0, 0, 0.58) 45%,
              rgba(0, 0, 0, 0.72) 100%
            ),
            url('/33.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .frame.last-chance > * {
          position: relative;
          z-index: 1;
        }

        .frame.last-chance .meta {
          max-width: 420px;
          width: 100%;
          margin: 0 auto 36px;
          color: rgba(245, 245, 245, 0.45);
          z-index: 2;
          pointer-events: auto;
        }

        .step-view.last-chance-view {
          justify-content: space-between;
          gap: 28px;
          max-width: 420px;
        }

        .last-chance-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .frame.last-chance .rule {
          width: 28px;
          background: rgba(245, 245, 245, 0.9);
          margin: 0 0 22px;
        }

        .last-chance-text {
          font-family: 'Inter', sans-serif;
          font-size: 22.5px;
          font-weight: 400;
          line-height: 1.5;
          color: #f5f5f5;
          max-width: 340px;
        }

        .frame.last-chance .actions {
          width: 100%;
          gap: 12px;
          min-height: 0;
        }

        .frame.last-chance .btn {
          background: #f5f5f5;
          border: 1px solid #f5f5f5;
          color: #050505;
          border-radius: 0;
          text-transform: none;
          letter-spacing: 0.02em;
          font-size: 14px;
          font-weight: 600;
          padding: 15px 18px;
        }

        .frame.last-chance .btn:hover {
          background: transparent;
          color: #f5f5f5;
          border-color: #f5f5f5;
        }

        .frame.last-chance .btn.ghost {
          background: transparent;
          border-color: rgba(245, 245, 245, 0.4);
          color: rgba(245, 245, 245, 0.88);
          font-weight: 500;
        }

        .frame.last-chance .btn.ghost:hover {
          background: rgba(245, 245, 245, 0.1);
          border-color: rgba(245, 245, 245, 0.9);
          color: #f5f5f5;
        }

        .frame.last-chance .btn.ghost.locked {
          pointer-events: none;
          border-color: rgba(245, 245, 245, 0.25);
          color: rgba(245, 245, 245, 0.55);
        }

        .frame.last-chance .spacer {
          flex: 1;
          min-height: 48px;
        }

        /* Step 5 — timing / Dark Feminine */
        .shell.timing {
          background: #050505;
        }

        .shell.timing::before {
          opacity: 0.06;
          mix-blend-mode: screen;
        }

        .frame.timing {
          background: #050505;
          color: #f5f5f5;
          padding: 28px 20px 28px;
        }

        .frame.timing .meta {
          max-width: 480px;
          width: 100%;
          margin: 0 auto 24px;
          color: #888;
        }

        .step-view.timing-view {
          max-width: 480px;
          width: 100%;
          position: relative;
        }

        .timing-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 500;
          font-size: 48px;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #f5f5f5;
          margin-bottom: 12px;
        }

        .timing-sub {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 28px;
        }

        .timing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          width: 100%;
          margin-bottom: 14px;
        }

        @media (min-width: 480px) {
          .timing-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .slot-btn {
          appearance: none;
          border: 1px solid rgba(245, 245, 245, 0.35);
          background: transparent;
          color: #f5f5f5;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 16px 14px;
          width: 100%;
          cursor: pointer;
          border-radius: 0;
          touch-action: manipulation;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          text-align: center;
        }

        .slot-btn:hover {
          background: #f5f5f5;
          color: #050505;
          border-color: #f5f5f5;
        }

        .slot-btn.custom {
          background: #111111;
          border-style: dashed;
          border-color: rgba(245, 245, 245, 0.4);
          margin-top: 4px;
          letter-spacing: 0.16em;
        }

        .slot-btn.custom:hover {
          background: #f5f5f5;
          color: #050505;
          border-style: solid;
          border-color: #f5f5f5;
        }

        /* Custom time modal */
        .time-modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(5, 5, 5, 0.88);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          padding: 16px;
          animation: rise 0.25s ease-out;
        }

        .time-modal {
          width: 100%;
          max-width: 360px;
          background: #0a0a0a;
          border: 1px solid rgba(245, 245, 245, 0.35);
          border-radius: 0;
          padding: 22px 18px;
        }

        .time-input {
          appearance: none;
          width: 100%;
          background: #050505;
          color: #ffffff;
          border: 1px solid rgba(245, 245, 245, 0.45);
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: -0.01em;
          line-height: 1.35;
          padding: 12px 12px;
          outline: none;
          margin-bottom: 14px;
          touch-action: manipulation;
        }

        .time-input::placeholder {
          color: rgba(245, 245, 245, 0.4);
        }

        .time-input:focus {
          border-color: #f5f5f5;
        }

        .time-modal-actions {
          display: flex;
          gap: 10px;
          width: 100%;
        }

        .time-modal-actions .slot-btn {
          flex: 1;
          padding: 14px 10px;
          letter-spacing: 0.12em;
        }

        .time-modal-actions .slot-btn.primary {
          background: #f5f5f5;
          color: #050505;
          border-color: #f5f5f5;
        }

        .time-modal-actions .slot-btn.primary:hover {
          background: transparent;
          color: #f5f5f5;
        }

        /* Step 6 — transportation / photo background */
        .shell.transport {
          background: #050505;
        }

        .shell.transport::before {
          display: none;
        }

        .frame.transport {
          background: transparent;
          color: #f5f5f5;
          padding: 28px 24px 36px;
          justify-content: center;
          isolation: isolate;
        }

        .frame.transport::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.45) 0%,
              rgba(0, 0, 0, 0.58) 45%,
              rgba(0, 0, 0, 0.72) 100%
            ),
            url('/444.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .frame.transport > * {
          position: relative;
          z-index: 1;
        }

        .frame.transport .meta {
          max-width: 420px;
          width: 100%;
          margin: 0 auto 36px;
          color: rgba(245, 245, 245, 0.5);
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          padding: 0 24px;
          z-index: 2;
          pointer-events: auto;
        }

        .frame.transport .back-btn {
          color: rgba(245, 245, 245, 0.55);
        }

        .frame.transport .back-btn:hover {
          color: #f5f5f5;
        }

        .step-view.transport-view {
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 36px;
          max-width: 420px;
        }

        .transport-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 500;
          font-size: 32px;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: #f5f5f5;
          text-align: center;
          max-width: 340px;
        }

        .transport-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .transport-btn {
          appearance: none;
          width: 100%;
          border: 1px solid rgba(245, 245, 245, 0.55);
          background: transparent;
          color: #f5f5f5;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 16px 18px;
          cursor: pointer;
          border-radius: 0;
          touch-action: manipulation;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }

        .transport-btn:hover {
          background: #f5f5f5;
          color: #050505;
          border-color: #f5f5f5;
        }

        /* Step 7 — contact / Dark Feminine Brutalist */
        .shell.contact {
          background: #050505;
        }

        .shell.contact::before {
          opacity: 0.06;
          mix-blend-mode: screen;
        }

        .frame.contact {
          background: #050505;
          color: #f5f5f5;
          padding: 28px 24px 36px;
          justify-content: flex-start;
        }

        .frame.contact .meta {
          max-width: 420px;
          width: 100%;
          margin: 0 auto 36px;
          color: rgba(245, 245, 245, 0.45);
        }

        .frame.contact .back-btn {
          color: rgba(245, 245, 245, 0.45);
        }

        .frame.contact .back-btn:hover {
          color: #f5f5f5;
        }

        .step-view.contact-view {
          justify-content: center;
          align-items: center;
          gap: 24px;
          max-width: 420px;
          width: 100%;
          text-align: center;
        }

        .contact-prompt {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
          color: rgba(245, 245, 245, 0.78);
          max-width: 320px;
          margin: 0;
        }

        .contact-input {
          appearance: none;
          width: 100%;
          max-width: 360px;
          background: #050505;
          color: #ffffff;
          border: 1px solid rgba(245, 245, 245, 0.45);
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: -0.01em;
          line-height: 1.35;
          padding: 12px 12px;
          outline: none;
          text-align: center;
          touch-action: manipulation;
        }

        .contact-input::placeholder {
          color: rgba(245, 245, 245, 0.35);
        }

        .contact-input:focus {
          border-color: #f5f5f5;
          outline: 1px solid rgba(245, 245, 245, 0.25);
          outline-offset: 0;
        }

        .contact-btn {
          appearance: none;
          width: 100%;
          max-width: 360px;
          background: #f5f5f5;
          color: #050505;
          border: 1px solid #f5f5f5;
          border-radius: 0;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 15px 18px;
          cursor: pointer;
          touch-action: manipulation;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }

        .contact-btn:hover {
          background: transparent;
          color: #f5f5f5;
          border-color: #f5f5f5;
        }

        /* Step 8 — confirmation / white */
        .shell.confirm {
          background: #ffffff;
        }

        .shell.confirm::before {
          opacity: 0.04;
          mix-blend-mode: multiply;
        }

        .frame.confirm {
          background: #ffffff;
          color: #050505;
          padding: 28px 24px 36px;
          justify-content: flex-start;
        }

        .frame.confirm .meta {
          max-width: 420px;
          width: 100%;
          margin: 0 auto 36px;
          color: rgba(5, 5, 5, 0.4);
        }

        .frame.confirm .back-btn {
          color: rgba(5, 5, 5, 0.45);
        }

        .frame.confirm .back-btn:hover {
          color: #050505;
        }

        .step-view.confirm-view {
          justify-content: flex-start;
          gap: 32px;
          max-width: 420px;
          overflow: hidden;
          min-height: 0;
        }

        .confirm-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          flex-shrink: 0;
        }

        .frame.confirm .rule {
          width: 28px;
          background: rgba(5, 5, 5, 0.9);
          margin: 0 0 20px;
        }

        .confirm-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 500;
          font-size: 48px;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #050505;
          margin: 0 0 12px;
        }

        .confirm-title .accent {
          color: #ff003c;
        }

        .confirm-lead {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a8a8a;
          margin: 0 0 24px;
        }

        .confirm-summary {
          width: 100%;
          border-top: 1px solid rgba(5, 5, 5, 0.14);
          padding-top: 16px;
        }

        .confirm-summary-text {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.65;
          color: #050505;
          max-width: 360px;
        }

        .confirm-media {
          width: 100%;
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .confirm-video {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          border-radius: 0;
          border: 1px solid rgba(5, 5, 5, 0.12);
          background: #f5f5f5;
          object-fit: contain;
          cursor: pointer;
        }

        @media (max-height: 700px) {
          .confirm-title {
            font-size: 40px;
          }

          .confirm-lead {
            margin-bottom: 18px;
          }

          .step-view.confirm-view {
            gap: 22px;
          }
        }
      `}</style>

      <div className={`shell${step === 1 ? ' survey' : ''}${step === 2 ? ' reveal' : ''}${step === 3 ? ' last-chance' : ''}${step === 5 ? ' timing' : ''}${step === 6 ? ' transport' : ''}${step === 7 ? ' contact' : ''}${step === 8 ? ' confirm' : ''}`}>
        <div className={`frame${step === 1 ? ' survey' : ''}${step === 2 ? ' reveal' : ''}${step === 3 ? ' last-chance' : ''}${step === 4 ? ' vibes-frame' : ''}${step === 5 ? ' timing' : ''}${step === 6 ? ' transport' : ''}${step === 7 ? ' contact' : ''}${step === 8 ? ' confirm' : ''}`}>
          {step !== 1 && (
            <div className="meta">
              <button type="button" className="back-btn" onClick={goBack}>
                ← Назад
              </button>
              <span>0{step} / 08</span>
            </div>
          )}

          {step === 1 && (
            <div className="survey-view">
              <h1 className="survey-title">Исследование целевой аудитории</h1>
              <p className="survey-text">
                Пожалуйста, пройдите небольшой опрос для моего нового проекта. Это займет не более 1 минуты.
              </p>
              <button
                className="survey-btn"
                onClick={() => {
                  trackAnswer({ started: true });
                  setStep(2);
                }}
              >
                Начать опрос
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-view reveal-copy">
              <div className="reveal-top">
                <div className="rule" />
                <h1 className="title xl">Привет, Надя</h1>
                <p className="subtitle">
                  На самом деле это не{' '}
                  <span className="smiley">кастдев&nbsp;:)</span>
                </p>
                <p className="body">
                  Мы очень классно пообщались на дне рождении и мне это понравилось. Я хочу как минимум предложить повторить и увидеться!
                </p>
              </div>
              <div className="spacer" />
              <div className="actions">
                <button className="btn" onClick={() => {
                  setSkipStyle({});
                  setSkipFleeing(false);
                  setRefuseLabel('Нет, я все таки не хочу');
                  trackAnswer({ accepted: true });
                  setStep(3);
                }}>
                  Да, ты тоже ничего))
                </button>
                <div className="skip-wrap">
                  {skipFleeing && <div className="btn ghost" style={{ visibility: 'hidden', pointerEvents: 'none' }}>Нет, спасибо</div>}
                  <button
                    ref={skipRef}
                    type="button"
                    className={`btn ghost skip-btn${skipFleeing ? ' fleeing' : ''}`}
                    style={skipStyle}
                    onMouseEnter={dodge}
                    onMouseMove={dodge}
                    onTouchStart={dodge}
                    onClick={dodge}
                  >
                    Нет, спасибо
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-view last-chance-view">
              <div className="last-chance-top">
                <div className="rule" />
                <p className="last-chance-text">Ты действительно сказала да?</p>
              </div>
              <div className="spacer" />
              <div className="actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setRefuseLabel('Нет, я все таки не хочу');
                    trackAnswer({ confirmed: true });
                    setStep(4);
                  }}
                >
                  Да, да, да
                </button>
                <button
                  type="button"
                  className={`btn ghost${refuseLabel !== 'Нет, я все таки не хочу' ? ' locked' : ''}`}
                  onClick={handleRefuse}
                >
                  {refuseLabel}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-view vibes">
              <h1 className="title sm">CHOOSE YOUR VIBE</h1>
              <p className="body">Выбери формат. Без компромиссов.</p>
              <div className="grid">
                {vibes.map((v) => (
                  <button
                    key={v.id}
                    className="card"
                    onClick={() => selectVibe(v)}
                  >
                    <span className="card-tag">{v.tag}</span>
                    <span className="card-copy">
                      <span className="card-label">{v.label}</span>
                      <span className="card-desc">{v.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="step-view timing-view">
              <h1 className="timing-title">TIME</h1>
              <p className="timing-sub">Выбери удобный день и время.</p>
              <div className="timing-grid">
                {timeSlots.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="slot-btn"
                    onClick={() => selectTime(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="slot-btn custom"
                onClick={() => setShowCustomTime(true)}
              >
                ПРЕДЛОЖИТЬ СВОЕ ВРЕМЯ
              </button>

              {showCustomTime && (
                <div className="time-modal-overlay">
                  <div className="time-modal">
                    <input
                      className="time-input"
                      type="text"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      placeholder="Введи свое время"
                      autoFocus
                    />
                    <div className="time-modal-actions">
                      <button
                        type="button"
                        className="slot-btn"
                        onClick={() => setShowCustomTime(false)}
                      >
                        НАЗАД
                      </button>
                      <button
                        type="button"
                        className="slot-btn primary"
                        onClick={submitCustomTime}
                      >
                        ДАЛЕЕ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="step-view transport-view">
              <h1 className="transport-title">За тобой зайти или заехать?</h1>
              <div className="transport-actions">
                <button
                  type="button"
                  className="transport-btn"
                  onClick={() => chooseTransport('pickup')}
                >
                  ЗАЙТИ
                </button>
                <button
                  type="button"
                  className="transport-btn"
                  onClick={() => chooseTransport('drive')}
                >
                  ЗАЕХАТЬ
                </button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="step-view contact-view">
              <p className="contact-prompt">Оставь, пожалуйста, свой контакт для связи.</p>
              <input
                className="contact-input"
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value.replace(/[^a-zA-Z0-9@._+\-]/g, ''))}
                placeholder="Пример: nadiakapshul"
                autoFocus
                inputMode="latin"
                lang="en"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button type="button" className="contact-btn" onClick={submitContact}>
                ДАЛЕЕ
              </button>
            </div>
          )}

          {step === 8 && (
            <div className="step-view confirm-view">
              <div className="confirm-top">
                <div className="rule" />
                <h1 className="confirm-title">
                  Accepted<span className="accent">.</span>
                </h1>
                <p className="confirm-lead">Инвестировала в золото</p>
                {summarySentence && (
                  <div className="confirm-summary">
                    <p className="confirm-summary-text">{summarySentence}</p>
                  </div>
                )}
              </div>
              <div className="confirm-media">
                <video
                  ref={videoRef}
                  className="confirm-video"
                  autoPlay
                  loop
                  playsInline
                  onClick={toggleVideoPlayback}
                >
                  <source src="/video.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
