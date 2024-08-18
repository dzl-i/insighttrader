"use client";

import { Bar } from "react-chartjs-2";

type DataType = {
  label: string;
  value: number;
};

export default function BarChart({ labels, datasets }: { labels: string[]; datasets: any[]}) {
  return (
    <div className="min-h-64 w-full h-full overflow-hidden">
      <Bar
        width="100%"
        height="100%"
        data={{
          labels: labels,
          datasets: datasets
        }}
        options={{
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          responsive: true,
        }}
      />
    </div>
  );
}
