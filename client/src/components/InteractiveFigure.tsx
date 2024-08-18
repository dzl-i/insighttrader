"use client";

import WordCloud from "./graphs/WordCloud";
import PieChart from "./graphs/PieChart";
import BarChartComponent from "./graphs/BarChart";
import LineChart from "./graphs/LineChart";
import StackedBarChart from "./graphs/StackedBarChart";

import { get } from "~/lib/request";
import {
  ReactElement,
  useEffect,
  useState,
} from "react";
import { SentimentData, formatSentiment, formatClassificationDistribution, formatTopicSentiment, formatHotTopics, formatTopicSentimentOverTime, formatSpecificTopicSentimentOverTime, formatLineGraphOfTopicSentiment } from "~/util/dataFormatters";
import Box from "./Box";
import LoadingSpinner from "./LoadingSpinner";
import { ArrowUp, ArrowDown } from 'lucide-react';
import Link from "next/link";

const type_data: { [key: string]: { title: string; infoText: string } } = {
  "overall_sentiment": {
    title: "Overall Market Sentiment",
    infoText: "This is the overall market sentiment for the selected period",
  },
  "topic_sentiment": {
    title: "Popular Topics Breakdown",
    infoText: "This is the sentiment for the selected topic",
  },
  "classification_distribution": {
    title: "Topic Distribution",
    infoText: "This is the distribution of topics for the selected period",
  },
  "sentiment_over_time": {
    title: "Sentiment Over Time",
    infoText: "This is the sentiment over time for the selected period",
  },
  "market_sentiment_over_time": {
    title: "Market Sentiment Over Time",
    infoText: "This is the market sentiment over time for the selected period",
  },
  "named_entity_distribution": {
    title: "Hot Topics",
    infoText: "This is the distribution of named entities for the selected period",
  },
  "topic_sentiment_over_time": {
    title: "Monthly Sentiment Breakdown",
    infoText: "This is the average sentiment over time for all articles",
  },
  "heating_up": {
    title: "Heating Up",
    infoText: "These are the topics that are heating up",
  },
  "cooling_down": {
    title: "Cooling Down",
    infoText: "These are the topics that are cooling down",
  },
  "get_similar_articles_from_article": {
    title: "Related Articles",
    infoText: "These are similar articles to the current article",
  },
  "get_similar_entities_from_entity": {
    title: "Similar Topics",
    infoText: "These are the similar entities",
  },
  "get_similar_articles_from_entity": {
    title: "Related Articles",
    infoText: "These are the similar articles",
  },
  "line_graph_of_topic_sentiment": {
    title: "Average Monthly Sentiment",
    infoText: "This is the sentiment over time for the selected topic",
  },
  "overall_sentiment_for_topic": {
    title: "Sentiment",
    infoText: "This is the overall sentiment for the selected topic",
  },
};

const getData = async (
  aggregate_type: string,
  start_date: string,
  end_date: string,
  headline?: string,
  ...props: { [key: string]: any }[]
): Promise<SentimentData[]> => {
  let headline_query = "";
  if (headline) {
    headline_query = "&headline=" + headline;
  }

  let queryString = "";
  for (let prop of props) {
    for (let key in prop) {
      queryString += `&${key}=${prop[key]}`;
    }
  }

  let { result } = await get(
    `/data_aggregation?aggregate_type=${aggregate_type}&start_date=${start_date}&end_date=${end_date}${headline_query}${queryString}`
  );
  return result;
};

const getSentiment = (polarity: number) => {
  if (polarity > 0.09) {
    return "Positive";
  } else if (0.01 <= polarity && polarity <= 0.09) {
    return "Neutral";
  } else if (polarity < 0.01) {
    return "Negative";
  }
};

const ArticleListing = ({ article }: { article: any }) => {
  article.sentiment = getSentiment(article.sentiment_polarity);
  return <Link
    href={`/app/article/${article.guid}`}
    className="flex flex-row justify-between text-xs duration-150 hover:text-blue-500 hover:bg-black/10 px-2 py-1 border border-transparent hover:border-black/50 dark:hover:border-white/50 rounded-lg"
  >
    <div className="flex flex-col justify-evenly pr-1">
      <p className="flex justify-center items-center">
        {article.headline}
      </p>
      <p className="flex justify-start items-center text-white/60">
        {article.publication_date}
      </p>
    </div>
    <div className="truncate">
      <div className="truncate flex h-10 items-center justify-center rounded-2xl border border-white/50 bg-white/10 px-4 text-white/50">
        <span className="truncate text-ellipsis">
          {article.topic}
        </span>
      </div>
      <div
        className={`flex h-10 items-center justify-center rounded-2xl border ${article.sentiment === "Positive" && "border-green-500 bg-green-500/10 text-green-500"} ${article.sentiment === "Neutral" && "border-yellow-500 bg-yellow-500/10 text-yellow-500"} ${article.sentiment === "Negative" && "border-red-500 bg-red-500/10 text-red-500"} px-4`}
      >
        <span className="truncate text-ellipsis">
          {article.sentiment}
        </span>
      </div>
    </div>
  </Link>
}

