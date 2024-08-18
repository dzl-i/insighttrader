"use client";

import { BookText, List, LoaderCircle, Newspaper, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Dropdown from "~/components/Dropdown";
import Navbar from "~/components/Navbar";
import TopicModelling from "../../../../components/TopicModelling";
import { get } from "~/lib/request";
import { notFound, useRouter } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { options } from "~/lib/auth";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "~/components/LoadingSpinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { TopicModal } from "~/components/TopicModal";
import Link from "next/link";
import Box from "~/components/Box";
import { set } from "date-fns";
import InteractiveFigure from "~/components/InteractiveFigure";

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

type ResponseType = {
  symbol: string;
  name: string;
  reason: string;
  sector: string;
  action: string;
};
type EventResponseType = {
  eventName: string,
  importanceScore: string,
  description: string
}

export default function Page({ params }: { params: { guid: string } }) {
  const [dataset, setDataset] = useState<any>(null);
  const [article_text, setArticleText] = useState<string>("");
  const [topics, setTopics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [eventAnalysis, setEventAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { dataset } = await get(`/data_retrieval?guid=${params.guid}`);
      const { article_text } = await get(`/s3?guid=${params.guid}`);

      if (!dataset) {
        return notFound();
      }

      // Delay for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set topics with a random color
      const randomHSLA = () => {
        return `hsla(${~~(360 * Math.random())}, 70%,  72%, 0.5)`
      }

      setTopics(dataset.events[0].attribute.named_entities.map((entity: string) => ({
        name: entity,
        color: randomHSLA(),
      })));

      setDataset(dataset.events[0]);
      setArticleText(article_text);
    };

    fetchData();
  }, []);

  const getSentiment = (polarity: number) => {
    if (polarity > 0.09) {
      return "Positive";
    } else if (0.01 <= polarity && polarity <= 0.09) {
      return "Neutral";
    } else if (polarity < 0.01) {
      return "Negative";
    }
  };

  const getStockRecommendations = async (
    attribute: string,
    article_text: string,
    top_three_entities: {
      entity: string;
      sentiment: string;
    }[],
  ) => {
    const prompt =
      attribute +
      "\n\n" +
      article_text +
      "\n\n" +
      top_three_entities
        .map((e) => e.entity + "\n" + e.sentiment + "\n")
        .join("\n");

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            'Your task is to analyse some json data I give you and recommend to me 3 different Australian stock tickers based on said data. Your output must always be in the form of this array, please ensure the stocks you recommend are actual real life stock tickers on the ASX with the correct name [{"symbol": "ticker1", "name": "name_of_stock", "reason": "reason_for_recommendation", "sector": "sector_of_stock1", "action": "buy" or "sell"},{"symbol": "ticker2", "name": "name_of_stock", "reason": "reason_for_recommendation", "sector": "sector_of_stock2", "action": "buy" or "sell"},{"symbol": "ticker3", "name": "name_of_stock", "reason": "reason_for_recommendation", "sector": "sector_of_stock3", "action": "buy" or "sell"}] The input you will receive will come down to 3 main parts: - The first part is a json that gives you information about the article we are analysing - The second will be the article text - The third one will be a json of the sentiment over time of the main named entities in the article For the reason for each article base it mostly on the article text that I gave you, make sure you reason is under 30 words of explanation. Ensure that the stock tickers you recommend are actual stock tickers on ASX not some made up ones and that they have .AX at the end. Remember the output has to always be in this format [{"symbol": "ticker1", "name": "name_of_stock", "reason": "reason_for_recommendation", "sector": "sector_of_stock1", "action": "buy" or "sell"},{"symbol": "ticker2", "name": "name_of_stock", "reason": "reason_for_recommendation", "sector": "sector_of_stock2", "action": "buy" or "sell"},{"symbol": "ticker3", "name": "name_of_stock", "reason": "reason_for_recommendation", "sector": "sector_of_stock3", "action": "buy" or "sell"}]',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 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`,
          },
          body: JSON.stringify(requestBody),
        },
      );
      const data = await response.json();
      if (response.ok) {
        return JSON.parse(data.choices[0].message.content);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      return [
        {
          symbol: "PRU.AX",
          name: "Perseus Mining Limited",
          reason: "Resources and energy employers pushing for Fair Work review",
          sector: "Materials",
          action: "buy",
        },
        {
          symbol: "BXB.AX",
          name: "Brambles Limited",
          reason:
            "Employer pressure on federal government over industrial relations reform",
          sector: "Industrials",
          action: "buy",
        },
        {
          symbol: "S32.AX",
          name: "South32 Limited",
          reason: "Concerns of employers over delays in agreement approvals",
          sector: "Materials",
          action: "buy",
        },
      ];
    }
  };


  const getEventAnalysis = async (
    attribute: string,
    article_text: string,
  ) => {
    const prompt =
      attribute +
      "\n\n" +
      article_text +
      "\n\n";


    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            'Your task is to analyse some text that I give you and extract from it up to 5 events with their analysis. Your output must always be in the form of this array, [{"eventName": "event 1 title (make sure it is less than 5 words)", "importanceScore": "a number from 0 to 10.0 that represents the importance of this event in the given text", "description": "A concise description of said event (Make sure it is less than 20 words)"}, {"eventName": "event 2 title (make sure it is less than 5 words)", "importanceScore": "a number from 0 to 10.0 that represents the importance of this event in the given text", "description": "A concise description of said event (Make sure it is less than 20 words)"}, ... ] The input you will receive will come down to 2 main parts: - The first part is a json that gives you information about the article we are analysing - The second will be the article text. Remember the output has to always be in this format [{"eventName": "event 1 title (make sure it is less than 5 words)", "importanceScore": "a number from 0 to 10.0 that represents the importance of this event in the given text", "description": "A concise description of said event (Make sure it is less than 20 words)"}, {"eventName": "event 2 title (make sure it is less than 5 words)", "importanceScore": "a number from 0 to 10.0 that represents the importance of this event in the given text", "description": "A concise description of said event (Make sure it is less than 20 words)"}, ... up to 5 total events ]',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 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`,
          },
          body: JSON.stringify(requestBody),
        },
      );
      const data = await response.json();
      if (response.ok) {
        return JSON.parse(data.choices[0].message.content);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      return [];
    }

  };

  const dummyEvents = [
    {
      eventName: "Launch of New Tech Product",
      importanceScore: 9.5,
      description: "A major tech company announces the launch of a new innovative product that could change market dynamics."
    },
    {
      eventName: "Government Economic Policy Update",
      importanceScore: 8.7,
      description: "The government releases a new economic policy aimed at boosting small businesses and startups with increased funding."
    },
    {
      eventName: "Breakthrough in Renewable Energy",
      importanceScore: 9.2,
      description: "A significant breakthrough in renewable energy promises to reduce costs and increase efficiency in solar power generation."
    },
    {
      eventName: "Major Merger in the Telecom Sector",
      importanceScore: 7.5,
      description: "Two leading telecom companies announce a merger to combine their resources and expand their market share."
    },
    {
      eventName: "Advancements in AI Health Diagnostics",
      importanceScore: 8.9,
      description: "Recent advancements in AI-driven diagnostics tools are set to revolutionize the healthcare industry by improving early detection of diseases."
    }
  ];

  useEffect(() => {
    if (dataset) {
      getStockRecommendations(
        JSON.stringify(dataset.attribute),
        article_text,
        dataset.attribute.named_entities.slice(0, 3).map((e: EntityType) => ({
          entity: e.entity,
          sentiment: JSON.stringify(e.sentiment),
        })),
      ).then((res) => {

        setRecommendations(res);
      }).catch((err) => {
        setRecommendations(sampleResponse);
      });
    }
  }, [dataset]);

  useEffect(() => {
    if (dataset) {
      getEventAnalysis(
        JSON.stringify(dataset.attribute),
        article_text,
      ).then((res) => {
        console.log(res);
        setEventAnalysis(res);
      }).catch((err) => {
        setEventAnalysis(dummyEvents);
      });
    }
  }, [dataset]);
  
  const sampleResponse = [
    {
      symbol: "PRU.AX",
      name: "Perseus Mining Limited",
      reason: "Resources and energy employers pushing for Fair Work review",
      sector: "Materials",
      action: "buy",
    },
    {
      symbol: "BXB.AX",
      name: "Brambles Limited",
      reason:
        "Employer pressure on federal government over industrial relations reform",
      sector: "Industrials",
      action: "buy",
    },
    {
      symbol: "S32.AX",
      name: "South32 Limited",
      reason: "Concerns of employers over delays in agreement approvals",
      sector: "Materials",
      action: "buy",
    },
  ];

  const router = useRouter();

  const stripSpecialChars = (text: string) => {
    return text.replace(/[^\w\s]/gi, "");
  }

  // Returns component with highlighted topics
  // These can be across multiple words
  const HighlightTopics = ({ topics, line }: { topics: any; line: string }) => {
    const words = line.split(" ");
    const processedWords = [];

    let i = 0;
    while (i < words.length) {
      let found = false;
      let matchLength = 1;
      let foundTopic = "";
      topics.forEach((topic: any) => {
        const topicWords = topic.name.split(" ");
        const slice = words.slice(i, i + topicWords.length).join(" ");
        if (stripSpecialChars(slice.toLowerCase()) === stripSpecialChars(topic.name.toLowerCase())) {
          found = true;
          matchLength = topicWords.length;
          foundTopic = topic.name;
        }
      });

      if (found) {
        const name = words.slice(i, i + matchLength).join(" ");
        processedWords.push(<TopicHighlight entity={{ name: foundTopic }} display={{ name }} />);
        i += matchLength; // skip the length of the topic
      } else {
        processedWords.push(words[i]);
        i++;
      }
      processedWords.push(" ");
    }

    return <>{processedWords}</>;
  }


  const GenerateArticleText = ({ article_text }: { article_text: string }) => {
    let text = article_text.split("\n\n").map((line: string, i: number) => {
      return (
        <>
          <HighlightTopics key={i} topics={topics} line={line} />
          <br />
          <br />
        </>
      );
    });
    // join the array of components
    return <>{text}</>;
  };

  const [open, setOpen] = useState(false);
  const [targetTopic, setTargetTopic] = useState("");

  const TopicHighlight = ({ entity, display }: { entity: any, display: any }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              key={entity.name}
              className="cursor-pointer text-black dark:text-white rounded-lg px-1 overflow-visible outline outline-0 hover:outline-1 outline-white"
              style={{ backgroundColor: topics.find((t: any) => t.name === stripSpecialChars(entity.name))?.color }}
              href="#"
              onClick={() => {
                setTargetTopic(entity.name);
                setOpen(true);
              }}
            >
              {display.name}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <InteractiveFigure
              startDate={!!dataset && set(new Date(dataset.attribute.publication_date), { year: new Date(dataset?.attribute.publication_date).getFullYear() - 1 }).toISOString().split('T')[0] || ""}
              endDate={!!dataset && set(new Date(dataset.attribute.publication_date), { year: new Date(dataset?.attribute.publication_date).getFullYear() + 1 }).toISOString().split('T')[0] || ""}
              type="overall_sentiment_for_topic"
              topic={entity.name}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <main className="z-0 px-12 py-10 flex flex-col gap-4">
      <div className="space-y-6">
        <div className="flex items-center gap-4 justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-black p-2 text-black dark:text-white dark:border-white/10">
              <Newspaper className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Article Explorer</h1>
          </div>
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 border border-white rounded-lg text-white"
          >
            Back
          </button>
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <div className="flex-2 flex flex-col gap-4">
          <Box>
            {dataset ? (
              <h2 className="text-2xl font-bold">{dataset?.attribute.headline}</h2>
            ) : (
              <LoadingSpinner />
            )}
            <p className="text-white/50">
              Australian Financial Review |{" "}
              {dataset ? (
                (new Date(dataset?.attribute.publication_date)).toDateString()
              ) : (
                "-/-/-"
              )}
            </p>
          </Box>

          <Box title="Key Topics">
            <div
              className="flex flex-wrap gap-2 p-1"
            >
              {topics?.map((entity: any) => (
                <TopicHighlight key={entity.name} entity={entity} display={entity} />
              ))}
            </div>

          </Box>
          <Box title="Read now...">
            <div
              className="indent-10"
            >
              {article_text ? (
                <GenerateArticleText article_text={article_text} />
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </Box>
        </div>
        <div className="flex-1 flex flex-col gap-4 min-w-[33%]">
          <Box title="Information">
            <div className="flex flex-col gap-4">
              <span
                className="flex items-center gap-4"
              >
                <b>Sentiment:{" "}</b>
                {dataset ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p
                          className={`cursor-default rounded-lg border px-4 py-2 text-sm ${getSentiment(dataset?.attribute.sentiment_polarity) ===
                            "Positive"
                            ? "border-green-500 bg-green-500/10 text-green-500"
                            : getSentiment(dataset?.attribute.sentiment_polarity) ===
                              "Neutral"
                              ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                              : "border-red-500 bg-red-500/10 text-red-500"
                            }`}
                        >
                          {getSentiment(dataset?.attribute.sentiment_polarity)}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        {dataset?.attribute.sentiment_subjectivity > 0.7
                          ? "Highly Subjective"
                          : dataset?.attribute.sentiment_subjectivity > 0.3
                            ? "Moderately Subjective"
                            : "Objective"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <LoadingSpinner />
                )}
              </span>
            </div>
            {/* section */}
            <div>
              <b>Section</b>:{" "}
              {dataset ? (
                dataset?.attribute.section
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </Box>
          <InteractiveFigure
            startDate={!!dataset && set(new Date(dataset.attribute.publication_date), { year: new Date(dataset?.attribute.publication_date).getFullYear() - 1 }).toISOString().split('T')[0] || ""}
            endDate={!!dataset && set(new Date(dataset.attribute.publication_date), { year: new Date(dataset?.attribute.publication_date).getFullYear() + 1 }).toISOString().split('T')[0] || ""}
            type="get_similar_articles_from_article"
            guid={params.guid}
          />
          <Box title="Related Stocks">
            <div>
              <p
                className="text-white/50 pb-4 text-sm"
              >Powered by AI</p>
              <div className="space-y-8">
                {recommendations ?
                  recommendations.map((res: ResponseType, index: number) => (
                    <div
                      key={index}
                      className={"space-y-4 border-b-white/10 pb-6" + (index === recommendations.length - 1 ? "" : " border-b")}
                    >
                      <div className="flex gap-4">
                        <div className="rounded-lg border border-white/20 bg-white/5 p-4 flex flex-col gap-4 w-full">
                          <div className="flex-1 flex flex-wrap items-center gap-4">
                            <p className="headline truncate text-ellipsis">
                              {res.name}
                            </p>
                            <p className="whitespace-nowrap text-sm text-white/50">
                              {res.symbol}
                            </p>
                          </div>
                          <div className="flex flex-1 gap-4">
                            <div className="flex h-11 w-[240px] flex-1 items-center justify-center rounded-2xl border border-white/50 bg-white/10 px-6 text-white/50">
                              <span className="truncate text-ellipsis">
                                {res.sector}
                              </span>
                            </div>
                            <div
                              className={`flex h-11 w-[240px] flex-1 items-center justify-center rounded-2xl border ${res.action === "buy" && "border-green-500 bg-green-500/10 text-green-500"} ${res.action === "sell" && "border-yellow-500 bg-yellow-500/10 text-yellow-500"} px-6`}
                            >
                              <span className="truncate text-ellipsis capitalize">
                                {res.action}
                              </span>
                            </div>
                          </div>
                          <div>
                            <b>Reason:</b> {res.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="flex justify-center items-center h-full w-full grow">
                      <LoadingSpinner />
                    </div>
                  )}
              </div>
            </div>
          </Box>
          <Box title="Extracted events">
            <div className="space-y-8">
              {eventAnalysis ? eventAnalysis.map((res: EventResponseType, index: number) => (
                <div key={index} className="space-y-4 border-b border-b-white/10 pb-6">
                  <div className="flex gap-4">
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4 flex flex-col gap-4 w-full">
                      <div className="flex-1 flex flex-wrap items-center gap-4">
                        <h3 className="headline truncate text-ellipsis">{res.eventName}</h3>
                      </div>
                      <div className="flex gap-4">
                        <div
                          className={`flex h-11 w-[240px] items-center justify-center rounded-2xl border px-6 ${parseFloat(res.importanceScore) > 7.5 ? "border-green-500 bg-green-500/10 text-green-500" : "border-white/50 bg-white/10 text-white/50"
                            }`}
                        >
                          <span className="truncate text-ellipsis">
                            Importance: {res.importanceScore}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p><b>Description:</b> {res.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )): (
                <div className="flex justify-center items-center h-full w-full grow">
                  <LoadingSpinner />
                </div>
              )}
            </div>




          </Box>
        </div>
      </div>
      <TopicModal topic={targetTopic} open={open} setOpen={() => setOpen(!open)} />
    </main>
  );
}
