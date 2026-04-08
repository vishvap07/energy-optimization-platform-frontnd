import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ConsumptionChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Consumption (kWh)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.timestamp);
      return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:00`;
    }),
    datasets: [
      {
        fill: true,
        label: 'Energy Consumption',
        data: data.map(d => d.consumption_kwh),
        borderColor: 'rgb(14, 165, 233)', // primary-500
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
        pointHoverRadius: 4,
      }
    ]
  };

  return (
    <div className="h-[300px] w-full">
      <Line options={options} data={chartData} />
    </div>
  );
}
