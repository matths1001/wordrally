// WordRally – Highscore-Board mit Top 10 Ergebnissen

import { useState, useEffect } from "react";

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

      const current = { score, attempts, time, stars };
      setLastScore(current);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGuess();
  };

  const getElapsedSeconds = () => {
    if (!startTime) return 0;
    return Math.floor(((endTime ?? now) - startTime) / 1000);
  };

  const renderStars = (num) => "⭐".repeat(num);

  return (
    <div className="min-h-screen bg-[#f5efe0] text-gray-800 font-sans p-4 sm:p-6">
      <h1 className="text-4xl mb-2 sm:mb-3 border-b border-yellow-400 pb-2">WordRally</h1>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mb-3 space-y-1 sm:space-y-0">
        <p>Versuche: {history.length} / 6</p>
        <p>Zeit: {getElapsedSeconds()}s</p>
        {highscore && (
          <p>🏆 Highscore: {renderStars(highscore.stars)} · 🔢 {highscore.score} · ⏱ {highscore.time}s</p>
        )}
      </div>

      {/* Highscore-Liste */}
      {highscores.length > 0 && (
        <div className="bg-white border border-yellow-200 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">🏅 Top 10 Highscores</h2>
          <ol className="list-decimal pl-5 space-y-1">
            {highscores.map((s, i) => (
              <li key={i}>
                {renderStars(s.stars)} · 🔢 {s.score} · ⏱ {s.time}s
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ...Rest bleibt unverändert... */}
    </div>
  );
}
