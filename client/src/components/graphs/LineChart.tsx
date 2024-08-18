"use client";

import { Line } from "react-chartjs-2";

type DatasetType = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
};

export default function LineChart({
  labels,
  datasets,
  options,
}: {
  labels: string[];
  datasets: DatasetType[];
  options?: any;
}) {
  return (
    <div className="h-full grow overflow-hidden">
      <Line
        width="100%"
        height="100%"
        data={{
          labels,
          datasets,
        }}
        options={options || {
          plugins: {
            legend: {
              display: false
            },
          },
          maintainAspectRatio: false,
          responsive: true,
          elements: {
            line: {
              tension : 0.4,
              cubicInterpolationMode: 'monotone',
            },
          },
        }}
      />
    </div>
  );
}
