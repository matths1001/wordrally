// WordRally – Highscore-Board mit Top 10 Ergebnissen

import { useState, useEffect, useRef } from "react";

const wordLists = {
  de: {
    5: ["apfel", "blume", "stuhl", "glas"],
    6: ["banane", "fenster", "kerzen"],
    7: ["schacht", "dunkler"],
    8: ["flugzeug", "computer"]
  },
  en: {
    5: ["apple", "chair", "stone", "plant"],
    6: ["window", "banana", "bottle"],
    7: ["laptop", "glasses"],
    8: ["backpack", "dinosaur"]
  }
};

const successSound = typeof Audio !== "undefined" ? new Audio("/success.mp3") : null;
const failSound = typeof Audio !== "undefined" ? new Audio("/fail.mp3") : null;

export default function WordRally() {
  const [language, setLanguage] = useState("de");
  const [length, setLength] = useState(5);
  const [target, setTarget] = useState("");
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [highscore, setHighscore] = useState(null);
  const [highscores, setHighscores] = useState([]);
  const [newHighscore, setNewHighscore] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [lastScore, setLastScore] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const inputRef = useRef(null);

  const startNewGame = () => {
    const words = wordLists[language][length];
    const random = words[Math.floor(Math.random() * words.length)];
    setTarget(random);
    setHistory([]);
    setGuess("");
    setError("");
    setGameOver(false);
    setStartTime(Date.now());
    setNow(Date.now());
    setEndTime(null);
    setNewHighscore(false);
    setLastScore(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    startNewGame();
    const saved = localStorage.getItem("wordrally_highscore");
    if (saved) setHighscore(JSON.parse(saved));
    const savedList = localStorage.getItem("wordrally_highscore_list");
    if (savedList) setHighscores(JSON.parse(savedList));
  }, [language, length]);

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [gameOver]);

  const handleGuess = () => {
    if (gameOver) return;
    if (guess.length !== length) {
      setError(`Das Wort muss genau ${length} Buchstaben haben.`);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setError("");
    const result = [];
    const used = Array(length).fill(false);

    for (let i = 0; i < length; i++) {
      if (guess[i] === target[i]) {
        result.push({ letter: guess[i], status: "correct" });
        used[i] = true;
      } else {
        result.push({ letter: guess[i], status: "" });
      }
    }

    for (let i = 0; i < length; i++) {
      if (result[i].status === "") {
        let found = false;
        for (let j = 0; j < length; j++) {
          if (!used[j] && guess[i] === target[j]) {
            found = true;
            used[j] = true;
            break;
          }
        }
        result[i].status = found ? "misplaced" : "wrong";
      }
    }

    const newHistory = [...history, result];
    setHistory(newHistory);
    setGuess("");

    const isCorrect = result.every((r) => r.status === "correct");
    const isLastAttempt = newHistory.length >= 6;

    if (isCorrect || isLastAttempt) {
      const finish = Date.now();
      setEndTime(finish);
      setGameOver(true);

      const time = Math.floor((finish - startTime) / 1000);
      const attempts = newHistory.length;
      const score = (6 - attempts) * 10 - Math.floor(time / 10);
      let stars = 1;
      if (attempts <= 3) stars = 3;
      else if (attempts <= 5) stars = 2;

      const current = { name: playerName || "Spieler", score, attempts, time, stars };
      setLastScore(current);

      if (isCorrect && successSound) successSound.play();
      if (!isCorrect && isLastAttempt && failSound) failSound.play();

      if (!highscore || score > highscore.score || (score === highscore.score && time < highscore.time)) {
        localStorage.setItem("wordrally_highscore", JSON.stringify(current));
        setHighscore(current);
        setNewHighscore(true);
      }

      const updatedList = [...highscores, current]
        .sort((a, b) => b.score - a.score || a.time - b.time)
        .slice(0, 10);
      setHighscores(updatedList);
      localStorage.setItem("wordrally_highscore_list", JSON.stringify(updatedList));
    }
  };
