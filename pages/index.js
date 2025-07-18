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
  // ... bestehende useState und Logik bleibt unverändert ...

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
                ⭐ Sterne: {renderStars(lastScore?.stars || 0)} <br/>
                🔢 Punkte: {lastScore?.score} <br/>
                ⏱ Zeit: {lastScore?.time}s <br/>
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