const InteractiveFigure = ({ startDate, endDate, overflow, type, headline, ...props }: { startDate: string, endDate: string, type: string, overflow?: boolean, headline?: string, className?: string, props?: ReactElement, topic?: string, guid?: string }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (startDate.length === 0 || endDate.length === 0) {
      return;
    }

    async function fetchData() {
      const result = await getData(type, startDate, endDate, headline, props);
      switch (type) {
        case "overall_sentiment":
          setData(formatSentiment(result));
          break;
        case "topic_sentiment":
          setData(formatTopicSentiment(result));
          break;
        case "classification_distribution":
          setData(formatClassificationDistribution(result));
          break;
        case "named_entity_distribution":
          setData(formatHotTopics(result));
          break;
        case "topic_sentiment_over_time":
          setData(formatTopicSentimentOverTime(result));
          break;
        case "topic_sentiment_over_time":
          setData(formatSpecificTopicSentimentOverTime(result));
          break;
        case "line_graph_of_topic_sentiment":
          setData(formatLineGraphOfTopicSentiment(result));
          break;
        case "overall_sentiment_for_topic":
          setData(formatSentiment(result));
          break;
        default:
          setData(result);
          break;
      }
    }
    setData(null);
    fetchData();
  }, [startDate, endDate, type, headline]);

  const formatChange = (change: any) => {
    const isPositive = change > 0;
    const Icon = isPositive ? ArrowUp : ArrowDown;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <Icon size={18} className="mr-1" />
        {Math.abs(Math.round(change))}%
      </div>
    );
  };

  return (
    <Box title={type_data[type]!.title} {...props}>
      {startDate.length > 0 && endDate.length > 0 && !!data ? (
        <>
          {type === "overall_sentiment" && (
            <PieChart
              heading={type_data[type]!.title}
              datas={data}
            />
          )}

          {type === "overall_sentiment_for_topic" && (
            <PieChart
              heading={type_data[type]!.title}
              datas={data}
            />
          )}

          {type === "topic_sentiment" && (
            <StackedBarChart
              labels={data.labels}
              datasets={data.datasets}
            />
          )}

          {type === "named_entity_distribution" && (
            <WordCloud
              words={data}
            />
          )}

          {type === "classification_distribution" && (
            <BarChartComponent
              labels={data.labels}
              datasets={data.datasets}
            />
          )}

          {type === "sentiment_over_time" && (
            <LineChart
              labels={data.labels}
              datasets={data.datasets}
            />
          )}

          {type === "market_sentiment_over_time" && (
            <StackedBarChart
              labels={data.labels}
              datasets={data.datasets}
            />
          )}

          {type === "topic_sentiment_over_time" && (
            <LineChart
              labels={data.labels}
              datasets={data.datasets}
            />
          )}

          {(type === "heating_up" || type === "cooling_down") && (
            <div className="overflow-hidden">
              <div className="grid grid-cols-3 text-center px-2 py-2 font-semibold bg-white/5 shadow-md rounded-t-lg">
                <div className="truncate">Topic</div>
                <div className="truncate">Δ Popularity</div>
                <div className="truncate">Δ Sentiment</div>
              </div>
              {data.map((entity: any, index: number) => (
                <div key={index} className="grid grid-cols-3 items-center text-center bg-white/5 px-2 py-1 shadow-md border-b-white/5">
                  <div className="truncate">{entity.entity}</div>
                  <div className="pl-4">{formatChange(entity.percent_change)}</div>
                  <div className="pl-4">{formatChange(entity.sentiment_percent_change)}</div>
                </div>
              ))}
            </div>
          )}
          

          {type === "get_similar_articles_from_article" && (
            <div
              className={"grid grid-cols-2 gap-4" + (overflow ? " overflow-auto" : "")}
            >
              {data.map((article: any, index: number) => (
                <ArticleListing article={article} key={index} />
              ))}
            </div>
          )}

          {type === "get_similar_entities_from_entity" && (
            <div className={"text-sm" + (overflow ? " overflow-auto" : "")}>
              {data.map((entity: any, index: number) => (
                <span
                  key={index}
                >
                  {entity.entity}{" "}
                  <span
                    className="text-white/60"
                  >
                    ({entity.co_occurrence_count})
                  </span>
                  {index !== data.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}

          {type === "get_similar_articles_from_entity" && (
            <div
              className={"flex flex-col gap-1" + (overflow ? " overflow-auto" : "")}
            >
              {data.map((article: any, index: number) => (
                <ArticleListing article={article} key={index} />
              ))}
            </div>
          )}

          {type === "line_graph_of_topic_sentiment" && (
            <LineChart
              labels={data.labels}
              datasets={data.datasets}
              options={data.options}
            />
          )}

        </>
      ) : (
        <div className="flex justify-center items-center h-full w-full">
          <LoadingSpinner />
        </div>
      )}
    </Box>
  );
};

export default InteractiveFigure;