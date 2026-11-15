import React, { useState, useRef } from 'react';

export default function App() {
  const [step, setStep] = useState(1);
  const [skipStyle, setSkipStyle] = useState({});
  const [skipFleeing, setSkipFleeing] = useState(false);
  const skipRef = useRef(null);
  const lastDodgeRef = useRef(0);

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
      desc: 'В этом что-то есть',
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
          gap: 12px;
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
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #8a8a8a;
          flex-shrink: 0;
        }

        .card:hover .card-tag { color: #b0b0b0; }

        .card-label {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 10px;
          color: #050505;
          min-height: 2.4em;
        }

        .card:hover .card-label { color: #ffffff; }

        .card-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          line-height: 1.45;
          color: #555;
          font-weight: 400;
          margin-top: auto;
        }

        .card:hover .card-desc { color: rgba(245, 245, 245, 0.75); }

        .card-copy {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

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
          margin-bottom: 22px;
          max-width: 320px;
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

        /* Step 4 — timing / Dark Feminine */
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
      `}</style>

      <div className={`shell${step === 1 ? ' survey' : ''}${step === 2 ? ' reveal' : ''}${step === 4 ? ' timing' : ''}`}>
        <div className={`frame${step === 1 ? ' survey' : ''}${step === 2 ? ' reveal' : ''}${step === 3 ? ' vibes-frame' : ''}${step === 4 ? ' timing' : ''}`}>
          {step !== 1 && (
            <div className="meta">
              <span>UXR / ARCHIVE</span>
              <span>0{step} / 05</span>
            </div>
          )}

          {step === 1 && (
            <div className="survey-view">
              <h1 className="survey-title">Исследование целевой аудитории</h1>
              <p className="survey-text">
                Пожалуйста, пройдите небольшой опрос (Customer Development) для нашего нового проекта. Это займет не более 1 минуты.
              </p>
              <button className="survey-btn" onClick={() => setStep(2)}>
                Начать опрос
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-view reveal-copy">
              <div className="reveal-top">
                <div className="rule" />
                <h1 className="title xl">Привет.</h1>
                <p className="subtitle">На самом деле это не кастдев :)</p>
                <p className="body">
                  Мы очень классно пообщались на дне рождения и мне понравилось это, я хочу как минимум предложить повторить и увидеться!
                </p>
              </div>
              <div className="spacer" />
              <div className="actions">
                <button className="btn" onClick={() => {
                  setSkipStyle({});
                  setSkipFleeing(false);
                  setStep(3);
                }}>
                  Да, ты тоже ничего))
                </button>
                <div className="skip-wrap">
                  {skipFleeing && <div className="btn ghost" style={{ visibility: 'hidden', pointerEvents: 'none' }}>нет, спасибо</div>}
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
                    нет, спасибо
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-view vibes">
              <h1 className="title sm">CHOOSE YOUR VIBE</h1>
              <p className="body">Выбери формат. Без компромиссов.</p>
              <div className="grid">
                {vibes.map((v) => (
                  <button
                    key={v.id}
                    className="card"
                    onClick={() => setStep(4)}
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

          {step === 4 && (
            <div className="step-view timing-view">
              <h1 className="timing-title">TIMING.</h1>
              <p className="timing-sub">Выбери удобный день и время.</p>
              <div className="timing-grid">
                {timeSlots.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="slot-btn"
                    onClick={() => setStep(5)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="slot-btn custom"
                onClick={() => setStep(5)}
              >
                ПРЕДЛОЖИТЬ СВОЕ ВРЕМЯ
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="step-view">
              <div className="rule" />
              <h1 className="title xl">
                Accepted<span className="accent">.</span>
              </h1>
              <p className="body">
                Сигнал получен. Детали — позже.
              </p>
              <div className="spacer" />
              <div className="footer-line">
                <button className="btn tiny" onClick={() => {
                  setSkipStyle({});
                  setSkipFleeing(false);
                  setStep(1);
                }}>
                  reset sequence
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
