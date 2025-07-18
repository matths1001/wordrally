// WordRally – Verbesserungen: Live-Timer, Highscore-Anzeige, Reset-Fehlermeldung, Responsiveness, Highscore bei Spielstart

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
  const [newHighscore, setNewHighscore] = useState(false);
  const [now, setNow] = useState(Date.now());

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
  };

  useEffect(() => {
    startNewGame();
    const saved = localStorage.getItem("wordrally_highscore");
    if (saved) setHighscore(JSON.parse(saved));
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
      if (
        !highscore ||
        score > highscore.score ||
        (score === highscore.score && time < highscore.time)
      ) {
        localStorage.setItem("wordrally_highscore", JSON.stringify(current));
        setHighscore(current);
        setNewHighscore(true);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGuess();
  };

  const getElapsedSeconds = () => {
    if (!startTime) return 0;
    return Math.floor(((endTime ?? now) - startTime) / 1000);
  };

  return (
    <div className="min-h-screen bg-[#f5efe0] text-gray-800 font-sans p-4 sm:p-6">
      <style>{`
        .shake {
          animation: shake 0.3s;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .flip {
          animation: flip 0.6s ease forwards;
          transform-style: preserve-3d;
        }
        @keyframes flip {
          0% { transform: scale(0.95) rotateX(0); opacity: 0.3; }
          50% { transform: scale(1.05) rotateX(180deg); opacity: 0.6; }
          100% { transform: scale(1) rotateX(360deg); opacity: 1; }
        }
        .tile {
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .tile.correct { background-color: #4caf50; }
        .tile.misplaced { background-color: #fb8c00; }
        .tile.wrong { background-color: #c7bfb3; }
      `}</style>

      <h1 className="text-4xl mb-2 sm:mb-3 border-b border-yellow-400 pb-2">WordRally</h1>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mb-3 space-y-1 sm:space-y-0">
        <p>Versuche: {history.length} / 6</p>
        <p>Zeit: {getElapsedSeconds()}s</p>
        {highscore && (
          <p>🏆 Highscore: ⭐ {highscore.stars} · 🔢 {highscore.score} · ⏱ {highscore.time}s</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white text-gray-700 p-2 border border-yellow-300 rounded">
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
        <select value={length} onChange={(e) => setLength(Number(e.target.value))} className="bg-white text-gray-700 p-2 border border-yellow-300 rounded">
          {[5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} Buchstaben</option>)}
        </select>
      </div>

      <div className="mb-6">
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value.toLowerCase())}
          onKeyDown={handleKeyDown}
          maxLength={length}
          disabled={gameOver}
          className={`bg-white text-gray-800 border ${error ? "border-red-400" : "border-yellow-300"} w-full p-2 rounded ${shake ? "shake" : ""}`}
          placeholder="Dein Wort"
        />
        <button onClick={handleGuess} disabled={gameOver} className="mt-3 bg-yellow-400 hover:bg-yellow-500 w-full py-2 text-lg font-bold text-white rounded">
          Raten
        </button>
        {gameOver && (
          <button onClick={startNewGame} className="mt-3 bg-gray-300 hover:bg-gray-400 w-full py-2 text-md font-bold text-gray-800 rounded">
            🔁 Neues Spiel starten
          </button>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {gameOver && (
          <div className="text-center mt-4 font-bold">
            {history[history.length - 1].every((l) => l.status === "correct") ? (
              <>
                🎉 Glückwunsch!<br/>
                ⭐ Sterne: {highscore?.stars} <br/>
                🔢 Punkte: {highscore?.score} <br/>
                ⏱ Zeit: {highscore?.time}s <br/>
                {newHighscore && <p className="text-green-600 mt-2">🏆 Neuer Highscore!</p>}
              </>
            ) : (
              <p>❌ Leider verloren. Das Wort war: {target.toUpperCase()}</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-yellow-200 p-4 rounded space-y-2">
        {history.length === 0 && <p className="text-gray-500">Gib dein erstes Wort ein!</p>}
        {history.map((attempt, i) => (
          <div key={i} className="flex gap-1 sm:gap-2 justify-center">
            {attempt.map((entry, j) => (
              <div key={j} style={{ animationDelay: `${j * 0.1}s` }} className={`tile flip w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold text-lg sm:text-xl rounded ${entry.status}`}>
                {entry.letter.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

