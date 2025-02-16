"use client";

import { useState } from "react";
import Link from "next/link";

const STATE_DATA = {
  California: { costOfLiving: 1.5, stateTax: 0.09, propertyGrowth: 0.05, rentalYield: 0.04 },
  Texas: { costOfLiving: 1.1, stateTax: 0.00, propertyGrowth: 0.04, rentalYield: 0.05 },
  Florida: { costOfLiving: 1.2, stateTax: 0.00, propertyGrowth: 0.045, rentalYield: 0.05 },
  "New York": { costOfLiving: 1.7, stateTax: 0.065, propertyGrowth: 0.06, rentalYield: 0.035 },
};

const FEDERAL_TAX_BRACKETS = [
  [0, 11000, 0.10],
  [11001, 44725, 0.12],
  [44726, 95375, 0.22],
  [95376, 182100, 0.24],
  [182101, 231250, 0.32],
  [231251, 578125, 0.35],
  [578126, Infinity, 0.37]
];

const STANDARD_DEDUCTION = 13850;

export default function FIRECalculator() {
  const [activeTab, setActiveTab] = useState('fire'); // 'fire', 'emergency', or 'tax'
  const [inputs, setInputs] = useState({
    age: 25,
    state: "California",
    baseExpenses: 40000,
    initialSavings: 50000,
    annualSavings: 20000,
    investmentReturn: 0.07,
    propertyMaturity: 15,
    propertyValue: 200000,
    rentalIncome: 5000,
    withdrawalRate: 0.04,
  });

  const [results, setResults] = useState<{
    fireNumber: number;
    yearsNeeded: number;
    retirementAge: number | string;
  } | null>(null);

  // Emergency Fund State
  const [emergencyInputs, setEmergencyInputs] = useState({
    monthlyExpenses: 3500,
    currentSavings: 5000
  });

  // Tax Calculator State
  const [taxInputs, setTaxInputs] = useState({
    income: 50000,
    state: "California"
  });

  const calculateFIRENumber = (annualExpenses: number, passiveIncome = 0, withdrawalRate = 0.04) => {
    return (annualExpenses - passiveIncome) / withdrawalRate;
  };

  const calculateYearsToFIRE = () => {
    const stateFactors = STATE_DATA[inputs.state as keyof typeof STATE_DATA];
    const adjustedExpenses = inputs.baseExpenses * stateFactors.costOfLiving;
    const effectiveSavings = inputs.annualSavings * (1 - stateFactors.stateTax);
    
    const fireNumber = calculateFIRENumber(adjustedExpenses, inputs.rentalIncome, inputs.withdrawalRate);
    let currentSavings = inputs.initialSavings;
    let years = 0;

    while (currentSavings < fireNumber) {
      currentSavings += effectiveSavings;
      currentSavings *= (1 + inputs.investmentReturn);
      years++;
      
      if (years === inputs.propertyMaturity) {
        currentSavings += inputs.propertyValue * Math.pow(1 + stateFactors.propertyGrowth, years);
      }

      if (years > 100) {
        return null;
      }
    }

    return {
      fireNumber,
      yearsNeeded: years,
      retirementAge: inputs.age + years
    };
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const results = calculateYearsToFIRE();
    setResults(results);
  };

  const calculateFederalTax = (income: number) => {
    let tax = 0;
    const taxableIncome = Math.max(0, income - STANDARD_DEDUCTION);

    for (const [lower, upper, rate] of FEDERAL_TAX_BRACKETS) {
      if (taxableIncome > lower) {
        const taxableAmount = Math.min(taxableIncome, upper) - lower;
        tax += taxableAmount * rate;
      }
    }
    return Math.round(tax * 100) / 100;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Financial Planning Tools</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Back to Game
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('fire')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'fire' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            FIRE Calculator
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'emergency' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            Emergency Fund
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'tax' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            Tax Calculator
          </button>
        </div>

        {/* Tab Descriptions */}
        <div className="mb-6 text-black">
          {activeTab === 'fire' && (
            <p className="text-sm">Calculate how much you need to save and how long it will take to achieve financial independence and early retirement based on your current finances and goals.</p>
          )}
          {activeTab === 'emergency' && (
            <p className="text-sm">Track your emergency fund progress and see how many months of expenses you've covered. Financial experts recommend having 3-6 months of expenses saved.</p>
          )}
          {activeTab === 'tax' && (
            <p className="text-sm">Estimate your tax burden across federal, state, and FICA taxes based on your income and state of residence.</p>
          )}
        </div>

        {/* FIRE Calculator Tab */}
        {activeTab === 'fire' && (
          <form onSubmit={handleCalculate} className="space-y-6 text-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={inputs.age}
                  onChange={(e) => setInputs({ ...inputs, age: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <select
                  value={inputs.state}
                  onChange={(e) => setInputs({ ...inputs, state: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.keys(STATE_DATA).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add more form inputs for other fields */}
              {/* ... */}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate FIRE Number
            </button>
          </form>
        )}

        {/* Emergency Fund Tab */}
        {activeTab === 'emergency' && (
          <div className="p-4 shadow-lg rounded-lg bg-white text-black">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Emergency Fund Tracker</h2>
              
              <label className="block font-semibold">
                Monthly Expenses: ${emergencyInputs.monthlyExpenses}
              </label>
              <input
                type="range"
                value={emergencyInputs.monthlyExpenses}
                min={1000}
                max={10000}
                step={100}
                onChange={(e) => 
                  setEmergencyInputs({...emergencyInputs, monthlyExpenses: Number(e.target.value)})
                }
                className="w-full"
              />
              
              <label className="block font-semibold mt-4">
                Current Savings: ${emergencyInputs.currentSavings}
              </label>
              <input
                type="range"
                value={emergencyInputs.currentSavings}
                min={0}
                max={50000}
                step={500}
                onChange={(e) => 
                  setEmergencyInputs({...emergencyInputs, currentSavings: Number(e.target.value)})
                }
                className="w-full"
              />
              
              <div className="mt-6">
                <p><strong>Months Covered:</strong> {(emergencyInputs.currentSavings / emergencyInputs.monthlyExpenses).toFixed(2)} months</p>
                <p><strong>Needed for 6 months:</strong> ${emergencyInputs.monthlyExpenses * 6}</p>
                <p><strong>Needed for 12 months:</strong> ${emergencyInputs.monthlyExpenses * 12}</p>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min((emergencyInputs.currentSavings / (emergencyInputs.monthlyExpenses * 12)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Calculator Tab */}
        {activeTab === 'tax' && (
          <div className="p-4 shadow-lg rounded-lg bg-white text-black">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Tax Calculator</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold">Annual Income</label>
                  <input
                    type="number"
                    value={taxInputs.income}
                    onChange={(e) => setTaxInputs({...taxInputs, income: Number(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold">State</label>
                  <select
                    value={taxInputs.state}
                    onChange={(e) => setTaxInputs({...taxInputs, state: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    {Object.keys(STATE_DATA).map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Tax Breakdown</h3>
                  <div className="space-y-2">
                    <p>Federal Tax: ${calculateFederalTax(taxInputs.income).toLocaleString()}</p>
                    <p>State Tax: ${(taxInputs.income * STATE_DATA[taxInputs.state as keyof typeof STATE_DATA].stateTax).toLocaleString()}</p>
                    <p>FICA: ${(taxInputs.income * 0.0765).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg text-black">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-2">
              <p>FIRE Number: ${results.fireNumber.toLocaleString()}</p>
              <p>Years to FIRE: {results.yearsNeeded}</p>
              <p>Retirement Age: {results.retirementAge}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 