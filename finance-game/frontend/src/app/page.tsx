// "use client";

// import { useState, useEffect, FormEvent } from 'react';
// import axios from 'axios';

// // Type definitions
// interface Outcome {
//   text: string;
//   capitalChange: number;
// }

// interface Option {
//   id: number;
//   text: string;
//   outcome: Outcome;
// }

// interface Scenario {
//   id: number;
//   description: string;
//   options: Option[];
// }

// interface GameHistoryEntry {
//   scenario: string;
//   choice: string;
//   result: string;
// }

// // Configure Axios for backend communication
// const api = axios.create({
//   baseURL: 'http://localhost:5002/api',
// });

// export default function FinanceGame() {
//   const [capital, setCapital] = useState<number>(0);
//   const [scenario, setScenario] = useState<Scenario | null>(null);
//   const [result, setResult] = useState<Outcome | null>(null);
//   const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   // Hardcoded scenarios (replace with backend calls if needed)
//   const scenarios: Scenario[] = [
//     {
//       id: 1,
//       description: "You received an unexpected $1000 bonus. What will you do?",
//       options: [
//         { 
//           id: 1, 
//           text: "Invest in stock market", 
//           outcome: { 
//             text: "Stocks gained 15%!", 
//             capitalChange: 0.15 
//           } 
//         },
//         { 
//           id: 2, 
//           text: "Put in savings account", 
//           outcome: { 
//             text: "Earned 2% interest", 
//             capitalChange: 0.02 
//           } 
//         },
//         { 
//           id: 3, 
//           text: "Buy new electronics", 
//           outcome: { 
//             text: "Enjoyment but no returns", 
//             capitalChange: -0.3 
//           } 
//         }
//       ]
//     },
//     {
//       id: 2,
//       description: "Your car needs $500 repairs. How do you handle it?",
//       options: [
//         { 
//           id: 1, 
//           text: "Use emergency fund", 
//           outcome: { 
//             text: "Smart financial move!", 
//             capitalChange: -0.05 
//           } 
//         },
//         { 
//           id: 2, 
//           text: "Put on credit card", 
//           outcome: { 
//             text: "Accrued 18% interest", 
//             capitalChange: -0.18 
//           } 
//         },
//         { 
//           id: 3, 
//           text: "Ignore the problem", 
//           outcome: { 
//             text: "Costlier repairs later", 
//             capitalChange: -0.4 
//           } 
//         }
//       ]
//     },
//     {
//       id: 3,
//       description: "You have an opportunity to start a side business. What do you do?",
//       options: [
//         { 
//           id: 1, 
//           text: "Invest $500 in the business", 
//           outcome: { 
//             text: "Business grew by 50%", 
//             capitalChange: 0.5 
//           } 
//         },
//         { 
//           id: 2, 
//           text: "Save the money", 
//           outcome: { 
//             text: "Earned 1% interest", 
//             capitalChange: 0.01 
//           } 
//         },
//         { 
//           id: 3, 
//           text: "Spend it on a vacation", 
//           outcome: { 
//             text: "Relaxed but no returns", 
//             capitalChange: -0.2 
//           } 
//         }
//       ]
//     },
//     {
//       id: 4,
//       description: "You received a medical bill of $300. How do you handle it?",
//       options: [
//         { 
//           id: 1, 
//           text: "Pay with savings", 
//           outcome: { 
//             text: "Smart move!", 
//             capitalChange: -0.1 
//           } 
//         },
//         { 
//           id: 2, 
//           text: "Put it on credit", 
//           outcome: { 
//             text: "Accrued 20% interest", 
//             capitalChange: -0.2 
//           } 
//         },
//         { 
//           id: 3, 
//           text: "Ignore it", 
//           outcome: { 
//             text: "Debt collectors called", 
//             capitalChange: -0.5 
//           } 
//         }
//       ]
//     }
//   ];

//   const startGame = async (e: FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const initialCapital = parseFloat(capital.toString());
//       if (isNaN(initialCapital)) {
//         throw new Error("Invalid capital amount");
//       }
      
//       setCapital(initialCapital);
//       setGameHistory([]);
//       setResult(null);
//       setScenario(scenarios[0]);
//     } catch (error) {
//       console.error('Error starting game:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleChoice = async (choiceId: number) => {
//   //   setLoading(true);
//   //   try {
//   //     if (!scenario) throw new Error("No active scenario");
      
//   //     const selectedOption = scenario.options.find(opt => opt.id === choiceId);
//   //     if (!selectedOption) throw new Error("Invalid choice");

//   //     const newCapital = capital + (capital * selectedOption.outcome.capitalChange);
      
//   //     setCapital(newCapital);
//   //     setResult(selectedOption.outcome);
      
