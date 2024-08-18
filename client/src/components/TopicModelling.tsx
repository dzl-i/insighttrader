"use client";

import { useState, useMemo } from "react";
import LineChart from "~/components/graphs/LineChart";
import { get } from "~/lib/request";

type TopicSentimentType = {
  month: string;
  total_articles: number;
  positive: number;
  neutral: number;
  negative: number;
};

type EntityType = {
  entity: string;
  sentiment: TopicSentimentType[];
};

export default function TopicModelling({ topics }: { topics: EntityType[] }) {
  const convertSentimentToChart = (sentiment: TopicSentimentType[]) => {
    return {
      labels: sentiment.map((e: TopicSentimentType) => e.month),
      datasets: [
        {
          label: "Positive",
          data: sentiment.map((e: TopicSentimentType) => e.positive),
          borderColor: "rgb(83, 221, 108)",
          backgroundColor: "rgb(83, 221, 108)",
        },
        {
          label: "Neutral",
          data: sentiment.map((e: TopicSentimentType) => e.neutral),
          borderColor: "rgb(255, 193, 7)",
          backgroundColor: "rgb(255, 193, 7)",
        },
        {
          label: "Negative",
          data: sentiment.map((e: TopicSentimentType) => e.negative),
          borderColor: "rgb(192, 50, 33)",
          backgroundColor: "rgb(192, 50, 33)",
        },
      ],
    };
  };
  const [topic, setTopic] = useState<EntityType>(topics[0] as EntityType);

  const topicModelling = useMemo(
    () => convertSentimentToChart(topic.sentiment),
    [topic],
  );

  return (
    <>
      {/* Topic buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {topics.map((topicItem: EntityType, index) => (
          <button
            key={index}
            onClick={() => setTopic(topicItem)}
            className={`${topicItem.entity === topic.entity && "bg-blue-500/25 text-blue-500"} rounded-lg px-6 py-2 text-sm transition-all duration-150`}
          >
            {topicItem.entity}
          </button>
        ))}
      </div>
      <div className="w-[800px]">
        <LineChart
          labels={topicModelling.labels}
          datasets={topicModelling.datasets}
        />
      </div>
    </>
  );
}
