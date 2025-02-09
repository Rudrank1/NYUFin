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
  labels?: string[];
}

export default function FinancialGraph({ rounds, capitals, labels }: FinancialGraphProps) {
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
    },
    scales: {
      x: {
        title: {
          display: true,
          text: labels ? 'Month' : 'Round'
        },
        ticks: {
          callback: function(value: any) {
            if (labels) {
              return labels[value];
            }
            return value;
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Capital ($)'
        }
      }
    }
  };

  return <Line data={data} options={options} />;
}
