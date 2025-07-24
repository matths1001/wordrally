// WordRally – Highscore-Board mit Top 10 Ergebnissen und Einstellungsmenü

import { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";

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
  const [soundOn, setSoundOn] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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
    const savedSound = localStorage.getItem("wordrally_sound_on");
    if (savedSound !== null) setSoundOn(savedSound === "true");
    const savedTimer = localStorage.getItem("wordrally_show_timer");
    if (savedTimer !== null) setShowTimer(savedTimer === "true");
    const savedMode = localStorage.getItem("wordrally_dark_mode");
    if (savedMode !== null) setDarkMode(savedMode === "true");
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

      if (isCorrect && soundOn && successSound) successSound.play();
      if (!isCorrect && isLastAttempt && soundOn && failSound) failSound.play();

      setTimeout(() => {
        const name = prompt("Du hast einen Highscore erreicht! Wie heißt du?") || "Spieler";
        const current = { name, score, attempts, time, stars };
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
      }, 300);
    }
  };

  return (
    <main className={`p-4 font-sans text-center min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-beige-100 text-gray-900"}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">WordRally</h1>
        <button
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <Settings />
        </button>
      </div>

      {settingsOpen && (
        <div className="mb-4 border p-4 rounded shadow bg-white dark:bg-gray-800">
          <div className="mb-2">
            <label className="mr-2">🎵 Soundeffekte:</label>
            <input type="checkbox" checked={soundOn} onChange={(e) => {
              const value = e.target.checked;
              setSoundOn(value);
              localStorage.setItem("wordrally_sound_on", value);
            }} />
          </div>
          <div className="mb-2">
            <label className="mr-2">⏱ Timer anzeigen:</label>
            <input type="checkbox" checked={showTimer} onChange={(e) => {
              const value = e.target.checked;
              setShowTimer(value);
              localStorage.setItem("wordrally_show_timer", value);
            }} />
          </div>
          <div>
            <label className="mr-2">🌙 Dark Mode:</label>
            <input type="checkbox" checked={darkMode} onChange={(e) => {
              const value = e.target.checked;
              setDarkMode(value);
              localStorage.setItem("wordrally_dark_mode", value);
            }} />
          </div>
        </div>
      )}

      {!settingsOpen && (
        <>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              className={`p-2 border rounded w-1/2 text-center text-xl ${shake ? "animate-shake" : ""}`}
              value={guess}
              onChange={(e) => setGuess(e.target.value.toLowerCase())}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              disabled={gameOver}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>

          <div className="space-y-2 mb-4">
            {history.map((row, i) => (
              <div key={i} className="flex justify-center space-x-2">
                {row.map((cell, j) => (
                  <span
                    key={j}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-lg font-bold ${
                      cell.status === "correct"
                        ? "bg-green-500 text-white"
                        : cell.status === "misplaced"
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {cell.letter}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {showTimer && !gameOver && (
            <p className="mb-4 text-lg">⏱ Zeit: {Math.floor((now - startTime) / 1000)}s</p>
          )}

          {gameOver && (
            <button
              onClick={startNewGame}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔁 Neu starten
            </button>
          )}

          <div className="text-left max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-2">🏆 Highscores</h2>
            <ol className="list-decimal ml-4">
              {highscores.map((entry, index) => (
                <li key={index} className="mb-1">
                  ⭐{entry.stars} – {entry.name} – {entry.score} Punkte – {entry.attempts} Versuche – {entry.time}s
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </main>
  );
}

