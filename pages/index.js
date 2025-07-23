// WordRally – Spiel + Einstellungen kombiniert

import { useState, useEffect, useRef } from "react";
import { Settings2 } from "lucide-react";

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

let successSound = null;
let failSound = null;

if (typeof window !== "undefined") {
  successSound = new Audio("/success.mp3");
  failSound = new Audio("/fail.mp3");
}

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
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  return (
    <main className="p-4 font-sans text-center">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">WordRally</h1>
        <button onClick={() => setSettingsOpen(!settingsOpen)} className="hover:opacity-70">
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      {settingsOpen && (
        <div className="bg-white shadow-md rounded p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Einstellungen</h2>
          <label className="block mb-2">
            Sprache:
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="ml-2 border rounded">
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
            </select>
          </label>
          <label className="block mb-2">
            Wortlänge:
            <select value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="ml-2 border rounded">
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
          </label>
          <label className="block mb-2">
            Spielername:
            <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="ml-2 border rounded px-2" />
          </label>
        </div>
      )}

      {/* Spielbereich */}
      <div className="mb-4">
        {!gameOver && <p className="mb-2">Versuch {history.length + 1} von 6</p>}
        <input
          ref={inputRef}
          value={guess}
          onChange={(e) => setGuess(e.target.value.toLowerCase())}
          onKeyDown={(e) => e.key === "Enter" && handleGuess()}
          disabled={gameOver}
          className={`border p-2 rounded w-48 mb-2 ${shake ? "animate-shake" : ""}`}
          placeholder="Dein Wort"
        />
        <br />
        <button onClick={handleGuess} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Prüfen
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="space-y-2 mb-4">
        {history.map((row, i) => (
          <div key={i} className="flex justify-center space-x-1">
            {row.map((r, j) => (
              <span
                key={j}
                className={`px-2 py-1 rounded text-white font-bold ${
                  r.status === "correct"
                    ? "bg-green-500"
                    : r.status === "misplaced"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }`}
              >
                {r.letter}
              </span>
            ))}
          </div>
        ))}
      </div>

      {gameOver && lastScore && (
        <div className="mb-4">
          <p>⭐️ Sterne: {"★".repeat(lastScore.stars)}</p>
          <p>🏁 Versuche: {lastScore.attempts} | ⏱️ Zeit: {lastScore.time}s | 🔢 Punkte: {lastScore.score}</p>
          <button onClick={startNewGame} className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Neu starten
          </button>
        </div>
      )}

      <div className="text-left max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">🏆 Highscores</h2>
        <ol className="space-y-1">
          {highscores.map((entry, i) => (
            <li key={i}>
              {i + 1}. {entry.name} – {entry.score} Punkte ({entry.attempts} Versuche, {entry.time}s, {"★".repeat(entry.stars)})
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

