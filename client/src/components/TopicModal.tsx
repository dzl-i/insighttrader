import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import Box from "./Box";
import InteractiveFigure from "./InteractiveFigure";
import { format } from "date-fns";
import { useState } from "react";

const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export function TopicModal({topic, open, setOpen, ...props}: {topic?: string, open: boolean, setOpen: () => void, props?: any}) {
  const [toggleBreakdown, setToggleBreakdown] = useState(false);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 999);
  const endDate = new Date();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[80%] sm:h-[85%]">
        <DialogHeader>
          <DialogTitle>Topic Explorer: {topic}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 grid-rows-3 gap-4 overflow-auto">
          <div className="col-span-2 row-span-3">
            <div className="h-full flex flex-col items-end justify-center">
              {toggleBreakdown ? (
                <InteractiveFigure
                  startDate={formatDate(startDate)}
                  endDate={formatDate(endDate)}
                  type="topic_sentiment_over_time"
                  topic={topic} {...props}
                  className="w-full grow"
                />
              ) : (
                <InteractiveFigure
                  startDate={formatDate(startDate)}
                  endDate={formatDate(endDate)}
                  type="line_graph_of_topic_sentiment"
                  topic={topic}
                  className="w-full grow"
                />
              )}
              <Button onClick={() => setToggleBreakdown(!toggleBreakdown)} className="mt-4">
                {toggleBreakdown ? "Show Overall" : "Show Breakdown"}
              </Button>
            </div>
          </div>
          <div className="col-span-2 row-span-3">
            <div className="flex flex-col gap-1">
              <div
                className="flex flex-row gap-1 shrink"
              >
                <InteractiveFigure
                  startDate={formatDate(startDate)}
                  endDate={formatDate(endDate)}
                  type="overall_sentiment_for_topic"
                  topic={topic}
                />
                <InteractiveFigure
                  startDate={formatDate(startDate)}
                  endDate={formatDate(endDate)}
                  type="get_similar_entities_from_entity"
                  topic={topic}
                  overflow={true}
                />
              </div>
              <InteractiveFigure
                startDate={formatDate(startDate)}
                endDate={formatDate(endDate)}
                type="get_similar_articles_from_entity"
                topic={topic}
                overflow={true}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
