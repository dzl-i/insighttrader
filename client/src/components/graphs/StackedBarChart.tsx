"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

type DatasetType = {
  label: string;
  data: number[];
  backgroundColor: string;
};

export default function StackedBarChart({
  labels,
  datasets,
  height,
}: {
  labels: string[];
  datasets: DatasetType[];
  height?: number;
}) {
  return (
    <div className="h-full grow overflow-hidden">
      <Bar
        width="100%"
        height="100%"
        data={{
          labels,
          datasets,
        }}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
        }}
      />
    </div>
  );
}