//   //     setGameHistory(prev => [...prev, {
//   //       scenario: scenario.description,
//   //       choice: selectedOption.text,
//   //       result: selectedOption.outcome.text
//   //     }]);

//   //     const nextScenario = scenarios.find(s => s.id === scenario.id + 1);
//   //     setScenario(nextScenario || null);

//   //   } catch (error) {
//   //     console.error('Error processing choice:', error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleChoice = async (choiceId: number) => {
//     setLoading(true);
//     try {
//       if (!scenario) throw new Error("No active scenario");
      
//       const selectedOption = scenario.options.find(opt => opt.id === choiceId);
//       if (!selectedOption) throw new Error("Invalid choice");
  
//       // Calculate new capital and update results
//       const newCapital = capital + (capital * selectedOption.outcome.capitalChange);
//       setCapital(newCapital);
//       setResult(selectedOption.outcome);
      
//       // Update game history
//       setGameHistory(prev => [...prev, {
//         scenario: scenario.description,
//         choice: selectedOption.text,
//         result: selectedOption.outcome.text
//       }]);
  
//       // Progress to next scenario
//       const currentScenarioIndex = scenarios.findIndex(s => s.id === scenario.id);
//       const nextScenario = scenarios[currentScenarioIndex + 1];
  
//       if (nextScenario) {
//         setScenario(nextScenario);
//         setResult(null); // Reset result for next question
//       } else {
//         // Handle game completion
//         setScenario(null);
//         setResult({ 
//           text: `Game Over! Final Capital: $${newCapital.toFixed(2)}`, 
//           capitalChange: 0 
//         });
//       }
  
//     } catch (error) {
//       console.error('Error processing choice:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="min-h-screen bg-gray-100 py-8 px-4">
//       <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
//         <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
//           Financial Literacy Simulator
//         </h1>

//         {!scenario && (
//           <form onSubmit={startGame} className="space-y-4">
//             <div>
//               <label className="block text-red-700 mb-2">
//                 Enter Starting Capital ($):
//               </label>
//               <input
//                 type="number"
//                 value={capital}
//                 onChange={(e) => setCapital(Number(e.target.value))}
//                 className="w-full p-2 border rounded-md text-black"
//                 min="100"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//               disabled={loading}
//             >
//               {loading ? 'Starting...' : 'Start Game'}
//             </button>
//           </form>
//         )}

//         {scenario && (
//           <div className="space-y-6">
//             <div className="bg-blue-50 p-4 rounded-md">
//               <h2 className="text-xl font-semibold mb-4 text-black">
//                 Current Capital: 
//                 <span className="text-blue-600 ml-2">
//                   ${capital.toFixed(2)}
//                 </span>
//               </h2>
//               <p className="text-lg mb-4 text-black">{scenario.description}</p>
              
//               <div className="space-y-3">
//                 {scenario.options.map(option => (
//                   <button
//                     key={option.id}
//                     onClick={() => handleChoice(option.id)}
//                     className="w-full p-3 text-left text-black bg-white border rounded-md hover:bg-blue-50 transition-colors disabled:bg-gray-100"
//                     disabled={loading}
//                   >
//                     {option.text}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {result && (
//               <div className="bg-green-50 p-4 rounded-md">
//                 <p className="text-red-600 font-semibold">{result.text}</p>
//               </div>
//             )}

//             {gameHistory.length > 0 && (
//               <div className="mt-8">
//                 <h3 className="text-lg font-semibold mb-3 text-black">Game History</h3>
//                 <ul className="space-y-2">
//                   {gameHistory.map((entry, index) => (
//                     <li key={index} className="bg-gray-50 p-3 rounded-md text-black">
//                       <p className="font-medium">{entry.scenario}</p>
//                       <p>Choice: {entry.choice}</p>
//                       <p>Result: {entry.result}</p>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, FormEvent } from 'react';

type Outcome = {
  text: string;
  capitalChange: number;
  fixedCost?: number;
  bonus?: number;
};

type Option = {
  id: number;
  text: string;
  outcome: Outcome;
};

