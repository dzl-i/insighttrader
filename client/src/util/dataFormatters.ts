interface SentimentData {
  sentiment_group: "Positive" | "Neutral" | "Negative";
  count: number;
}

interface DataPoint {
  label: string;
  value: number;
  color: string;
}


const formatSentiment = (result: any[]): any[] => {
  return result.map(
    (sentiment: {
      sentiment_group: "Positive" | "Neutral" | "Negative";
      count: number;
    }) => {
      let color;
      switch (sentiment.sentiment_group) {
        case "Positive":
          color = "rgb(83, 221, 108)";
          break;
        case "Neutral":
          color = "rgb(255, 193, 7)";
          break;
        case "Negative":
          color = "rgb(192, 50, 33)";
          break;
      }
      return {
        label: sentiment.sentiment_group,
        value: sentiment.count,
        color,
      };
    }
  );
}

const formatClassificationDistribution = (result: any[]): any => {
  const labels = result.map(
    (classification: { classification: string }) => classification.classification,
  );

  const datasets = [
    {
      label: "Classification Distribution",
      data: result.map(
        (classification: { count: number }) => classification.count,
      ),
      backgroundColor: [
        "rgb(83, 221, 108)",
        "rgb(255, 193, 7)",
        "rgb(192, 50, 33)",
      ],
    },
  ];

  return {
    labels,
    datasets,
  };
}

const formatHotTopics = (result: any[]): any[] => {
  return result.map((entity: { entity: string; count: number }) => ({
    text: entity.entity,
    value: entity.count,
  }))
}

const formatTopicSentiment = (result: any[]): any => {
  const topicSentimentLabels = result.map(
    (e: {
      classification: string;
      positive: number;
      neutral: number;
      negative: number;
    }) => e.classification,
  );

  const topicSentimentDataset = [
    {
      label: "Negative",
      data: result.map(
        (e: {
          classification: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.negative,
      ),
      backgroundColor: "rgb(192, 50, 33)",
    },
    {
      label: "Neutral",
      data: result.map(
        (e: {
          classification: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.neutral,
      ),
      backgroundColor: "rgb(255, 193, 7)",
    },
    {
      label: "Positive",
      data: result.map(
        (e: {
          classification: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.positive,
      ),
      backgroundColor: "rgb(83, 221, 108)",
    },
  ];

  console.log({
    labels: topicSentimentLabels,
    datasets: topicSentimentDataset,
  });
  return {
    labels: topicSentimentLabels,
    datasets: topicSentimentDataset,
  };
}

// const topicSentimentOverTimeLabels = topicSentimentOverTime.map(
//   (e: TopicSentimentType) => e.month,
// );
// const topicSentimentOverTimeDatasets = [
//   {
//     label: "Positive",
//     data: topicSentimentOverTime.map((e: TopicSentimentType) => e.positive),
//     borderColor: "rgb(83, 221, 108)",
//   },
//   {
//     label: "Neutral",
//     data: topicSentimentOverTime.map((e: TopicSentimentType) => e.neutral),
//     borderColor: "rgb(255, 193, 7)",
//   },
//   {
//     label: "Negative",
//     data: topicSentimentOverTime.map((e: TopicSentimentType) => e.negative),
//     borderColor: "rgb(192, 50, 33)",
//   },
// ];
// setMarketSentimentOverTime({
//   labels: topicSentimentOverTimeLabels,
//   datasets: topicSentimentOverTimeDatasets,
// });

const formatTopicSentimentOverTime = (result: any[]): any => {
  const topicSentimentOverTimeLabels = result.map(
    (e: { month: string }) => e.month,
  );

  const topicSentimentOverTimeDatasets = [
    {
      label: "Positive",
      data: result.map(
        (e: {
          month: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.positive,
      ),
      borderColor: "rgb(83, 221, 108)",
    },
    {
      label: "Neutral",
      data: result.map(
        (e: {
          month: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.neutral,
      ),
      borderColor: "rgb(255, 193, 7)",
    },
    {
      label: "Negative",
      data: result.map(
        (e: {
          month: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.negative,
      ),
      borderColor: "rgb(192, 50, 33)",
    },
  ];

  return {
    labels: topicSentimentOverTimeLabels,
    datasets: topicSentimentOverTimeDatasets,
  };
}

// const convertSentimentToChart = (sentiment: TopicSentimentType[]) => {
//   return {
//     labels: sentiment.map((e: TopicSentimentType) => e.month),
//     datasets: [
//       {
//         label: "Positive",
//         data: sentiment.map((e: TopicSentimentType) => e.positive),
//         borderColor: "rgb(83, 221, 108)",
//         backgroundColor: "rgb(83, 221, 108)",
//       },
//       {
//         label: "Neutral",
//         data: sentiment.map((e: TopicSentimentType) => e.neutral),
//         borderColor: "rgb(255, 193, 7)",
//         backgroundColor: "rgb(255, 193, 7)",
//       },
//       {
//         label: "Negative",
//         data: sentiment.map((e: TopicSentimentType) => e.negative),
//         borderColor: "rgb(192, 50, 33)",
//         backgroundColor: "rgb(192, 50, 33)",
//       },
//     ],
//   };
// };
// const [topic, setTopic] = useState<EntityType>(topics[0] as EntityType);

// const topicModelling = useMemo(
//   () => convertSentimentToChart(topic.sentiment),
//   [topic],
// );

const formatSpecificTopicSentimentOverTime = (result: any[]): any => {
  const topicSentimentOverTimeLabels = result.map(
    (e: { month: string }) => e.month,
  );

  const topicSentimentOverTimeDatasets = [
    {
      label: "Positive",
      data: result.map(
        (e: {
          month: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.positive,
      ),
      borderColor: "rgb(83, 221, 108)",
    },
    {
      label: "Neutral",
      data: result.map(
        (e: {
          month: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.neutral,
      ),
      borderColor: "rgb(255, 193, 7)",
    },
    {
      label: "Negative",
      data: result.map(
        (e: {
          month: string;
          positive: number;
          neutral: number;
          negative: number;
        }) => e.negative,
      ),
      borderColor: "rgb(192, 50, 33)",
    },
  ];

  console.log({
    labels: topicSentimentOverTimeLabels,
    datasets: topicSentimentOverTimeDatasets,
  });

  return {
    labels: topicSentimentOverTimeLabels,
    datasets: topicSentimentOverTimeDatasets,
  };
}

const formatLineGraphOfTopicSentiment = (result: any[]): any => {
  const topicSentimentOverTimeLabels = result.map(
    (e: { month: string }) => e.month,
  );

  const topicSentimentOverTimeDatasets: any[] = [
    {
      label: "Average Sentiment",
      data: result.map(
        (e: {
          month: string;
          average_sentiment: number;
        }) => e.average_sentiment,
      ),
      borderColor: "rgb(83, 221, 108)",
    },
  ];

  // const options = {
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //     }
  //   },
  //   plugins: {
  //     annotation: {
  //       annotations: {
  //         line: {
  //           type: 'line',
  //           yMin: 0,
  //           yMax: 0,
  //           borderColor: 'white',
  //           borderWidth: 2,
  //           borderDash: [10, 5],
  //         }
  //       }
  //     }
  //   }
  // };

  return {
    labels: topicSentimentOverTimeLabels,
    datasets: topicSentimentOverTimeDatasets,
    // options: options,
  };
}

export { formatSentiment, formatClassificationDistribution, formatTopicSentiment, formatHotTopics, formatTopicSentimentOverTime, formatSpecificTopicSentimentOverTime, formatLineGraphOfTopicSentiment };
export type { SentimentData, DataPoint };
