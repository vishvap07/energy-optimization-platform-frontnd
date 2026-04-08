import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function OptimizationChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        title: { display: true, text: 'Demand (kW)' }
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Original Demand',
        data: data.map(d => d.demand_before_kw),
        backgroundColor: 'rgba(156, 163, 175, 0.5)', // Gray-400
        borderRadius: 4,
      },
      {
        label: 'Optimized Demand (Peak Shaved)',
        data: data.map(d => d.demand_after_kw),
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald-500 (Green)
        borderRadius: 4,
      }
    ]
  };

  return (
    <div className="h-[350px] w-full">
      <Bar options={options} data={chartData} />
    </div>
  );
}
