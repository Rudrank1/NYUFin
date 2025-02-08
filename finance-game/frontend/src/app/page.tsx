"use client";

import { useState, FormEvent } from "react";
import FinancialGraph from "./financeChart";

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
  category: string;
  description: string;
  options: Option[];
};

const scenarios: Scenario[] = [
  {
    id: 1,
    category: "Investing",
    description: "You have $5,000 to invest. Choose your strategy:",
    options: [
      {
        id: 1,
        text: "Invest in a low-cost S&P 500 index fund",
        outcome: {
          text: "Your investment grew by 7% over the year.",
          capitalChange: 0.07,
          fixedCost: -5000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Buy individual stocks of three tech companies",
        outcome: {
          text: "Your tech stocks had mixed performance, resulting in a 5% gain.",
          capitalChange: 0.05,
          fixedCost: -5000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Invest in a balanced mutual fund (60% stocks, 40% bonds)",
        outcome: {
          text: "The balanced fund provided steady growth of 6%.",
          capitalChange: 0.06,
          fixedCost: -5000,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 2,
    category: "Investing",
    description:
      "Your employer offers a 401(k) match. How much do you contribute?",
    options: [
      {
        id: 1,
        text: "Contribute just enough to get the full employer match",
        outcome: {
          text: "You contributed 6% and your employer matched 3%, total 9% saved.",
          capitalChange: 0.09,
          fixedCost: -1800,
          bonus: 900,
        },
      },
      {
        id: 2,
        text: "Maximize your annual contribution limit",
        outcome: {
          text: "You maxed out at $19,500, significantly reducing your taxable income.",
          capitalChange: 0,
          fixedCost: -19500,
          bonus: 5850,
        },
      },
      {
        id: 3,
        text: "Don't participate and invest independently",
        outcome: {
          text: "You missed out on free money but have more to invest now.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 3,
    category: "Investing",
    description: "You've inherited $10,000. How do you diversify?",
    options: [
      {
        id: 1,
        text: "70% in total stock market ETF, 30% in bond ETF",
        outcome: {
          text: "Your balanced portfolio grew by 6.5% over the year.",
          capitalChange: 0.065,
          fixedCost: -10000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "50% in dividend-paying stocks, 50% in REITs",
        outcome: {
          text: "You earned a 4% dividend yield and 3% capital appreciation.",
          capitalChange: 0.07,
          fixedCost: -10000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "100% in a target-date retirement fund",
        outcome: {
          text: "The fund adjusted its allocation and returned 5.5% this year.",
          capitalChange: 0.055,
          fixedCost: -10000,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 4,
    category: "Investing",
    description: "The stock market has dropped 20%. What's your move?",
    options: [
      {
        id: 1,
        text: "Buy more shares at the lower price",
        outcome: {
          text: "You invested an extra $2,000 and the market rebounded 10%.",
          capitalChange: 0.1,
          fixedCost: -2000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Sell to prevent further losses",
        outcome: {
          text: "You sold at a 20% loss, missing the subsequent 15% recovery.",
          capitalChange: -0.2,
          fixedCost: 0,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Hold your current positions",
        outcome: {
          text: "You weathered the storm and the market recovered 15%.",
          capitalChange: -0.05,
          fixedCost: 0,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 5,
    category: "Investing",
    description:
      "You're interested in socially responsible investing. Choose an option:",
    options: [
      {
        id: 1,
        text: "ESG (Environmental, Social, Governance) focused ETF",
        outcome: {
          text: "The ESG ETF returned 6% while aligning with your values.",
          capitalChange: 0.06,
          fixedCost: -5000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Green energy company stocks",
        outcome: {
          text: "Your green energy picks were volatile but ended up 8%.",
          capitalChange: 0.08,
          fixedCost: -5000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Sustainable bond fund",
        outcome: {
          text: "The bond fund provided a steady 4% return.",
          capitalChange: 0.04,
          fixedCost: -5000,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 6,
    category: "Budgeting",
    description: "Your monthly income is $4,000. How do you budget?",
    options: [
      {
        id: 1,
        text: "50/30/20 rule (50% needs, 30% wants, 20% savings)",
        outcome: {
          text: "You saved $800 this month and maintained a balanced lifestyle.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 800,
        },
      },
      {
        id: 2,
        text: "70/20/10 rule (70% expenses, 20% savings, 10% debt)",
        outcome: {
          text: "You saved $800 and paid off $400 in debt.",
          capitalChange: 0,
          fixedCost: -400,
          bonus: 800,
        },
      },
      {
        id: 3,
        text: "Zero-based budgeting (every dollar has a job)",
        outcome: {
          text: "You optimized spending and managed to save $1,000 this month.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 1000,
        },
      },
    ],
  },
  {
    id: 7,
    category: "Budgeting",
    description: "You got a 5% raise. What do you do with the extra money?",
    options: [
      {
        id: 1,
        text: "Increase your 401(k) contribution",
        outcome: {
          text: "You boosted your retirement savings by $2,400 annually.",
          capitalChange: 0,
          fixedCost: -2400,
          bonus: 600,
        },
      },
      {
        id: 2,
        text: "Start a side hustle investment fund",
        outcome: {
          text: "You invested $2,400 in starting a small business.",
          capitalChange: 0,
          fixedCost: -2400,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Upgrade your lifestyle",
        outcome: {
          text: "You enjoyed some luxuries but saved nothing extra.",
          capitalChange: 0,
          fixedCost: -2400,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 8,
    category: "Budgeting",
    description: "Your car needs $2,000 in repairs. How do you handle it?",
    options: [
      {
        id: 1,
        text: "Use your emergency fund",
        outcome: {
          text: "You paid for repairs without incurring debt.",
          capitalChange: 0,
          fixedCost: -2000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Put it on a credit card",
        outcome: {
          text: "You'll pay an extra $360 in interest over a year if not paid off quickly.",
          capitalChange: 0,
          fixedCost: -2360,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Take out a personal loan",
        outcome: {
          text: "You secured a loan at 8% APR, paying $160 in interest over a year.",
          capitalChange: 0,
          fixedCost: -2160,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 9,
    category: "Debt Management",
    description:
      "You have multiple debts. Which repayment strategy do you choose?",
    options: [
      {
        id: 1,
        text: "Debt avalanche (highest interest rate first)",
        outcome: {
          text: "You paid less in interest overall but took longer to see progress.",
          capitalChange: 0,
          fixedCost: -5000,
          bonus: 500,
        },
      },
      {
        id: 2,
        text: "Debt snowball (smallest balance first)",
        outcome: {
          text: "You paid off two small debts, boosting your motivation.",
          capitalChange: 0,
          fixedCost: -5000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Consolidate all debts with a personal loan",
        outcome: {
          text: "You simplified payments and lowered your overall interest rate.",
          capitalChange: 0,
          fixedCost: -5000,
          bonus: 300,
        },
      },
    ],
  },
  {
    id: 10,
    category: "Debt Management",
    description:
      "You have $5,000 in credit card debt at 18% APR. What's your plan?",
    options: [
      {
        id: 1,
        text: "Transfer to a 0% APR balance transfer card",
        outcome: {
          text: "You saved on interest but paid a 3% transfer fee.",
          capitalChange: 0,
          fixedCost: -150,
          bonus: 900,
        },
      },
      {
        id: 2,
        text: "Take out a personal loan at 10% APR to pay it off",
        outcome: {
          text: "You reduced your interest rate but still owe the full amount.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 400,
        },
      },
      {
        id: 3,
        text: "Aggressively pay down using the debt avalanche method",
        outcome: {
          text: "You paid off $2,000 this year and saved on future interest.",
          capitalChange: 0,
          fixedCost: -2000,
          bonus: 600,
        },
      },
    ],
  },
  {
    id: 11,
    category: "Debt Management",
    description:
      "You're approved for a $250,000 mortgage. How much do you borrow?",
    options: [
      {
        id: 1,
        text: "The full $250,000 to get your dream home",
        outcome: {
          text: "You got a great house but have a tight monthly budget.",
          capitalChange: 0,
          fixedCost: -250000,
          bonus: 250000,
        },
      },
      {
        id: 2,
        text: "$200,000 to have a lower monthly payment",
        outcome: {
          text: "You found a good home and have more financial flexibility.",
          capitalChange: 0,
          fixedCost: -200000,
          bonus: 200000,
        },
      },
      {
        id: 3,
        text: "$150,000 and buy a fixer-upper",
        outcome: {
          text: "You have a project house and $100,000 for renovations and savings.",
          capitalChange: 0,
          fixedCost: -150000,
          bonus: 150000,
        },
      },
    ],
  },
  {
    id: 12,
    category: "Retirement Planning",
    description:
      "You're 25 and starting retirement planning. Where do you begin?",
    options: [
      {
        id: 1,
        text: "Open a Roth IRA and max it out annually",
        outcome: {
          text: "You maxed out your Roth IRA, investing $6,000 this year.",
          capitalChange: 0,
          fixedCost: -6000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Focus on maximizing your 401(k) contribution",
        outcome: {
          text: "You contributed $19,500 to your 401(k), reducing your taxable income.",
          capitalChange: 0,
          fixedCost: -19500,
          bonus: 5850,
        },
      },
      {
        id: 3,
        text: "Split contributions between Roth IRA and 401(k)",
        outcome: {
          text: "You contributed $3,000 to Roth IRA and $10,000 to 401(k).",
          capitalChange: 0,
          fixedCost: -13000,
          bonus: 3000,
        },
      },
    ],
  },
  {
    id: 13,
    category: "Retirement Planning",
    description:
      "You're 45 with $100,000 saved for retirement. What's your next move?",
    options: [
      {
        id: 1,
        text: "Increase contributions to catch up",
        outcome: {
          text: "You maxed out 401(k) and IRA, adding $25,500 this year.",
          capitalChange: 0,
          fixedCost: -25500,
          bonus: 7650,
        },
      },
      {
        id: 2,
        text: "Adjust to a more aggressive investment mix",
        outcome: {
          text: "Your portfolio grew by 8% but with higher volatility.",
          capitalChange: 0.08,
          fixedCost: 0,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Consult a financial advisor for a comprehensive plan",
        outcome: {
          text: "You paid $2,000 for a solid plan that should boost savings by 20% over 5 years.",
          capitalChange: 0,
          fixedCost: -2000,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 14,
    category: "Retirement Planning",
    description:
      "You're considering early retirement. Which strategy do you pursue?",
    options: [
      {
        id: 1,
        text: "FIRE (Financial Independence, Retire Early) with aggressive saving",
        outcome: {
          text: "You saved 70% of your income, accelerating your retirement timeline.",
          capitalChange: 0,
          fixedCost: -50000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Coast FIRE (save aggressively now, then let investments grow)",
        outcome: {
          text: "You front-loaded your savings, planning to coast to traditional retirement age.",
          capitalChange: 0,
          fixedCost: -30000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Barista FIRE (semi-retire with part-time work for benefits)",
        outcome: {
          text: "You prepared for part-time work, balancing savings with more free time.",
          capitalChange: 0,
          fixedCost: -20000,
          bonus: 15000,
        },
      },
    ],
  },
  {
    id: 15,
    category: "Retirement Planning",
    description:
      "You're 55 and want to access retirement funds. What's your option?",
    options: [
      {
        id: 1,
        text: "Use Rule 72(t) for penalty-free withdrawals from IRA",
        outcome: {
          text: "You started fixed withdrawals, avoiding penalties but limiting flexibility.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 15000,
        },
      },
      {
        id: 2,
        text: "Wait until 59½ to avoid early withdrawal penalties",
        outcome: {
          text: "You avoided penalties but had to find alternative income for 4.5 years.",
          capitalChange: 0,
          fixedCost: -20000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Take a 401(k) loan for immediate needs",
        outcome: {
          text: "You borrowed $50,000 from your 401(k), to be repaid with interest.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 50000,
        },
      },
    ],
  },
  {
    id: 16,
    category: "Emergency Fund",
    description: "You're starting an emergency fund. How much do you aim for?",
    options: [
      {
        id: 1,
        text: "3 months of expenses in a high-yield savings account",
        outcome: {
          text: "You saved $6,000 and earned 1% interest over the year.",
          capitalChange: 0.01,
          fixedCost: -6000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "6 months of expenses split between savings and a money market account",
        outcome: {
          text: "You saved $12,000 and earned an average of 1.5% interest.",
          capitalChange: 0.015,
          fixedCost: -12000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "1 year of expenses in a combination of cash and short-term bonds",
        outcome: {
          text: "You saved $24,000 and earned an average of 2% return.",
          capitalChange: 0.02,
          fixedCost: -24000,
          bonus: 0,
        },
      },
    ],
  },
  {
    id: 17,
    category: "Emergency Fund",
    description: "You've reached your emergency fund goal. What's next?",
    options: [
      {
        id: 1,
        text: "Keep building it in anticipation of larger future expenses",
        outcome: {
          text: "You added another $2,000 to your emergency fund.",
          capitalChange: 0,
          fixedCost: -2000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Start investing the overflow in index funds",
        outcome: {
          text: "You invested $2,000 in a total market index fund, which grew 7%.",
          capitalChange: 0.07,
          fixedCost: -2000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Use the extra to pay down high-interest debt",
        outcome: {
          text: "You paid off $2,000 of credit card debt, saving on 18% APR.",
          capitalChange: 0,
          fixedCost: -2000,
          bonus: 360,
        },
      },
    ],
  },
  {
    id: 18,
    category: "Emergency Fund",
    description: "You need to use your emergency fund. How do you rebuild it?",
    options: [
      {
        id: 1,
        text: "Temporarily reduce 401(k) contributions to basic match",
        outcome: {
          text: "You rebuilt your fund in 6 months but missed some retirement savings.",
          capitalChange: 0,
          fixedCost: -3000,
          bonus: 3000,
        },
      },
      {
        id: 2,
        text: "Take on a side gig dedicated to refilling the fund",
        outcome: {
          text: "You earned an extra $4,000 over 4 months to rebuild your fund.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 4000,
        },
      },
      {
        id: 3,
        text: "Sell some non-retirement investments",
        outcome: {
          text: "You sold $3,000 of stocks, incurring some capital gains tax.",
          capitalChange: 0,
          fixedCost: -450,
          bonus: 3000,
        },
      },
    ],
  },
  {
    id: 19,
    category: "Emergency Fund",
    description:
      "Unexpected job loss occurs. How do you manage your emergency fund?",
    options: [
      {
        id: 1,
        text: "Immediately cut all non-essential spending",
        outcome: {
          text: "You reduced monthly expenses by 30%, extending your fund's duration.",
          capitalChange: 0,
          fixedCost: -1000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Use it sparingly while aggressively job hunting",
        outcome: {
          text: "You found a new job in 2 months, using only $4,000 of your fund.",
          capitalChange: 0,
          fixedCost: -4000,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Withdraw from Roth IRA contributions to extend runway",
        outcome: {
          text: "You withdrew $5,000 from Roth IRA contributions without penalty.",
          capitalChange: 0,
          fixedCost: 0,
          bonus: 5000,
        },
      },
    ],
  },
  {
    id: 20,
    category: "Emergency Fund",
    description:
      "You have a $5,000 medical bill not covered by insurance. Your options:",
    options: [
      {
        id: 1,
        text: "Pay from your emergency fund",
        outcome: {
          text: "You covered the bill without incurring debt but depleted your fund.",
          capitalChange: 0,
          fixedCost: -5000,
          bonus: 0,
        },
      },
      {
        id: 2,
        text: "Negotiate a payment plan with the hospital",
        outcome: {
          text: "You set up a 12-month plan, paying $425/month with 2% interest.",
          capitalChange: 0,
          fixedCost: -5100,
          bonus: 0,
        },
      },
      {
        id: 3,
        text: "Use a medical credit card with 0% intro APR",
        outcome: {
          text: "You avoided immediate interest but must pay off $5,000 within 12 months.",
          capitalChange: 0,
          fixedCost: -5000,
          bonus: 0,
        },
      },
    ],
  },
];

export default function FinanceGame() {
  const [capital, setCapital] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  //const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const [currentRound, setCurrentRound] = useState(1);
  const [gameHistory, setGameHistory] = useState<
    { round: number; capital: number }[]
  >([]);

  const [userInputCapital, setUserInputCapital] = useState("");
  const [error, setError] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const startingCapital = parseFloat(userInputCapital);

    if (isNaN(startingCapital) || startingCapital <= 0) {
      setError("Please enter a valid starting amount");
      return;
    }

    startGame(startingCapital);
    setError("");
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
      { round: currentRound + 1, capital: newCapital },
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
          <p className="text-lg mb-4 text-black">
            Final Capital: ${capital.toFixed(2)}
          </p>
          <button
            onClick={() => startGame(1000)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Play Again
          </button>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-black">
              Game History
            </h3>
            <ul className="space-y-2">
              {gameHistory.map((entry, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-3 rounded-md text-black"
                >
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
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setUserInputCapital(value);
                  }}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter custom amount"
                  min="1"
                  step="1"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
