"use client";

import { useState, FormEvent } from "react";
import FinancialGraph from "./financeChart";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Spinner from "./spinner";

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

const months: Month[] = [
  { name: "January", days: 31, rounds: 4 },
  { name: "February", days: 28, rounds: 3 },
  { name: "March", days: 31, rounds: 4 },
  { name: "April", days: 30, rounds: 3 },
  { name: "May", days: 31, rounds: 4 },
  { name: "June", days: 30, rounds: 3 },
  { name: "July", days: 31, rounds: 4 },
  { name: "August", days: 31, rounds: 4 },
  { name: "September", days: 30, rounds: 3 },
  { name: "October", days: 31, rounds: 4 },
  { name: "November", days: 30, rounds: 3 },
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

  const generateScenarios = async () => {
    setLoading(true); // Show loading spinner
    try {
      const geminiApiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a finance expert playing a game, where your goal is to make the user's capital fall to 0.
However, your prompts must also give them a realistic chance at beating you, while giving them a hard time.
Generate a JSON array with 20 scenario objects. Please try to make your scenarios sound human-like, casual. Each scenario object should have these keys:
"id" (number),
"category" (string),
"description" (string),
"options" (array of option objects, where each option has:
  "id" (number),
  "text" (string),
  "outcome" (object with "text" as string, "capitalChange" as number, optional "fixedCost" and "bonus")).
capitalChange is the number by which the user's capital is going to change as a result of the choice the user picks. It must not go above 0.5, or below -0.5.
Fixed cost must not go above  or below -10000 as is a cost incurred by the user as a result of his choice in an expense question only. Bonus must not go above 5000 or below 0, as it is a random surprise number given only when the user reveives a surprise bonus like a birthday gift. The capital bonus and cost have to be real world relevant. Please do not exaggerate values. Stay within 100k. Stay within real world limits.
The scenarios should cover topics such as Investing, Budgeting, Debt Management, Retirement Planning, and Emergency Fund and mimic the style of the provided scenarios.
Output only a valid JSON array without any extra text.`;

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

      // Now parse the clean JSON string
      const generatedScenarios = JSON.parse(jsonString);
      setApiScenarios(generatedScenarios);
      setLoading(false);
    } catch (err) {
      console.error("Error generating scenarios via Gemini:", err);
    }
  };

  const handleScenarioStart = (e: React.FormEvent) => {
    e.preventDefault();
    const startingCapital = parseFloat(userInputCapital);

    if (isNaN(startingCapital) || startingCapital <= 0) {
      setError("Please enter a valid starting amount");
      return;
    }

    startScenarioGame(startingCapital);
    setError("");
    generateScenarios();
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
    if (currentMonthRound >= months[currentMonth].rounds) {
      if (currentMonth + 1 >= months.length) {
        setGameOver(true);
        setWin(newCapital > 0);
      } else {
        setCurrentMonth((prev) => prev + 1);
        setCurrentMonthRound(1);
      }
    } else {
      setCurrentMonthRound((prev) => prev + 1);
    }

    setCapital(newCapital);
    setCurrentRound((prevRound) => prevRound + 1);

    if (newCapital < 50) {
      setGameOver(true);
      setWin(false);
    } else {
      if (apiScenarios) {
        setCurrentScenarioIndex((prev) => (prev + 1) % apiScenarios.length);
      }
    }

    if (currentRound >= 20) {
      setGameOver(true);
      setWin(newCapital > 0);
    }
  };

  const startScenarioGame = (initialCapital: number) => {
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
  };

  // New continueGame function
  const continueGame = () => {
    setCapital(currentResult?.newCapital || 0);
    setShowResult(false);

    // Check if game should end
    if (currentMonth >= months.length) {
      setGameOver(true);
    } else if (currentScenarioIndex + 1 >= apiScenarios!.length) {
      setCurrentScenarioIndex(0); // Reset scenarios if we run out
    } else {
      setCurrentScenarioIndex((prev) => prev + 1);
    }
  };

  const resetGame = () => {
    // Set the capital to 0 so the starting screen (capital === 0) renders
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
        formattedHTML += `<h4 class="font-bold mt-4">${processedLine}</h4>`;
      } else if (/^Conclusion/.test(line)) {
        formattedHTML += `<h4 class="font-bold mt-6">${processedLine}</h4>`;
      } else {
        formattedHTML += `<p class="mt-2">${processedLine}</p>`;
      }
    });

    return formattedHTML;
  };

  const generateAnalysis = async () => {
    setLoading(true); // Show loading spinner
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

      setCurrentResult({ text: rawText, newCapital: capital }); // Store analysis in currentResult
    } catch (err) {
      console.error("Error generating analysis via Gemini:", err);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
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
            <button
              onClick={() => resetGame()}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Play Again
            </button>
            <button
              onClick={generateAnalysis} // Trigger Gemini analysis
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 mt-4"
            >
              Get Financial Analysis
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
                    {index === 0 ? (
                      <p>Starting Capital: ${entry.capital.toFixed(2)}</p>
                    ) : (
                      <>
                        <p>
                          {entry.month} - Round {entry.monthRound} (Overall
                          Round {entry.round}): ${entry.capital.toFixed(2)}
                        </p>
                        <p className="text-sm">Scenario: {entry.description}</p>
                        <p className="text-sm">Choice: {entry.choice}</p>
                        <p className="text-sm">Result: {entry.result}</p>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <FinancialGraph
                rounds={gameHistory.map((entry) => entry.round)}
                capitals={gameHistory.map((entry) => entry.capital)}
              />
            </div>
            {/* Display Analysis */}
            {currentResult?.text && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md text-black">
                <h3 className="text-xl font-semibold mb-4">
                  Financial Analysis:
                </h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatAnalysis(currentResult.text),
                  }}
                />
              </div>
            )}
          </div>
        ) : capital === 0 ? (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
              Financial Literacy Challenge
            </h1>
            <form onSubmit={handleScenarioStart} className="space-y-4">
              <div>
                <label className="block text-black mb-2">
                  Enter Starting Capital ($):
                </label>
                <input
                  type="number"
                  value={userInputCapital}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    setUserInputCapital(value);
                  }}
                  className="w-full p-2 border rounded-md text-black"
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
            <button
              onClick={() => startScenarioGame(1000)}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
            >
              Start with $1000 (Easy Mode)
            </button>
            <button
              onClick={() => startScenarioGame(500)}
              className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700"
            >
              Start with $500 (Hard Mode)
            </button>
            {/* Button to trigger Gemini API scenario generation */}
            {/* <button
              onClick={generateScenarios}
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 mt-4"
            >
              Generate Scenarios
            </button> */}
          </div>
        ) : showResult ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Round Result</h2>
            <p className="text-lg text-black">{currentResult?.text}</p>
            <p className="text-lg text-black">
              New Capital: ${currentResult?.newCapital.toFixed(2)}
            </p>
            <button
              onClick={continueGame}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Continue to Next Round
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
                    {index === 0 ? (
                      <p>Starting Capital: ${entry.capital.toFixed(2)}</p>
                    ) : (
                      <>
                        <p>
                          {entry.month} - Round {entry.monthRound} (Overall
                          Round {entry.round}): ${entry.capital.toFixed(2)}
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
          </div>
        ) : loading ? (
          // Loading Screen
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Generating Scenarios...
            </h2>
            <Spinner />
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
                {apiScenarios && apiScenarios[currentScenarioIndex].description}
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
                    {index === 0 ? (
                      <p>Starting Capital: ${entry.capital.toFixed(2)}</p>
                    ) : (
                      <>
                        <p>
                          {entry.month} - Round {entry.monthRound} (Overall
                          Round {entry.round}): ${entry.capital.toFixed(2)}
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
