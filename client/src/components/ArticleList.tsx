"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useCallback, useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
// import { get } from "~/lib/request";
import { Checkbox } from "./ui/checkbox";
import { get } from "~/lib/request";

const getSentiment = (polarity: number) => {
  if (polarity > 0.09) {
    return "Positive";
  } else if (0.01 <= polarity && polarity <= 0.09) {
    return "Neutral";
  } else if (polarity < 0.01) {
    return "Negative";
  }
};

type ArticleType = {
  name: string;
  date: string;
  id: string;
  category: string;
  sentiment: string;
  author: string;
};

export default function ArticleList({ startDate, endDate, searchTerm, sentiment, article_type }: { startDate: string; endDate: string; searchTerm: string; sentiment: string, article_type: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleElementRef = useCallback((node: HTMLAnchorElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore) {
        setPageNumber(prevPageNumber => prevPageNumber + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const getArticles = async (
    start_date: string,
    end_date: string,
    pageNum: number,
    pageSize: number,
    headline: string,
    article_topic: string, 
    article_sentiment: string
  ) => {
    setLoading(true);
    let { dataset } = await get(
      `/data_retrieval?start_date=${start_date}&end_date=${end_date}&page=${pageNum}&page_size=${pageSize}&headline=${headline}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const fetchedArticles = dataset.events.map((event: any) => ({
      name: event.attribute.headline,
      date: event.time_object.timestamp,
      author: event.attribute.author,
      category: event.attribute.topic,
      sentiment: getSentiment(event.attribute.sentiment_polarity),
      id: event.attribute.event_id,
    })).filter((article: any) => 
      (article_topic === 'All' || article.category === article_topic) &&
      (article_sentiment === 'All' || article.sentiment === article_sentiment)
    );
    // setArticles(prevArticles => [
    //   ...prevArticles,
    //   ...dataset.events.map((event: any) => ({
    //     name: event.attribute.headline,
    //     date: event.time_object.timestamp,
    //     author: event.attribute.author,
    //     category: event.attribute.topic,
    //     section: event.attribute.section,
    //     sentiment: getSentiment(event.attribute.sentiment_polarity),
    //     id: event.attribute.event_id,
    //   }))
    // ]);
    console.log("Getting articles");
    // const filteredArticles = fetchedArticles.filter((article: any) => 
    //   (article_topic === 'All' || article.category === article_topic) &&
    //   (article_sentiment === 'All' || article.sentiment === article_sentiment)
    // );
    setArticles(prevArticles => {
      const existingIds = new Set(prevArticles.map(article => article.id));
      const newArticles = fetchedArticles.filter((article: any) => !existingIds.has(article.id));
      return [...prevArticles, ...newArticles];
    });
    // setFetchedArticles(articles);
    setHasMore(dataset.events.length > 0);
    setLoading(false);
  };

  useEffect(() => {
    setArticles([]);
    // setFetchedArticles([]);
  }, [startDate, endDate, searchTerm, sentiment, article_type]);


  // useEffect(()=> {
  //   setArticles(articles.filter((article: any) => 
  //     (article_type === 'All' || article.category === article_type) &&
  //     (sentiment === 'All' || article.sentiment === sentiment)
  //   ));
  // }, [articles, sentiment, article_type])


  useEffect(() => {
    getArticles(
      startDate,
      endDate,
      pageNumber,
      15,
      searchTerm,
      article_type, 
      sentiment
    );
  }, [startDate, endDate, searchTerm, pageNumber, sentiment, article_type]);

  const fetchArticleText = async (guid: string) => {
    try {
      const article_text = await get(`/s3?guid=${guid}`);

      await new Promise((resolve) => setTimeout(resolve, 500));
      return article_text.article_text;
    } catch (error) {
      console.error('Error fetching article text:', error);
      return 'Failed to fetch article text.';
    }
  };


  type FilterState = {
    Positive: boolean;
    Negative: boolean;
    Neutral: boolean;
    [key: string]: boolean;
  };

  const [filters, setFilters] = useState<FilterState>({
    Positive: false,
    Negative: false,
    Neutral: false,
  });
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [tooltipContent, setTooltipContent] = useState<ReactNode>('');

  const handleMouseEnter = (guid: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);

    const timeout = setTimeout(() => handleHover(guid), 500);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setTooltipContent('');
  };


  const handleHover = async (guid: string) => {
    console.log("sending hover req");
    const articleText = await fetchArticleText(guid);
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Provide a concise 50 word analysis of the article."
        },
        {
          role: "user",
          content: articleText
        }
      ]
    };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (response.ok) {
        const formattedContent = formatTooltipText(data.choices[0].message.content);
        setTooltipContent(formattedContent);
      } else {
        throw new Error(data.error.message);
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setTooltipContent('Failed to fetch response');
    }
  };


  function formatTooltipText(text: string): ReactNode {
    const words = text.split(' ');
    const formattedText: ReactNode[] = [];
    words.forEach((word, index) => {
      formattedText.push(word);
      if ((index + 1) % 10 === 0 && index + 1 !== words.length) {
        formattedText.push(<br key={index} />);
      } else if (index + 1 !== words.length) {
        formattedText.push(' ');
      }
    });
    return formattedText;
  }



  return (
    <div className="flex flex-col gap-2">
      {!!articles && articles.length > 0 ?
        <>
          {articles.map((article: ArticleType, index: number) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/app/article/${article.id}`}
                    key={index}
                    onMouseEnter={() => handleMouseEnter(article.id)}
                    onMouseLeave={handleMouseLeave}
                    className="flex flex-col sm:flex-row justify-between text-xs duration-150 hover:text-blue-500 hover:bg-black/10 pr-2 py-2 border border-transparent hover:border-black/50 dark:hover:border-white/50 rounded-lg"
                    ref={articles.length === index + 1 ? lastArticleElementRef : null}
                  >
                    <div className="flex truncate justify-center items-center">
                      <div className="truncate px-1">
                        <p className="truncate text-sm max-w-[400px]">
                          {article.name}
                        </p>
                        <p className="whitespace-nowrap text-sm text-black/50 dark:text-white/50">
                          {article.author ? article.author + " | " : ""}AFR | {article.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex h-10 items-center justify-center rounded-2xl border border-white/50 bg-white/10 px-4 text-white/50">
                        <span className="truncate text-ellipsis">
                          {article.category}
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
                </TooltipTrigger>
                <TooltipContent>
                  <TooltipContent>
                    {tooltipContent || <LoadingSpinner />}
                  </TooltipContent>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          ))}
          <div className="flex justify-center items-center h-12 w-full">
            {loading && <LoadingSpinner />}
          </div>
        </>
        : (
          <div className="flex justify-center items-center h-full w-full grow">
            <LoadingSpinner />
          </div>
        )}
    </div>
  );
}
