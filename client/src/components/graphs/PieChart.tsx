"use client";

import { Pie } from "react-chartjs-2";

type DataType = {
  label: string;
  value: number;
  color: string;
};

export default function PieChart({
  heading,
  datas,
}: {
  heading: string;
  datas: DataType[];
}) {
  return (
    <div className="relative h-full overflow-hidden">
      <Pie
        width="100%"
        data={{
          labels: datas.map((data) => data.label),
          datasets: [
            {
              label: heading,
              data: datas.map((data) => data.value),
              backgroundColor: datas.map((data) => data.color),
              borderWidth: 0,
            },
          ],
        }}
        options={{
          plugins: {
            legend: { position: "right", align: "center", labels: { boxWidth: 10 } },
          },
          maintainAspectRatio: false,
          responsive: true,
        }}
      />
    </div>
  );
}
