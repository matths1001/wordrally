// WordRally – Flip-Animation mit modernem Farbschema ohne Glow

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

  useEffect(() => {
    const words = wordLists[language][length];
    const random = words[Math.floor(Math.random() * words.length)];
    setTarget(random);
    setHistory([]);
    setGuess("");
    setError("");
  }, [language, length]);

  const handleGuess = () => {
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

    setHistory([...history, result]);
    setGuess("");
  };

  const getColor = (status) => {
    switch (status) {
      case "correct": return "bg-emerald-600";
      case "misplaced": return "bg-amber-400";
      case "wrong": return "bg-zinc-700";
      default: return "bg-black";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-mono p-6">
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
        .tile.correct {
          background-color: #059669; /* emerald-600 */
        }
        .tile.misplaced {
          background-color: #f59e0b; /* amber-400 */
        }
        .tile.wrong {
          background-color: #3f3f46; /* zinc-700 */
        }
      `}</style>

      <h1 className="text-4xl mb-6 border-b border-emerald-500 pb-2">WordRally 🟢</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-zinc-800 text-white p-2 border border-zinc-600 rounded"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
        <select
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="bg-zinc-800 text-white p-2 border border-zinc-600 rounded"
        >
          {[5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>{n} Buchstaben</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value.toLowerCase())}
          onKeyDown={handleKeyDown}
          maxLength={length}
          className={`bg-zinc-800 text-white border ${error ? "border-red-500" : "border-zinc-600"} w-full p-2 rounded ${shake ? "shake" : ""}`}
          placeholder="Dein Wort"
        />
        <button
          onClick={handleGuess}
          className="mt-3 bg-emerald-600 hover:bg-emerald-700 w-full py-2 text-lg font-bold rounded"
        >
          Raten
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-zinc-800 border border-zinc-700 p-4 rounded space-y-2">
        {history.length === 0 && <p className="text-neutral-400">Gib dein erstes Wort ein!</p>}
        {history.map((attempt, i) => (
          <div key={i} className="flex gap-2">
            {attempt.map((entry, j) => (
              <div
                key={j}
                style={{ animationDelay: `${j * 0.1}s` }}
                className={`tile flip w-10 h-10 flex items-center justify-center text-white font-bold text-xl rounded ${entry.status}`}
              >
                {entry.letter.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

