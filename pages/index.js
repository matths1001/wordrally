import Head from 'next/head'
import { useState, useEffect } from 'react'

const wordLists = {
  de: {
    5: ['apfel', 'blume', 'stuhl'],
    6: ['banane', 'fenster'],
    7: ['schacht'],
    8: ['flugzeug']
  },
  en: {
    5: ['apple', 'chair', 'stone'],
    6: ['banana', 'window'],
    7: ['glasses'],
    8: ['backpack']
  }
}

export default function Home() {
  const [language, setLanguage] = useState('de')
  const [length, setLength] = useState(5)
  const [target, setTarget] = useState('')
  const [guess, setGuess] = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    const word = wordLists[language][length][Math.floor(Math.random() * wordLists[language][length].length)]
    setTarget(word)
  }, [language, length])

  const handleGuess = () => {
    if (guess.length !== length) return
    let inPlace = 0
    let correct = 0
    let used = Array(length).fill(false)

    for (let i = 0; i < length; i++) {
      if (guess[i] === target[i]) {
        inPlace++
        used[i] = true
      }
    }

    for (let i = 0; i < length; i++) {
      if (guess[i] !== target[i]) {
        for (let j = 0; j < length; j++) {
          if (!used[j] && guess[i] === target[j]) {
            correct++
            used[j] = true
            break
          }
        }
      }
    }

    setHistory([...history, { guess, inPlace, correct }])
    setGuess('')
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <Head>
        <title>WordRally</title>
      </Head>
      <h1 className="text-3xl mb-4">WordRally 🚦</h1>
      <div className="mb-4 flex gap-4">
        <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-gray-800 text-green-400 p-2">
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
        <select value={length} onChange={e => setLength(Number(e.target.value))} className="bg-gray-800 text-green-400 p-2">
          {[5,6,7,8].map(n => <option key={n} value={n}>{n} Buchstaben</option>)}
        </select>
      </div>
      <input
        value={guess}
        onChange={e => setGuess(e.target.value.toLowerCase())}
        maxLength={length}
        className="bg-gray-900 text-green-400 border border-green-500 p-2 w-full mb-2"
        placeholder="Dein Wort"
      />
      <button onClick={handleGuess} className="bg-green-600 hover:bg-green-700 px-4 py-2 mb-4">Raten</button>
      <div className="bg-gray-900 border border-green-700 p-4">
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <span className="text-white">{entry.guess}</span> → 🎯 {entry.inPlace} richtig platziert, ✔ {entry.correct} richtig
          </div>
        ))}
      </div>
    </div>
  )
}