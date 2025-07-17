// WordRally – mit Retro-Styling und verbessertem Layout

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  useEffect(() => {
    const words = wordLists[language][length];
    const random = words[Math.floor(Math.random() * words.length)];
    setTarget(random);
  }, [language, length]);

  const handleGuess = () => {
    if (guess.length !== length) return;
    let correct = 0;
    let inPlace = 0;
    const used = Array(length).fill(false);

    for (let i = 0; i < length; i++) {
      if (guess[i] === target[i]) {
        inPlace++;
        used[i] = true;
      }
    }

    for (let i = 0; i < length; i++) {
      if (guess[i] !== target[i]) {
        for (let j = 0; j < length; j++) {
          if (!used[j] && guess[i] === target[j]) {
            correct++;
            used[j] = true;
            break;
          }
        }
      }
    }

    setHistory([...history, { guess, inPlace, correct }]);
    setGuess("");
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <h1 className="text-4xl mb-6 border-b border-green-700 pb-2">WordRally 🟢</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-900 text-green-300 p-2 border border-green-600 rounded"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
        <select
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="bg-gray-900 text-green-300 p-2 border border-green-600 rounded"
        >
          {[5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>{n} Buchstaben</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <Input
          value={guess}
          onChange={(e) => setGuess(e.target.value.toLowerCase())}
          maxLength={length}
          className="bg-gray-900 text-green-400 border border-green-600 w-full p-2"
          placeholder="Dein Wort"
        />
        <Button onClick={handleGuess} className="mt-3 bg-green-600 hover:bg-green-700 w-full py-2 text-lg font-bold">
          Raten
        </Button>
      </div>

      <Card className="bg-gray-900 border border-green-700">
        <CardContent>
          {history.length === 0 && <p className="text-green-500">Gib dein erstes Wort ein!</p>}
          {history.map((entry, i) => (
            <div key={i} className="mb-2">
              <span className="text-white">{entry.guess}</span> → 🎯 {entry.inPlace} richtig platziert, ✔ {entry.correct} richtig
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
