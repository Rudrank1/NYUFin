// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }

// "use client";


// import { useEffect, useState } from 'react';
// import axios from 'axios';

// export default function Home() {
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get('http://localhost:5002/api/test');
//         setMessage(response.data.message);
//       } catch (error) {
//         console.error('Connection error:', error);
//         setMessage('Backend connection failed');
//       }
//     };
//     fetchData();
//   }, []);

//   return (
//     <div style={{ textAlign: 'center', padding: '2rem' }}>
//       <h1>Financial Literacy Game</h1>
//       <p>Backend status: {message}</p>
//     </div>
//   );
// }

// frontend/src/app/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

// Type definitions
interface Outcome {
  text: string;
  capitalChange: number;
}

interface Option {
  id: number;
  text: string;
  outcome: Outcome;
}

interface Scenario {
  id: number;
  description: string;
  options: Option[];
}

interface GameHistoryEntry {
  scenario: string;
  choice: string;
  result: string;
}

// Configure Axios for backend communication
const api = axios.create({
  baseURL: 'http://localhost:5002/api',
});

export default function FinanceGame() {
  const [capital, setCapital] = useState<number>(0);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<Outcome | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Hardcoded scenarios (replace with backend calls if needed)
  const scenarios: Scenario[] = [
    {
      id: 1,
      description: "You received an unexpected $1000 bonus. What will you do?",
      options: [
        { 
          id: 1, 
          text: "Invest in stock market", 
          outcome: { 
            text: "Stocks gained 15%!", 
            capitalChange: 0.15 
          } 
        },
        { 
          id: 2, 
          text: "Put in savings account", 
          outcome: { 
            text: "Earned 2% interest", 
            capitalChange: 0.02 
          } 
        },
        { 
          id: 3, 
          text: "Buy new electronics", 
          outcome: { 
            text: "Enjoyment but no returns", 
            capitalChange: -0.3 
          } 
        }
      ]
    },
    {
      id: 2,
      description: "Your car needs $500 repairs. How do you handle it?",
      options: [
        { 
          id: 1, 
          text: "Use emergency fund", 
          outcome: { 
            text: "Smart financial move!", 
            capitalChange: -0.05 
          } 
        },
        { 
          id: 2, 
          text: "Put on credit card", 
          outcome: { 
            text: "Accrued 18% interest", 
            capitalChange: -0.18 
          } 
        },
        { 
          id: 3, 
          text: "Ignore the problem", 
          outcome: { 
            text: "Costlier repairs later", 
            capitalChange: -0.4 
          } 
        }
      ]
    }
  ];

  const startGame = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const initialCapital = parseFloat(capital.toString());
      if (isNaN(initialCapital)) {
        throw new Error("Invalid capital amount");
      }
      
      setCapital(initialCapital);
      setGameHistory([]);
      setResult(null);
      setScenario(scenarios[0]);
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleChoice = async (choiceId: number) => {
  //   setLoading(true);
  //   try {
  //     if (!scenario) throw new Error("No active scenario");
      
  //     const selectedOption = scenario.options.find(opt => opt.id === choiceId);
  //     if (!selectedOption) throw new Error("Invalid choice");

  //     const newCapital = capital + (capital * selectedOption.outcome.capitalChange);
      
  //     setCapital(newCapital);
  //     setResult(selectedOption.outcome);
      
  //     setGameHistory(prev => [...prev, {
  //       scenario: scenario.description,
  //       choice: selectedOption.text,
  //       result: selectedOption.outcome.text
  //     }]);

  //     const nextScenario = scenarios.find(s => s.id === scenario.id + 1);
  //     setScenario(nextScenario || null);

  //   } catch (error) {
  //     console.error('Error processing choice:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleChoice = async (choiceId: number) => {
    setLoading(true);
    try {
      if (!scenario) throw new Error("No active scenario");
      
      const selectedOption = scenario.options.find(opt => opt.id === choiceId);
      if (!selectedOption) throw new Error("Invalid choice");
  
      // Calculate new capital and update results
      const newCapital = capital + (capital * selectedOption.outcome.capitalChange);
      setCapital(newCapital);
      setResult(selectedOption.outcome);
      
      // Update game history
      setGameHistory(prev => [...prev, {
        scenario: scenario.description,
        choice: selectedOption.text,
        result: selectedOption.outcome.text
      }]);
  
      // Progress to next scenario
      const currentScenarioIndex = scenarios.findIndex(s => s.id === scenario.id);
      const nextScenario = scenarios[currentScenarioIndex + 1];
  
      if (nextScenario) {
        setScenario(nextScenario);
        setResult(null); // Reset result for next question
      } else {
        // Handle game completion
        setScenario(null);
        setResult({ 
          text: `Game Over! Final Capital: $${newCapital.toFixed(2)}`, 
          capitalChange: 0 
        });
      }
  
    } catch (error) {
      console.error('Error processing choice:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Financial Literacy Simulator
        </h1>

        {!scenario && (
          <form onSubmit={startGame} className="space-y-4">
            <div>
              <label className="block text-red-700 mb-2">
                Enter Starting Capital ($):
              </label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full p-2 border rounded-md text-black"
                min="100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Start Game'}
            </button>
          </form>
        )}

        {scenario && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4">
                Current Capital: 
                <span className="text-blue-600 ml-2">
                  ${capital.toFixed(2)}
                </span>
              </h2>
              <p className="text-lg mb-4">{scenario.description}</p>
              
              <div className="space-y-3">
                {scenario.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleChoice(option.id)}
                    className="w-full p-3 text-left bg-white border rounded-md hover:bg-blue-50 transition-colors disabled:bg-gray-100"
                    disabled={loading}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>

            {result && (
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-red-600 font-semibold">{result.text}</p>
              </div>
            )}

            {gameHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3">Game History</h3>
                <ul className="space-y-2">
                  {gameHistory.map((entry, index) => (
                    <li key={index} className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{entry.scenario}</p>
                      <p>Choice: {entry.choice}</p>
                      <p>Result: {entry.result}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
