import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ForecastChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        title: { display: true, text: 'Energy Demand (kWh)' }
      }
    }
  };

  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Predicted Demand',
        data: data.map(d => d.predicted_kwh),
        borderColor: 'rgb(99, 102, 241)', // indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderDash: [5, 5], // Dashed line to indicate forecast
        tension: 0.4
      },
      {
        label: 'Actual Demand (if available)',
        data: data.map(d => d.actual_kwh),
        borderColor: 'rgb(14, 165, 233)', // primary-500
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.4,
        spanGaps: true
      },
    ]
  };

  return (
    <div className="h-[350px] w-full">
      <Line options={options} data={chartData} />
    </div>
  );
}