type Scenario = {
  id: number;
  description: string;
  options: Option[];
};

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
          capitalChange: 0.15,
          fixedCost: 0,
          bonus: 1000,
        } 
      },
      { 
        id: 2, 
        text: "Put in savings account", 
        outcome: { 
          text: "Earned 2% interest", 
          capitalChange: 0.02,
          fixedCost: 0,
          bonus: 1000,
        } 
      },
      { 
        id: 3, 
        text: "Buy new electronics for 800$", 
        outcome: { 
          text: "Enjoyed new gadgets, but they depreciated quickly", 
          capitalChange: 0,
          fixedCost: 800,
          bonus: 1000,
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
          capitalChange: 0,
          fixedCost: 500,
          bonus: 0,
        } 
      },
      { 
        id: 2, 
        text: "Put on credit card", 
        outcome: { 
          text: "Accrued 18% interest", 
          capitalChange: -0.18,
          fixedCost: 500,
          bonus: 0,
        } 
      },
      { 
        id: 3, 
        text: "Ignore the problem", 
        outcome: { 
          text: "Costlier repairs later", 
          capitalChange: 0,
          fixedCost: 1000,
          bonus: 0,
        } 
      }
    ]
  },
  {
    id: 3,
    description: "You have an opportunity to start a side business. What do you do?",
    options: [
      { 
        id: 1, 
        text: "Invest $500 in the business", 
        outcome: { 
          text: "Business grew by 50%", 
          capitalChange: 0.5,
          fixedCost: 500,
          bonus: 0,
        } 
      },
      { 
        id: 2, 
        text: "Save the money", 
        outcome: { 
          text: "Earned 1% interest", 
          capitalChange: 0.01,
          fixedCost: 0,
          bonus: 0,
        } 
      },
      { 
        id: 3, 
        text: "Spend it on a vacation", 
        outcome: { 
          text: "Relaxed but no returns", 
          capitalChange: 0,
          fixedCost: 500,
          bonus: 0,
        } 
      }
    ]
  },
  {
    id: 4,
    description: "You received a medical bill of $300. How do you handle it?",
    options: [
      { 
        id: 1, 
        text: "Pay with savings", 
        outcome: { 
          text: "Smart move!", 
          capitalChange: 0,
          fixedCost: 300
        } 
      },
      { 
        id: 2, 
        text: "Put it on credit", 
        outcome: { 
          text: "Accrued 20% interest", 
          capitalChange: -0.2,
          fixedCost: 300
        } 
      },
      { 
        id: 3, 
        text: "Ignore it", 
        outcome: { 
          text: "Debt collectors called", 
          capitalChange: -0.5,
          fixedCost: 300
        } 
      }
    ]
  }
];

export default function FinanceGame() {
  const [capital, setCapital] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const [userInputCapital, setUserInputCapital] = useState('');
  const [error, setError] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const startingCapital = parseFloat(userInputCapital);
    
    if (isNaN(startingCapital) || startingCapital <= 0) {
      setError('Please enter a valid starting amount');
      return;
    }
    
    startGame(startingCapital);
    setError('');
  };

  const handleChoice = (choice: Option) => {
    let newCapital = capital;

    // Add the bonus first
    if (choice.outcome.bonus) {
      newCapital += choice.outcome.bonus;
    }

    // Apply fixed costs
    if (choice.outcome.fixedCost) {
      newCapital -= choice.outcome.fixedCost;
    }

    // Apply percentage changes to the new total
    newCapital += newCapital * choice.outcome.capitalChange;

    // // Ensure capital doesn't go below 0
    // newCapital = Math.max(newCapital, 0);

    const historyEntry = `${scenarios[currentScenarioIndex].description} - Chose: ${choice.text} - ${choice.outcome.text} - New Capital: $${newCapital.toFixed(2)}`;
    
    setCapital(newCapital);
    setGameHistory([...gameHistory, historyEntry]);
    
    if (newCapital < 50) {
      setGameOver(true);
    } else {
      setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length);
    }
  };

  const startGame = (initialCapital: number) => {
    setCapital(initialCapital);
    setCurrentScenarioIndex(0);
    setGameHistory([]);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Game Over!</h2>
          <p className="text-lg mb-4 text-black">Final Capital: ${capital.toFixed(2)}</p>
          <button
            onClick={() => startGame(1000)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Play Again
          </button>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-black">Game History</h3>
            <ul className="space-y-2">
              {gameHistory.map((entry, index) => (
                <li key={index} className="bg-gray-50 p-3 rounded-md text-black">
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {capital === 0 ? (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
              Financial Literacy Challenge
            </h1>
            <button
              onClick={() => startGame(1000)}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
            >
              Start with $1000
            </button>
            <button
              onClick={() => startGame(500)}
              className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700"
            >
              Start with $500 (Hard Mode)
            </button>
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Enter Starting Capital ($):
                </label>
                <input
                  type="number"
                  value={userInputCapital}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setUserInputCapital(value);
                  }}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter custom amount"
                  min="1"
                  step="1"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Start with Custom Amount
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Current Capital: ${capital.toFixed(2)}
              </h2>
              <p className="text-lg mb-4 text-black">
                {scenarios[currentScenarioIndex].description}
              </p>
              <div className="space-y-3">
                {scenarios[currentScenarioIndex].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleChoice(option)}
                    className="w-full p-3 text-left text-black bg-white border rounded-md hover:bg-blue-50 transition-colors"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
