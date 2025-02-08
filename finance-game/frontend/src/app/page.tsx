"use client";

import { useState, FormEvent } from 'react';
import FinancialGraph from './financeChart';

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
  //const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const [currentRound, setCurrentRound] = useState(1);
  const [gameHistory, setGameHistory] = useState<{ round: number; capital: number }[]>([]);

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

    setGameHistory((prevHistory) => [
      ...prevHistory,
      { round: currentRound + 1, capital: newCapital }
    ]);

    setCapital(newCapital);
    setCurrentRound((prevRound) => prevRound + 1);
    
    if (newCapital < 50) {
      setGameOver(true);
    } else {
      setCurrentScenarioIndex((prev) => (prev + 1) % scenarios.length);
    }
  };

  const startGame = (initialCapital: number) => {
    setCapital(initialCapital);
    setCurrentScenarioIndex(0);
    setGameHistory([{ round: 1, capital: initialCapital }]);
    setCurrentRound(1);
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
                  Round {entry.round}: ${entry.capital.toFixed(2)}
                </li>
              ))}
            </ul>
            <FinancialGraph
              rounds={gameHistory.map((entry) => entry.round)}
              capitals={gameHistory.map((entry) => entry.capital)}
            />
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
