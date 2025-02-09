"use client";

import { useState, FormEvent, useEffect } from "react";
import Lottie from "lottie-react";
import FinancialGraph from "./financeChart";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Spinner from "./spinner";
import groovyWalkAnimation from "./groovyWalk.json";

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

type Month = {
  name: string;
  days: number;
  rounds: number;
};

type MonthlyExpenses = {
  state: string;
  healthInsurance: number;
  utilities: number;
  groceries: number;
  rent: number;
  gymFitness?: number;
  streamingServices?: number;
  customSubscription?: {
    name: string;
    amount: number;
  };
  internetCable: number;
  loans: {
    carLoan?: number;
    studentLoan?: number;
    homeLoan?: number;
  };
};

const months: Month[] = [
  { name: "January", days: 31, rounds: 4 },
  { name: "February", days: 28, rounds: 4 },
  { name: "March", days: 31, rounds: 4 },
  { name: "April", days: 30, rounds: 4 },
  { name: "May", days: 31, rounds: 4 },
  { name: "June", days: 30, rounds: 4 },
  { name: "July", days: 31, rounds: 4 },
  { name: "August", days: 31, rounds: 4 },
  { name: "September", days: 30, rounds: 4 },
  { name: "October", days: 31, rounds: 4 },
  { name: "November", days: 30, rounds: 4 },
  { name: "December", days: 31, rounds: 4 },
];

