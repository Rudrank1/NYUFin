import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialGraphProps {
  rounds: number[];
  capitals: number[];
}

export default function FinancialGraph({ rounds, capitals }: FinancialGraphProps) {
  const data = {
    labels: rounds, // Game rounds
    datasets: [
      {
        label: 'Capital Over Time',
        data: capitals, // Capital values
        borderColor: 'blue',
        backgroundColor: 'rgba(173,216,230,0.5)',
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Financial Progress Over Game Rounds'
      }
    }
  };

  return <Line data={data} options={options} />;
}
