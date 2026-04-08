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

export default function PeakDemandChart({ data, threshold = 70 }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        title: { display: true, text: 'Average Demand (kW)' }
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Hourly Demand Profiling',
        data: data.map(d => d.avg_demand_kw),
        backgroundColor: data.map(d => 
          d.is_peak ? 'rgba(239, 68, 68, 0.8)' : 'rgba(14, 165, 233, 0.6)'
        ), // Red-500 for peak, Primary-500 for normal
        borderRadius: 4,
      }
    ]
  };

  return (
    <div className="w-full">
      <div className="h-[350px]">
        <Bar options={options} data={chartData} />
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-sm justify-center border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0ea5e9]/60"></div>
          <span className="text-gray-600 font-medium">Off-Peak (Base Load)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/80"></div>
          <span className="text-gray-600 font-medium">Peak Hours (&gt;{threshold} kW)</span>
        </div>
      </div>
    </div>
  );
}