export default function FinanceGame() {
  const [capital, setCapital] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentMonthRound, setCurrentMonthRound] = useState(1);
  const [gameHistory, setGameHistory] = useState<
    {
      round: number;
      month: string;
      monthRound: number;
      capital: number;
      description?: string;
      choice?: string;
      result?: string;
    }[]
  >([]);
  const [userInputCapital, setUserInputCapital] = useState("");
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    text: string;
    newCapital: number;
  } | null>(null);
  const [loading, setLoading] = useState(false); // New loading state
  const [apiScenarios, setApiScenarios] = useState<Scenario[] | null>(null);
  const [win, setWin] = useState(false);
  const [showExpensesForm, setShowExpensesForm] = useState(false);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpenses>({
    state: "",
    healthInsurance: 0,
    utilities: 0,
    groceries: 0,
    rent: 0,
    internetCable: 0,
    gymFitness: 0,
    streamingServices: 0,
    customSubscription: {
      name: "",
      amount: 0,
    },
    loans: {
      carLoan: 0,
      studentLoan: 0,
      homeLoan: 0,
    },
  });
  const [viewMode, setViewMode] = useState<"monthly" | "round">("monthly");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showPercentages, setShowPercentages] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [customOrNot, setCustomOrNot] = useState(false);

  const US_STATES = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  const calculateDefaultExpenses = (monthlySalary: number) => {
    return {
      state: "",
      healthInsurance: Math.round(Math.max(monthlySalary * 0.15, 0)), // 15% of monthly salary
      utilities: Math.round(Math.max(monthlySalary * 0.1, 0)), // 10% of monthly salary
      groceries: Math.round(Math.max(monthlySalary * 0.2, 0)), // 20% of monthly salary
      rent: Math.round(Math.max(monthlySalary * 0.3, 0)), // 30% of monthly salary
      internetCable: Math.round(Math.max(monthlySalary * 0.05, 0)), // 5% of monthly salary
      gymFitness: Math.round(Math.max(monthlySalary * 0.02, 0)), // 2% of monthly salary
      streamingServices: Math.round(Math.max(monthlySalary * 0.02, 0)), // 2% of monthly salary
      customSubscription: {
        name: "",
        amount: 0,
      },
      loans: {
        carLoan: Math.round(Math.max(monthlySalary * 0.15, 0)), // 15% of monthly salary
        studentLoan: Math.round(Math.max(monthlySalary * 0.15, 0)), // 15% of monthly salary
        homeLoan: Math.round(Math.max(monthlySalary * 0.25, 0)), // 25% of monthly salary
      },
    };
  };

  const handleScenarioStart = (e: React.FormEvent) => {
    e.preventDefault();
    const startingCapital = parseFloat(userInputCapital);

    if (isNaN(startingCapital) || startingCapital <= 0) {
      setError("Please enter a valid starting amount");
      return;
    }

    // Set initial salary
    const initialSalary = Math.round(startingCapital * 0.25); // 25% of starting capital
    setMonthlySalary(initialSalary);

    // Set default expenses based on monthly salary
    setMonthlyExpenses(calculateDefaultExpenses(initialSalary));
    setShowExpensesForm(true);
    setError("");
  };

  const handleExpensesSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate total monthly expenses
    const totalExpenses =
      // Sum up all direct number expenses
      monthlyExpenses.healthInsurance +
      monthlyExpenses.utilities +
      monthlyExpenses.groceries +
      monthlyExpenses.rent +
      monthlyExpenses.internetCable +
      (monthlyExpenses.gymFitness || 0) +
      (monthlyExpenses.streamingServices || 0) +
      // Add custom subscription if exists
      (monthlyExpenses.customSubscription?.amount || 0) +
      // Add up all loans
      (monthlyExpenses.loans.carLoan || 0) +
      (monthlyExpenses.loans.studentLoan || 0) +
      (monthlyExpenses.loans.homeLoan || 0);

    const startingCapital = parseFloat(userInputCapital);
    if (totalExpenses > startingCapital) {
      setError("Total expenses cannot exceed starting capital");
      return;
    }
    // Start game with remaining capital after expenses
    setCustomOrNot(true);
    startScenarioGame(startingCapital - totalExpenses);
    setShowExpensesForm(false);
  };

  const handleChoice = (choice: Option) => {
    const prevCapital = capital;
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

    // Update game history
    setGameHistory([
      ...gameHistory,
      {
        round: currentRound,
        month: months[currentMonth].name,
        monthRound: currentMonthRound,
        capital: newCapital,
        description: apiScenarios![currentScenarioIndex].description,
        choice: choice.text,
        result: choice.outcome.text,
      },
    ]);

    setCurrentResult({
      text: choice.outcome.text,
      newCapital: newCapital,
    });

    setShowResult(true);

    // Check if we need to move to the next month
    if (currentMonthRound >= 4) {
      // Always 4 rounds per month
      // Apply monthly changes
      newCapital += monthlySalary; // Add salary

      // Subtract all monthly expenses
      const totalExpenses =
        monthlyExpenses.healthInsurance +
        monthlyExpenses.utilities +
        monthlyExpenses.groceries +
        monthlyExpenses.rent +
        monthlyExpenses.internetCable +
        (monthlyExpenses.gymFitness || 0) +
        (monthlyExpenses.streamingServices || 0) +
        (monthlyExpenses.customSubscription?.amount || 0) +
        (monthlyExpenses.loans.carLoan || 0) +
        (monthlyExpenses.loans.studentLoan || 0) +
        (monthlyExpenses.loans.homeLoan || 0);
      newCapital -= totalExpenses;

      if (currentMonth + 1 >= selectedMonths) {
        setGameOver(true);
        setWin(newCapital > 0);
      } else {
        // Increase salary by 5% for next month
        setMonthlySalary((prevSalary) => prevSalary * 1.05);
        setCurrentMonth((prev) => prev + 1);
        setCurrentMonthRound(1);
        setCurrentScenarioIndex((prev) => prev + 4); // Move to next month's scenarios
      }
    } else {
      setCurrentMonthRound((prev) => prev + 1);
      setCurrentScenarioIndex((prev) => prev + 1); // Move to next scenario
    }

    setCapital(newCapital);
    setCurrentRound((prevRound) => prevRound + 1);

    if (newCapital <= 0) {
      setGameOver(true);
      setWin(false);
    }
  };

  const startScenarioGame = (initialCapital: number) => {
    const initialSalary =  Math.round(initialCapital * 0.25); // 25% of initial capital
    setMonthlySalary(initialSalary);
    setCapital(initialCapital);
    setCurrentScenarioIndex(0);
    setCurrentMonth(0);
    setCurrentMonthRound(1);
    setGameHistory([
      {
        round: 1,
        month: months[0].name,
        monthRound: 1,
        capital: initialCapital,
      },
    ]);
    setCurrentRound(1);
    setGameOver(false);
    generateScenarios();
    if (customOrNot === false) {
      setSelectedMonths(12);
    }
  };

  // New continueGame function
  const continueGame = () => {
    setCapital(currentResult?.newCapital || 0);
    setShowResult(false);

    // Check if game should end
    if (currentMonth >= selectedMonths) {
      setGameOver(true);
    } else if (currentScenarioIndex + 1 >= apiScenarios!.length) {
      setCurrentScenarioIndex(0); // Reset scenarios if we run out
    } else {
      setCurrentScenarioIndex((prev) => prev + 1);
    }
  };

  const resetGame = () => {
    setCapital(0);
    setCurrentScenarioIndex(0);
    setCurrentMonth(0);
    setCurrentMonthRound(1);
    setGameHistory([]);
    setCurrentRound(0);
    setGameOver(false);
    setUserInputCapital("");
    setShowResult(false);
    setCurrentResult(null);
    setShowAnalysis(false);
  };

  const formatAnalysis = (analysis: string) => {
    const lines = analysis.split("\n").filter((line) => line.trim() !== "");
    let formattedHTML = "";

    lines.forEach((line) => {
      let processedLine = line
        // Convert * **text** patterns to italics first
        .replace(/\* \*\*(.*?)\*\*/g, "<i>$1</i>")
        // Handle double asterisks for bold (but not when preceded by list asterisk)
        .replace(/(?<!\* )\*\*(.*?)\*\*/g, "<b>$1</b>")
        // Remove all remaining asterisks
        .replace(/\*/g, "")
        // Clean up extra spaces
        .trim();

      // Original heading detection logic
      if (/^\d+\./.test(line)) {
        formattedHTML += `<h4 class="font-bold mt-4 text-gray-900">${processedLine}</h4>`;
      } else if (/^Conclusion/.test(line)) {
        formattedHTML += `<h4 class="font-bold mt-6 text-gray-900">${processedLine}</h4>`;
      } else {
        formattedHTML += `<p class="mt-2 text-gray-900">${processedLine}</p>`;
      }
    });

    return formattedHTML;
  };

  const generateAnalysis = async () => {
    setAnalysisLoading(true);
    setShowAnalysis(true);
    try {
      const geminiApiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Collect user choices and results from game history
      const userChoices = gameHistory.map((entry) => entry.choice);
      const userResults = gameHistory.map((entry) => entry.result);

      const prompt = `You are a financial expert. Analyze the user's spending habits and financial literacy based on the following data:
    Choices: ${JSON.stringify(userChoices)}
    Results: ${JSON.stringify(userResults)}

    Provide a brief yet important analysis of their financial behavior. Highlight their strengths and weaknesses in financial decision-making, identify patterns in their spending habits, and suggest specific areas for improvement. Use clear and concise language. Format it based on subtopics in the following order: Spending Habits, Financial Literacy, Strengths, and Weaknesses, and Areas of Improvements". Include a Conclusion section summarizing the key points and recommendations.`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      console.log("Raw generated text:", rawText);

      // Remove markdown code fences if present
      let jsonString = rawText.trim();
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.slice(7).trim(); // remove opening ```
        if (jsonString.endsWith("```")) {
          jsonString = jsonString.slice(0, -3).trim(); // remove closing ```
        }
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.slice(3).trim(); // remove opening ```
        if (jsonString.endsWith("```")) {
          jsonString = jsonString.slice(0, -3).trim(); // remove closing ```
        }
      }

      setCurrentResult({ text: rawText, newCapital: capital });
    } catch (err) {
      console.error("Error generating analysis via Gemini:", err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getMonthlyData = () => {
    const monthlyData = months
      .map((month) => {
        const monthEntries = gameHistory.filter(
          (entry) => entry.month === month.name
        );
        if (monthEntries.length === 0) return null;

        // Calculate monthly summary
        const startCapital = monthEntries[0].capital;
        const endCapital = monthEntries[monthEntries.length - 1].capital;
        const capitalChange = endCapital - startCapital;
        const decisions = monthEntries.slice(1).map((entry) => ({
          description: entry.description,
          choice: entry.choice,
          result: entry.result,
        }));

        return {
          month: month.name,
          capital: endCapital,
          startCapital,
          capitalChange,
          decisions,
        };
      })
      .filter((entry) => entry !== null);

    return monthlyData;
  };

  const renderHistoryAndGraph = () => {
    const monthlyData = getMonthlyData();

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-black">
            Financial Progress
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1 rounded-md ${
                viewMode === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode("round")}
              className={`px-3 py-1 rounded-md ${
                viewMode === "round"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Per Round
            </button>
          </div>
        </div>

        {/* Graph Section */}
        <div className="mb-8">
          <FinancialGraph
            rounds={
              viewMode === "monthly"
                ? monthlyData.map((_, index) => index + 1)
                : gameHistory.map((entry) => entry.round)
            }
            capitals={
              viewMode === "monthly"
                ? monthlyData.map((entry) => entry?.capital || 0)
                : gameHistory.map((entry) => entry.capital)
            }
            labels={
              viewMode === "monthly"
                ? monthlyData.map((entry) => entry?.month || "")
                : undefined
            }
          />
        </div>

        {/* History Section */}
        <h3 className="text-xl font-semibold mb-4 text-black">
          Detailed History
        </h3>
        <ul className="space-y-2">
          {viewMode === "monthly"
            ? monthlyData.map((entry, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-3 rounded-md text-black"
                >
                  <div className="border-b pb-2 mb-2">
                    <h4 className="font-semibold text-lg">{entry?.month}</h4>
                    <p>Starting Capital: ${entry?.startCapital.toFixed(2)}</p>
                    <p>Ending Capital: ${entry?.capital.toFixed(2)}</p>
                    <p
                      className={`font-medium ${
                        entry?.capitalChange >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Monthly Change: ${entry?.capitalChange.toFixed(2)}
                    </p>
                  </div>
                  {entry?.decisions.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Monthly Decisions:</p>
                      {entry?.decisions.map((decision, idx) => (
                        <div key={idx} className="ml-4 mb-2">
                          <p className="text-sm">
                            Scenario: {decision.description}
                          </p>
                          <p className="text-sm">Choice: {decision.choice}</p>
                          <p className="text-sm">Result: {decision.result}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))
            : gameHistory.map((entry, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-3 rounded-md text-black"
                >
                  {index === 0 ? (
                    <p>Starting Capital: ${entry.capital.toFixed(2)}</p>
                  ) : (
                    <>
                      <p>
                        {entry.month} - Round {entry.monthRound}: $
                        {entry.capital.toFixed(2)}
                      </p>
                      <p className="text-sm">Scenario: {entry.description}</p>
                      <p className="text-sm">Choice: {entry.choice}</p>
                      <p className="text-sm">Result: {entry.result}</p>
                    </>
                  )}
                </li>
              ))}
        </ul>
      </div>
    );
  };

  const getPercentage = (amount: number, total: number) => {
    return ((amount / total) * 100).toFixed(1);
  };

  const renderExpensesForm = () => (
    <form
      onSubmit={handleExpensesSubmit}
      className="space-y-6 max-w-xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Monthly Income & Expenses
        </h2>
        <button
          type="button"
          onClick={() => setShowPercentages(!showPercentages)}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 font-medium"
        >
          Show {showPercentages ? "Amounts" : "Percentages"}
        </button>
      </div>

      {/* Monthly Salary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-black mb-3">Monthly Income</h3>
        <div>
          <label className="block text-black mb-2">
            Monthly Salary {showPercentages ? "(% of starting capital)" : "($)"}
            :
          </label>
          <input
            type="number"
            value={
              showPercentages
                ? getPercentage(monthlySalary, parseFloat(userInputCapital))
                : monthlySalary
            }
            onChange={(e) => {
              const newValue = parseFloat(e.target.value) || 0;
              const actualValue = showPercentages
                ? parseFloat(userInputCapital) * (newValue / 100)
                : newValue;
              setMonthlySalary(actualValue);
              // Update expenses when salary changes
              setMonthlyExpenses(calculateDefaultExpenses(actualValue));
            }}
            className="w-full p-2 border rounded-md text-black"
            min="0"
            step={showPercentages ? "0.1" : "1"}
            required
          />
        </div>
      </div>

      {/* Month Selection */}
      <div className="mb-6">
        <label className="block text-black font-bold text-lg mb-2">
          Number of Months:
        </label>
        <select
          value={selectedMonths}
          onChange={(e) => setSelectedMonths(parseInt(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black font-semibold"
          required
        >
          {months.map((_, index) => (
            <option key={index + 1} value={index + 1} className="text-black">
              {index + 1} Month{index > 0 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* State Selection */}
      <div className="mb-6">
        <label className="block text-black text-lg mb-2">
          <span className="font-extrabold">State of Residence:</span>
        </label>
        <select
          value={monthlyExpenses.state}
          onChange={(e) =>
            setMonthlyExpenses({ ...monthlyExpenses, state: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-semibold text-black"
          required
        >
          <option value="" className="text-black">
            Select State
          </option>
          {US_STATES.map((state) => (
            <option key={state} value={state} className="text-black">
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Essential Expenses */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-black mb-3">Essential Expenses</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries({
            "Health Insurance": monthlyExpenses.healthInsurance,
            Utilities: monthlyExpenses.utilities,
            Groceries: monthlyExpenses.groceries,
            Rent: monthlyExpenses.rent,
            "Internet/Cable": monthlyExpenses.internetCable,
          }).map(([label, value]) => (
            <div key={label}>
              <label className="block text-black mb-2">
                {label} {showPercentages ? "(%)" : "($)"}:
              </label>
              <input
                type="number"
                value={
                  showPercentages ? getPercentage(value, monthlySalary) : value
                }
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const actualValue = showPercentages
                    ? monthlySalary * (newValue / 100)
                    : newValue;
                  setMonthlyExpenses((prev) => ({
                    ...prev,
                    [label.toLowerCase().replace(/[^a-z]/g, "")]: actualValue,
                  }));
                }}
                className="w-full p-2 border rounded-md text-black"
                min="0"
                step={showPercentages ? "0.1" : "1"}
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-black mb-3">Subscriptions</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries({
            "Gym/Fitness": monthlyExpenses.gymFitness,
            "Streaming Services": monthlyExpenses.streamingServices,
          }).map(([label, value]) => (
            <div key={label}>
              <label className="block text-black mb-2">
                {label} {showPercentages ? "(%)" : "($)"}:
              </label>
              <input
                type="number"
                value={
                  showPercentages
                    ? getPercentage(value || 0, monthlySalary)
                    : value
                }
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const actualValue = showPercentages
                    ? monthlySalary * (newValue / 100)
                    : newValue;
                  setMonthlyExpenses((prev) => ({
                    ...prev,
                    [label.toLowerCase().replace(/[^a-z]/g, "")]: actualValue,
                  }));
                }}
                className="w-full p-2 border rounded-md text-black"
                min="0"
                step={showPercentages ? "0.1" : "1"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Loans */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-black mb-3">Monthly Loan Payments</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries({
            "Car Loan": monthlyExpenses.loans.carLoan,
            "Student Loan": monthlyExpenses.loans.studentLoan,
            "Home Loan": monthlyExpenses.loans.homeLoan,
          }).map(([label, value]) => (
            <div key={label}>
              <label className="block text-black mb-2">
                {label} {showPercentages ? "(%)" : "($)"}:
              </label>
              <input
                type="number"
                value={
                  showPercentages
                    ? getPercentage(value || 0, monthlySalary)
                    : value
                }
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const actualValue = showPercentages
                    ? monthlySalary * (newValue / 100)
                    : newValue;
                  setMonthlyExpenses((prev) => ({
                    ...prev,
                    loans: {
                      ...prev.loans,
                      [label.toLowerCase().replace(/[^a-z]/g, "")]: actualValue,
                    },
                  }));
                }}
                className="w-full p-2 border rounded-md text-black"
                min="0"
                step={showPercentages ? "0.1" : "1"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Add a note about monthly calculations */}
      <div className="bg-yellow-50 p-4 rounded-lg mt-4">
        <p className="text-sm text-black">
          <strong>Note:</strong> Your monthly salary will be added and expenses
          will be deducted at the end of each month. Salary will increase by 5%
          each month to account for career growth. All default expenses are
          calculated as a percentage of your monthly salary.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
      >
        Start Game
      </button>
    </form>
  );

  const generateScenarios = async () => {
    setLoading(true);
    try {
      const geminiApiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const startingCapital = parseFloat(userInputCapital);
      const fixedCostMin = startingCapital * 0.07;
      const fixedCostMax = startingCapital * 0.1;
      const bonusMin = startingCapital * 0.03;
      const bonusMax = startingCapital * 0.05;

      // Generate exactly 4 scenarios per month
      const totalScenarios = selectedMonths * 4;

      const prompt = `You are a finance expert playing a game, providing financial situations. You should not give repetitive , please.
Generate a JSON array with EXACTLY ${totalScenarios} unique scenario objects. Scenarios must be UNIQUE across months and rounds. Do not use the same scenarios.
Please try to make your scenarios sound human-like, casual. Each scenario object should have these keys:
"id" (number),
"category" (string),
"description" (string),
"options" (array of option objects, where each option has:
  "id" (number),
  "text" (string),
  "outcome" (object with "text" as string, "capitalChange" as number, optional "fixedCost" and "bonus")).
capitalChange is the number by which the user's capital is going to change as a result of the choice the user picks. It must not go above 0.5, or below -0.5.
Fixed cost must be between ${fixedCostMin} and ${fixedCostMax} (can be positive or negative).
Bonus must be between ${bonusMin} and ${bonusMax} (always positive).
The scenarios should cover topics such as Investing, Budgeting, Debt Management, Retirement Planning, and Emergency Funds, and related concepts.
Output only a valid JSON array without any extra text.`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      console.log("Raw generated text:", rawText);
      console.log("Expected number of scenarios:", totalScenarios);

      // Remove markdown code fences if present
      let jsonString = rawText.trim();
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.slice(7).trim(); // remove opening ```
        if (jsonString.endsWith("```")) {
          jsonString = jsonString.slice(0, -3).trim(); // remove closing ```
        }
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.slice(3).trim(); // remove opening ```
        if (jsonString.endsWith("```")) {
          jsonString = jsonString.slice(0, -3).trim(); // remove closing ```
        }
      }

      // Now parse the clean JSON string
      const generatedScenarios = JSON.parse(jsonString);

      // Verify we have the correct number of scenarios
      if (generatedScenarios.length !== totalScenarios) {
        console.error(
          `Expected ${totalScenarios} scenarios but got ${generatedScenarios.length}`
        );
        throw new Error("Incorrect number of scenarios generated");
      }

      setApiScenarios(generatedScenarios);
      setLoading(false);
    } catch (err) {
      console.error("Error generating scenarios via Gemini:", err);
      setLoading(false);
    }
  };

  const FINANCIAL_QUOTES = [
    "Budgeting your money is the key to having enough - Elizabeth Warren",
    "A budget is telling your money where to go instead of wondering where it went - Dave Ramsey",
    "Financial peace isn't the acquisition of stuff - Dave Ramsey",
    "The stock market is a device for transferring money from the impatient to the patient - Warren Buffett",
    "Every time you borrow money, you're robbing your future self - Nathan W. Morris",
    "Money is usually attracted, not pursued - Jim Rohn",
    "Financial fitness is reality if you're willing to pursue it - Will Robinson",
    "The most precious resource we have is time - Steve Jobs",
    "Wealth consists in having few wants - Epictetus",
    "Financial literacy is life-saving - Mellody Hobson"
  ];

  // Bubble animation component
const LoadingBubbles = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % FINANCIAL_QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-64 w-full">
      {/* Lottie bubble animation */}
      
      {/* Floating quotes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="animate-float text-xl font-semibold bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg transform transition-all duration-1000">
          {FINANCIAL_QUOTES[currentQuote]}
        </div>
      </div>
    </div>
  );
};

// Add this CSS animation
<style jsx global>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`}</style>

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex">
      <div
        className={`transition-all duration-300 ${
          showAnalysis ? "w-2/3 pr-4" : "w-full"
        }`}
      >
        <div className="bg-white rounded-lg shadow-md p-6 h-[calc(100vh-4rem)] overflow-y-auto">
          {gameOver ? (
            <div>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  win ? "text-green-600" : "text-red-600"
                }`}
              >
                {win ? "Game Over! Congratulations 🎉" : "Game Over!"}
              </h2>
              <p className="text-lg mb-4 text-black">
                Final Capital: ${capital.toFixed(2)}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => resetGame()}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Play Again
                </button>
                <button
                  onClick={generateAnalysis}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
                >
                  {showAnalysis ? "Update Analysis" : "Get Financial Analysis"}
                </button>
              </div>
              {renderHistoryAndGraph()}
            </div>
          ) : capital === 0 ? (
            showExpensesForm ? (
              renderExpensesForm()
            ) : (
              <div className="space-y-8">
                {/* New Hero Section */}
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-blue-600 mb-4">
                    Financial Literacy Challenge
                  </h1>
                  <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                    Test your money management skills across 20 real-world
                    financial scenarios. Can you grow your wealth while handling
                    life's surprises?
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2 text-black">
                      📈 Real-world Scenarios
                    </h3>
                    <p className="text-sm text-gray-600">
                      Investing, budgeting, debt management & more
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2 text-black">
                      🎯 Dynamic Outcomes
                    </h3>
                    <p className="text-sm text-gray-600">
                      AI-generated scenarios with realistic impacts
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2 text-black">
                      📊 Progress Tracking
                    </h3>
                    <p className="text-sm text-gray-600">
                      Visualize your financial journey with charts
                    </p>
                  </div>
                </div>

                {/* Game Start Section */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold text-center mb-6 text-black">
                    Start Your Journey
                  </h2>

                  {/* Preset Buttons */}
                  <div className="grid gap-4 mb-8">
                    <button
                      onClick={() => { setCustomOrNot(false); startScenarioGame(1000); }}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg transition-all disabled:opacity-50"
                    >
                      <span className="text-xl">💰</span>
                      <div>
                        <p className="font-semibold">Standard Mode</p>
                        <p className="text-sm opacity-90">Start with $1,000</p>
                      </div>
                    </button>

                    <button
                      onClick={() => startScenarioGame(500)}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg transition-all disabled:opacity-50"
                    >
                      <span className="text-xl">🏆</span>
                      <div>
                        <p className="font-semibold">Challenge Mode</p>
                        <p className="text-sm opacity-90">Start with $500</p>
                      </div>
                    </button>
                  </div>

                  {/* Custom Input */}
                  <div className="flex items-center my-8">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-gray-400 text-sm">or</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <form onSubmit={(e) => { setCustomOrNot(true); handleScenarioStart(e); }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Starting Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
                          $
                        </span>
                        <input
                          type="number"
                          value={userInputCapital}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ""
                            );
                            setUserInputCapital(value);
                          }}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                          placeholder="Enter custom amount"
                          min="1"
                          step="1"
                          disabled={loading}
                        />
                      </div>
                      {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? "Starting Game..." : "Start Custom Game"}
                    </button>
                  </form>

                  {/* Loading Overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-xl">
                      <Spinner />
                      <p className="mt-4 text-gray-600">
                        Generating your scenarios...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        This usually takes 10-15 seconds
                      </p>
                    </div>
                  )}
                </div>

                {/* Game Tips */}
                <div className="text-center text-gray-600 text-sm mt-8">
                  <p>🔄 Press 'Play Again' anytime to restart</p>
                  <p>📈 Your progress saves automatically between rounds</p>
                </div>
              </div>
            )
          ) : showResult ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center mb-4 text-gray-900">
                Round Result
              </h2>
              <p className="text-lg text-gray-900">{currentResult?.text}</p>
              <p className="text-lg text-gray-900">
                New Capital: ${currentResult?.newCapital.toFixed(2)}
              </p>
              <button
                onClick={continueGame}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Continue to Next Round
              </button>
              {renderHistoryAndGraph()}
            </div>
          ) : loading ? (
            // Loading Screen
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                Generating Scenarios...
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                This usually takes 10-15 seconds
              </p>
              <Spinner />
              {/* <LoadingBubbles /> */}
              <Lottie animationData={groovyWalkAnimation} loop={true} />
            </div>
          ) : apiScenarios ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Current Capital: ${capital.toFixed(2)}
                </h2>
                <p className="text-lg mb-2 text-black">
                  {months[currentMonth].name} - Round {currentMonthRound} of{" "}
                  {months[currentMonth].rounds}
                </p>
                <p className="text-lg mb-4 text-black">
                  {apiScenarios &&
                    apiScenarios[currentScenarioIndex].description}
                </p>
                <div className="space-y-3">
                  {apiScenarios &&
                    apiScenarios[currentScenarioIndex].options.map((option) => (
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
              {renderHistoryAndGraph()}
            </div>
          ) : null}
        </div>
      </div>

      {/* Analysis Side Panel */}
      {showAnalysis && (
        <div className="w-1/3 pl-4 transition-all duration-300">
          <div className="bg-white rounded-lg shadow-md p-6 h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Financial Analysis
              </h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="sr-only">Close</span>✕
              </button>
            </div>

            {analysisLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Analyzing Your Financial Decisions...
                </h2>
                <Spinner />
              </div>
            ) : currentResult?.text ? (
              <div className="overflow-y-auto max-h-[calc(100vh-200px)] text-gray-900">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatAnalysis(currentResult.text),
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
