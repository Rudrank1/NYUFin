import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const GameSetup = () => {
  const [gameMode, setGameMode] = useState('default');
  const [gameConfig, setGameConfig] = useState({
    monthlyIncome: '',
    state: '',
    initialFunds: '',
    expenditures: {
      healthInsurance: '',
      utilities: '',
      grocery: '',
      rent: '',
      subscriptions: [],
      internet: '',
      loans: [],
      creditCard: '',
      tuition: ''
    }
  });

  const handleGameModeChange = (value) => {
    if (value === 'random') {
      // TODO: Implement randomization logic
      return;
    }
    setGameMode(value);
  };

  const handleConfigChange = (field, value) => {
    if (field.includes('.')) {
      const [category, subfield] = field.split('.');
      setGameConfig(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [subfield]: value
        }
      }));
    } else {
      setGameConfig(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const startGame = () => {
    // TODO: Validate inputs and start game
    console.log('Starting game with config:', { gameMode, gameConfig });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>WealthQuest Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Game Mode</label>
            <Select onValueChange={handleGameModeChange} defaultValue={gameMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select game mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Time Limit Mode</SelectItem>
                <SelectItem value="car">Buy a Car</SelectItem>
                <SelectItem value="house">Buy a House</SelectItem>
                <SelectItem value="loans">Pay Student Loans</SelectItem>
                <SelectItem value="random">Random Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly CTC</label>
              <Input 
                type="number"
                placeholder="Enter monthly income"
                value={gameConfig.monthlyIncome}
                onChange={(e) => handleConfigChange('monthlyIncome', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State of Residence</label>
              <Select onValueChange={(value) => handleConfigChange('state', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="ca">California</SelectItem>
                  <SelectItem value="tx">Texas</SelectItem>
                  {/* Add more states */}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fixed Expenditures */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fixed Expenditures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                'Health Insurance': 'healthInsurance',
                'Utilities': 'utilities',
                'Grocery': 'grocery',
                'Rent': 'rent',
                'Internet & Cable': 'internet',
                'Credit Card': 'creditCard',
                'Tuition': 'tuition'
              }).map(([label, field]) => (
                <div key={field} className="space-y-2">
                  <label className="text-sm font-medium">{label}</label>
                  <Input
                    type="number"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={gameConfig.expenditures[field]}
                    onChange={(e) => handleConfigChange(`expenditures.${field}`, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={startGame}
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSetup;