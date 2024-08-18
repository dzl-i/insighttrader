"use client";

import ArticleList from "./ArticleList";
import { get } from "~/lib/request";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { notFound, useRouter } from "next/navigation";
import { CalendarIcon, RefreshCcw, Search, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "~/lib/utils";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import InteractiveFigure from "./InteractiveFigure";
import Box from "./Box";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type MarketSentimentType = {
  month: string;
  sentiment_group: "Positive" | "Neutral" | "Negative";
  count: number;
};

type TopicSentimentType = {
  month: string;
  total_articles: number;
  positive: number;
  neutral: number;
  negative: number;
};

const PAGINATION_ITEMS = 8;

const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export default function Dashboard() {
  const [startDate, setStartDate] = useState(new Date(2020, 1, 1));
  const [endDate, setEndDate] = useState(new Date(2020, 3, 1));
  const [paginationIndex, setPaginationIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleOnSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    const targetHeading = e.target["search-headline"].value;
    setSearchTerm(targetHeading);
    await sleep(1000);
  };

  const categories = [
    "All",
    "Business and Economy",
    "Politics and Government",
    "Finance and Markets",
    "Technology and Internet",
    "Property and Real Estate",
    "Employment and Workforce",
    "Energy and Resources",
    "Media and Entertainment",
    "Law and Crime",
    "Education and Research",
    "Healthcare and Pharmaceuticals",
    "Infrastructure and Transport",
    "Environment and Sustainability",
    "Society and Culture",
    "International Relations and Trade",
  ];

  const sentiment_types = [
    "All",
    "Positive",
    "Neutral",
    "Negative",
  ];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleOptionSelect = (category: any) => {
    // console.log(category + " selected");
    setSelectedCategory(category);
  };

  const [selectedType, setSelectedType] = useState('All');
  return (
    <main className="p-12 text-sm flex flex-col h-screen gap-8">
      <div className="flex flex-row items-center justify-between overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-black p-2 text-black dark:text-white dark:border-white/10">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Market Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    " justify-start text-left font-normal",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick a start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  captionLayout="dropdown-buttons"
                  selected={startDate}
                  onSelect={
                    setStartDate as Dispatch<SetStateAction<Date | undefined>>
                  }
                  fromYear={2015}
                  toYear={2021}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Pick a end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  captionLayout="dropdown-buttons"
                  selected={endDate}
                  onSelect={
                    setEndDate as Dispatch<SetStateAction<Date | undefined>>
                  }
                  fromYear={2015}
                  toYear={2021}
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => {
                router.refresh();
              }}
              variant="outline"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-8 h-[90%]">
        <div className="overflow-hidden min-w-[50%]">
          <div className="text-sm">
            <form onSubmit={handleOnSubmit} className="flex items-center gap-4 py-4">
              <div className="flex flex-1 items-center gap-4 rounded-2xl bg-white/10 px-4 border border-black/20 border-1 dark:border-0">
                <Search className="h-4 w-4 text-black/50 dark:text-white/50" />
                <input
                  className="h-full w-full bg-transparent py-3 outline-none"
                  type="text"
                  name="search-headline"
                  placeholder="Search articles..."
                />
              </div>
              <Button
                type="submit"
                variant="outline"
              >
                Search
              </Button>
            </form>
          </div>
          <Box
            title="In the News..."
            className="h-[88%]"
            overflow={true}
            endContent={
              <div style={{ display: 'flex', gap: '10px' }}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button  variant="outline">
                      Category:&nbsp;&nbsp;&nbsp;<span className="text-white-500">{selectedCategory}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map(category => (
                      <DropdownMenuItem key={category} onSelect={() => setSelectedCategory(category)}>
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                    Sentiment:&nbsp;&nbsp;&nbsp;<span style={{ color: selectedType === 'All' ? 'white' : selectedType === 'Positive' ? 'green' : selectedType === 'Negative' ? 'red' : 'orange' }}>{selectedType}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {sentiment_types.map(type => (
                      <DropdownMenuItem key={type} onSelect={() => setSelectedType(type)}>
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              </div> */}
              {/* Articles list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <ArticleList
                  startDate={formatDate(startDate)}
                  endDate={formatDate(endDate)}
                  searchTerm={searchTerm}
                  sentiment= {selectedType}
                  article_type={selectedCategory}
                  // articles={articles}
                  // articles={articles.filter(article => 
                  //   (selectedCategory === 'All' || article.category === selectedCategory) &&
                  //   (selectedType === 'All' || article.sentiment === selectedType)
                  // )}
                />
              </div>
            </div>
          </Box>

        </div>
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 grid-rows-3 grow">
          <InteractiveFigure startDate={formatDate(startDate)} endDate={formatDate(endDate)} type="heating_up" headline={searchTerm} />
          <InteractiveFigure startDate={formatDate(startDate)} endDate={formatDate(endDate)} type="cooling_down" headline={searchTerm} />
          <InteractiveFigure startDate={formatDate(startDate)} endDate={formatDate(endDate)} type="named_entity_distribution" headline={searchTerm} />
          <InteractiveFigure startDate={formatDate(startDate)} endDate={formatDate(endDate)} type="topic_sentiment_over_time" headline={searchTerm} />
          <InteractiveFigure startDate={formatDate(startDate)} endDate={formatDate(endDate)} className="col-span-2" type="topic_sentiment" headline={searchTerm} />
        </div>
      </div>
    </main>
  );
}
