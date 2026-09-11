"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import bubbly from "../bubbly.json";
import kumbidi from "../asset/kumbidi.jpeg";
import abu from "../asset/arackkal abu.jpeg";
import dinesh from "../asset/dineshh.jpeg";
import raja from "../asset/raja.jpeg";
import rangannan from "../asset/rangannan.jpeg";

type Character = { name: string; image: StaticImageData };

const characters: Character[] = [
  { name: "Kumbidi", image: kumbidi },
  { name: "Arackkal Abu", image: abu },
  { name: "Dinesh", image: dinesh },
  { name: "Raja", image: raja },
  { name: "Rangannan", image: rangannan },
];

const bubbleCount = 25;

export default function Home() {
  const [screen, setScreen] = useState<"select" | "game">("select");
  const [selected, setSelected] = useState(0);
  const [hiddenBubble, setHiddenBubble] = useState(12);
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(15);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<"ready" | "searching" | "found" | "timeout">("ready");
  const [comment, setComment] = useState<string>("");

  const deadline = useRef(0);
  const character = characters[selected];

  // Load comment when character is found or time runs out
  useEffect(() => {
    if ((result === "found" || result === "timeout") && bubbly && character) {
      const charData = (bubbly as Record<string, any>)[character.name];
      if (charData) {
        if (typeof charData === "string") {
          setComment(charData);
        } else if (result === "found") {
          setComment(charData.win || "");
        } else if (result === "timeout") {
          setComment(charData.lose || "");
        }
      }
    } else {
      setComment("");
    }
  }, [result, character]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadline.current - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
      if (remaining === 0) {
        setPlaying(false);
        setResult("timeout");
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  const beginGame = () => {
    setScreen("game");
    setHiddenBubble(Math.floor(Math.random() * bubbleCount));
    setPopped(new Set());
    setTimeLeft(15);
    setPlaying(true);
    setResult("searching");
    deadline.current = Date.now() + 15_000;
  };

  const popBubble = (index: number) => {
    if (!playing || popped.has(index)) return;
    setPopped((current) => new Set(current).add(index));
    if (index === hiddenBubble) {
      setPlaying(false);
      setResult("found");
    }
  };

  const message = {
    ready: "Choose a character to begin",
    searching: "Pop it till you find them",
    found: `You found ${character.name}!`,
    timeout: `Time's up — ${character.name} was here`,
  }[result];

  if (screen === "select") {
    return (
      <main className="paper selectionPage">
        <header className="titleBlock">
          <p>NOSTALGIC REPLICA</p>
          <h1>thottaal potti</h1>
          <span aria-hidden="true" />
        </header>

        <section className="selectionLayout">
          <nav className="characterList" aria-label="Choose a movie character">
            <p>movie characters</p>
            {characters.map((item, index) => (
              <button
                key={item.name}
                className={selected === index ? "selected" : ""}
                onClick={() => setSelected(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="characterPreview">
            <div className="photoFrame">
              <Image src={character.image} alt={character.name} priority sizes="(max-width: 700px) 82vw, 430px" />
            </div>
            <div className="caption">
              <p>you picked</p>
              <h2>{character.name}</h2>
            </div>
          </div>

          <aside className="selectionNote">
            <p>movie character<br />in these bubbles</p>
            <p>× pop it till you find</p>
            <button onClick={beginGame}>start popping →</button>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="paper gamePage">
      <header className="gameHeader">
        <button onClick={() => setScreen("select")}>← characters</button>
        <div className="miniTitle"><small>NOSTALGIC REPLICA</small><strong>thottaal potti</strong></div>
        <div className={`timer ${timeLeft <= 5 ? "urgent" : ""}`}><span>{timeLeft}</span> seconds</div>
      </header>

      <section className="gameLayout">
        <aside className="targetCard">
          <p>find this character</p>
          <div className="targetPhoto"><Image src={character.image} alt={character.name} sizes="180px" /></div>
          <h2>{character.name}</h2>
          <p className="tiny">one character<br />one bubble</p>
        </aside>

        <div className="boardColumn">
          <div className="bubbleSheet" aria-label="Bubble wrap game board">
            {Array.from({ length: bubbleCount }, (_, index) => {
              const isPopped = popped.has(index);
              const isCharacter = index === hiddenBubble && (isPopped || result === "timeout");
              return (
                <button
                  key={index}
                  className={`bubble ${isPopped ? "popped" : ""} ${isCharacter ? "revealed" : ""}`}
                  onClick={() => popBubble(index)}
                  disabled={!playing || isPopped}
                  aria-label={`Pop bubble ${index + 1}`}
                >
                  {isCharacter && <Image src={character.image} alt="" fill sizes="80px" />}
                </button>
              );
            })}
          </div>
          <div className="statusLine"><span>{message}</span><b>{String(popped.size).padStart(2, "0")} / 25 popped</b></div>
          {(result === "found" || result === "timeout") && <button className="again" onClick={beginGame}>play again →</button>}
        </div>

        {(result === "found" || result === "timeout") && (
          <div className="popOverlay" onClick={() => setResult("searching")}>
            <div className="characterPopCard" onClick={(e) => e.stopPropagation()}>
              <div className="popPhotoFrame">
                <Image src={character.image} alt={character.name} width={200} height={200} priority />
              </div>
              <h3 className="popTitle">
                {result === "found" ? `Found ${character.name}!` : `Time's up!`}
              </h3>
              {comment && <p className="commentBox">“{comment}”</p>}
              <button className="popAgainBtn" onClick={beginGame}>
                {result === "found" ? "Play Again →" : "Try Again →"}
              </button>
            </div>
          </div>
        )}

        <aside className="instructions">
          <p>movie character<br />in these bubbles</p>
          <p>× pop it till you find</p>
          <button onClick={() => setScreen("select")}>change character →</button>
        </aside>
      </section>

      <footer>Puli Murugan — Junglee Sher!</footer>
    </main>
  );
}
