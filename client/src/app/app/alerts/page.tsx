"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";

import React, { useMemo, useState } from "react";
import { alerts as alertsList } from "~/lib/alerts";

import { ArrowUp, SlidersHorizontal, Timer, Trash2 } from "lucide-react";

const TimerIcon = () => (
  <div className="h-[40px] w-[40px] rounded-full border border-white/8 dark:border-white/10 flex items-center justify-center">
    <Timer />
  </div>
);

export default function AlertsPage() {
  const [method, setMethod] = useState("");
  const [trigger, setTrigger] = useState("");
  const [event, setEvent] = useState("");
  const [alerts, setAlerts] = useState<typeof alertsList>(alertsList);

  const readyToSubmit = useMemo(() => method && trigger && event, [method, trigger, event]);

  const handleMethodChange = (e: string) => {
    setMethod(e);
  };

  const handleTriggerChange = (e: string) => {
    setTrigger(e);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvent(e.target.value);
  };

  const handleSubmit = () => {
    const newAlert = {
      id: alerts.length + 1,
      method: method,
      trigger: trigger,
      event: event
    };

    setAlerts([...alerts, newAlert]);
    setMethod("");
    setTrigger("");
    setEvent("");
  };

  return (
    <main className="space-y-8 p-16">
      <div className="flex items-center gap-4">
        <TimerIcon />
        <h1 className="inline text-2xl font-bold">Alerts</h1>
      </div>

      <div className="flex flex-row items-center gap-x-4">
        <Select onValueChange={(value) => handleMethodChange(value)} value={method}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a method..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Text" disabled={true}>Text</SelectItem>
              <SelectItem value="Call" disabled={true}>Call</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-nowrap">me if there is a(n)</p>
        <Select onValueChange={(value) => handleTriggerChange(value)} value={trigger}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a trigger..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <p>about</p>
        <Input type="text" placeholder="an event..." className="min-w-[200px]" onChange={handleEventChange} value={event} />
        <Button onClick={handleSubmit} disabled={!readyToSubmit}>Add Alert</Button>
      </div>

      <ScrollArea className="-z-20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4">#</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>If...</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.id}</TableCell>
                <TableCell>{alert.method}</TableCell>
                <TableCell>There is a(n) <span className="font-extrabold text-[#006fee]">{alert.trigger}</span> about <span className="font-extrabold text-[#006fee]">{alert.event}</span></TableCell>
                <TableCell className="right-0 flex flex-row justify-end">
                  <ArrowUp className="ml-2 h-6 w-6 text-[#4497ff]" />
                  <Trash2 className="ml-2 h-6 w-6 text-[#ef5537]" />
                  <SlidersHorizontal className="ml-2 h-6 w-6" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">
                {alerts.length} alerts
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </main>
  );
}
