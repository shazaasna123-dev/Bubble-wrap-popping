"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Character = {
  name: string;
  foundImage: string;
  timeoutImage: string;
  foundText: string;
  timeoutText: string;
};

const characters: Character[] = Array.from({ length: 7 }, (_, index) => ({
  name: `Character ${index + 1}`,
  foundImage: "",
  timeoutImage: "",
  foundText: "A little luck, a perfect pop. You found the hidden star!",
  timeoutText: "So close! I was hiding right here. Want another take?",
}));

const BUBBLE_COUNT = 63;
const ROUND_SECONDS = 30;

export default function Home() {
  const [round, setRound] = useState(0);
  const [active, setActive] = useState(false);
  const [hiddenBubble, setHiddenBubble] = useState(0);
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [result, setResult] = useState<"won" | "timeout" | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const deadlineRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const character = characters[round];

  const finishRound = useCallback((outcome: "won" | "timeout") => {
    setActive(false);
    setResult(outcome);
    if (outcome === "timeout") setTimeLeft(0);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());
      setTimeLeft(remaining / 1000);
      if (remaining === 0) finishRound("timeout");
    }, 50);
    return () => window.clearInterval(timer);
  }, [active, finishRound]);

  const playPop = () => {
    if (!soundOn) return;
    try {
      const AudioContextClass = window.AudioContext;
      audioRef.current ??= new AudioContextClass();
      const audio = audioRef.current;
      void audio.resume();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.frequency.setValueAtTime(480, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(70, audio.currentTime + 0.085);
      gain.gain.setValueAtTime(0.15, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.09);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.1);
    } catch {
      // The game remains playable when audio is unavailable.
    }
  };

  const resetBoard = useCallback(() => {
    setActive(false);
    setPopped(new Set());
    setTimeLeft(ROUND_SECONDS);
    setResult(null);
  }, []);

  const startRound = () => {
    setHiddenBubble(Math.floor(Math.random() * BUBBLE_COUNT));
    setPopped(new Set());
    setTimeLeft(ROUND_SECONDS);
    setResult(null);
    deadlineRef.current = Date.now() + ROUND_SECONDS * 1000;
    setActive(true);
  };

  const popBubble = (index: number) => {
    if (!active || popped.has(index)) return;
    if (Date.now() >= deadlineRef.current) {
      finishRound("timeout");
      return;
    }
    playPop();
    setPopped((current) => new Set(current).add(index));
    if (index === hiddenBubble) finishRound("won");
  };

  const nextRound = () => {
    setRound((current) => (current + 1) % characters.length);
    resetBoard();
  };

  const image = result === "won" ? character.foundImage : character.timeoutImage;
  const progress = Math.max(0, Math.min(100, (timeLeft / ROUND_SECONDS) * 100));

  return (
    <main>
      <header>
        <div className="brand">bublyyy<span>✳</span></div>
        <span className="edition">THE MOVIE EDITION</span>
        <button className="sound" onClick={() => setSoundOn((value) => !value)} aria-pressed={soundOn}>
          Sound {soundOn ? "on" : "off"} ♫
        </button>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">A LITTLE LUCK. A LOT OF POP.</p>
          <h1>Big screen.<br />Little bubbles<span>.</span></h1>
        </div>
        <p className="description">Somewhere in this wrap, a character is hiding.<br />You&apos;ve got 30 seconds. Make every pop count.</p>
      </section>

      <section className="game">
        <aside>
          <div className="roundLabel">NOW PLAYING <span>{String(round + 1).padStart(2, "0")} / 07</span></div>
          <h2>Find the<br />hidden star.</h2>
          <div className="mystery">?<span>WHO&apos;S UNDER THE WRAP?</span></div>
          <p>One character. One bubble.<br />Go with your gut.</p>
          <div className="rules"><span>01</span> Start the clock<br /><span>02</span> Pop any bubble<br /><span>03</span> Find your character</div>
          <p className="demoNote">Preview cast · Your movie images are coming soon.</p>
        </aside>

        <div className="play">
          <div className="toolbar">
            <div><span className="liveDot" />{active ? "FIND THE HIDDEN STAR" : result === "won" ? "STAR FOUND!" : result === "timeout" ? "TIME’S UP" : "READY WHEN YOU ARE"}</div>
            <div className="timer"><strong>{String(Math.ceil(timeLeft)).padStart(2, "0")}</strong><small>SEC</small></div>
          </div>
          <div className="timeTrack"><div style={{ width: `${progress}%` }} className={timeLeft < 10 ? "urgent" : ""} /></div>
          <div className="boardWrap">
            <div className="board" aria-label="Bubble wrap game board">
              {Array.from({ length: BUBBLE_COUNT }, (_, index) => (
                <button
                  key={index}
                  className={`bubble ${popped.has(index) ? "popped" : ""}`}
                  disabled={!active || popped.has(index)}
                  aria-label={`Pop bubble ${index + 1}`}
                  onClick={() => popBubble(index)}
                />
              ))}
            </div>
            {!active && !result && (
              <div className="startPanel">
                <span className="pill">30 SECONDS · 1 HIDDEN STAR</span>
                <h2>Ready to make<br />some noise?</h2>
                <p>Tap. Pop. Find out who&apos;s hiding.</p>
                <button className="primary" onClick={startRound}>Let&apos;s pop <span>↗</span></button>
              </div>
            )}
          </div>
          <div className="boardBottom"><span><b>{String(popped.size).padStart(2, "0")}</b> bubbles popped</span><button onClick={resetBoard}>↻ New round</button></div>
        </div>
      </section>

      <footer><span>Less scrolling. More popping.</span><span>7 CHARACTERS. 7 LITTLE SURPRISES. ✳</span></footer>

      {result && (
        <div className="modalBackdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="result-title">
            <div className="resultArt">
              {image ? <img src={image} alt={character.name} /> : <span>{result === "won" ? "★" : "✳"} {character.name} · {result === "won" ? "reveal" : "alternate"} image</span>}
            </div>
            <p className="eyebrow">{result === "won" ? "THAT WAS A STAR-WORTHY POP" : "TIME’S UP. HERE’S YOUR STAR."}</p>
            <h2 id="result-title">{result === "won" ? `You found ${character.name}!` : character.name}</h2>
            <p>{result === "won" ? character.foundText : character.timeoutText}</p>
            <button className="primary resultButton" onClick={nextRound}>{round === 6 ? "Play again" : "Next character"} ↗</button>
            <button className="secondary" onClick={resetBoard}>Try this character again</button>
          </section>
        </div>
      )}
    </main>
  );
}
