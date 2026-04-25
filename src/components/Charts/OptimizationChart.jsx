import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
        beginAtZero: true,
        title: { display: true, text: 'Demand (kW)', font: { weight: 'bold' } },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        type: 'line',
        label: 'Optimized Demand (Target)',
        data: data.map(d => d.demand_after_kw),
        borderColor: '#10b981', // Emerald-500
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        zIndex: 2,
      },
      {
        type: 'bar',
        label: 'Original Demand',
        data: data.map(d => d.demand_before_kw),
        backgroundColor: 'rgba(156, 163, 175, 0.3)', // Gray-400
        borderRadius: 4,
        zIndex: 1,
      }
    ]
  };

  return (
    <div className="h-[380px] w-full">
      <Chart type='bar' options={options} data={chartData} />
    </div>
  );
}
