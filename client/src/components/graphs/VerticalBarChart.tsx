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

export default function VerticalBarChart({
  labels,
  datasets,
  height,
}: {
  labels: string[];
  datasets: DatasetType[];
  height?: number;
}) {
  return (
    <div className="w-full h-full min-h-0 overflow-hidden">
      <Bar
        width="100%"
        height="100%"
        className="min-h-0"
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
          aspectRatio: 2 / 1,
          maintainAspectRatio: true,
          responsive: true,
        }}
      />
    </div>
  );
}
