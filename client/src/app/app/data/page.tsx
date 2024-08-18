"use client";

import React, { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "~/components/ui/input"

import DataSourceLogo from "/public/datasource.svg";

import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";
import Navbar from "~/components/Navbar";
import {
  ArrowUp,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

const DataSourceIcon = () => (
  <Image src={DataSourceLogo} width={40} height={40} alt="Data Source" className="filter invert dark:invert-0" />
);

const dataSources = [
  {
    id: "1",
    name: "Australian Financial Review",
    numEvents: 78873,
    lastUpdated: "May 3rd, 2024, 00:35am",
  },
  {
    id: "2",
    name: "Yahoo Finance",
    numEvents: 1334,
    lastUpdated: "May 3rd, 2024, 00:35am",
  },
];

export default function DataSourcePage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<typeof dataSources>(dataSources);

  const [file, setFile] = useState<{
    name: string;
    content: ArrayBuffer | string;
  }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;

    const targetFile = target.files[0] as File;

    const reader = new FileReader();
    reader.readAsText(targetFile as Blob);
    reader.onload = () => {
      const newFile = {
        name: targetFile.name,
        content: reader.result as ArrayBuffer | string,
      };
      setFile(newFile);
    };
  };

  const handleOnSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDatasets((prevDatasets) => {
      if (!file) return prevDatasets;
      const now = new Date();
      const formattedTime = now
        .toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .split(" at ");

      const updatedDatasets = prevDatasets.map((dataset) => {
        if (dataset.name === file.name.split("_")[0]) {
          return {
            ...dataset,
            numEvents: dataset.numEvents + 1,
            lastUpdated: `${formattedTime[0]}, ${formattedTime[1]}`,
          };
        }
        return dataset;
      });

      const isDatasetUpdated = updatedDatasets.some(
        (dataset) => dataset.name === file.name.split("_")[0],
      );

      if (isDatasetUpdated) {
        return updatedDatasets;
      }

      const newFile = {
        id: (prevDatasets.length + 1).toString(),
        name: file.name.split("_")[0] || "",
        numEvents: 1,
        lastUpdated: `${formattedTime[0]}, ${formattedTime[1]}`,
      };

      return [...prevDatasets, newFile];
    });
    setFile(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <main className="space-y-8 p-16 h-screen">
      <div className="flex items-center gap-4">
        <DataSourceIcon />
        <h1 className="inline text-2xl font-bold">Data Sources</h1>
      </div>

      <div className="flex w-full flex-row items-center gap-x-4">
        <Input
          placeholder="Search data sources..."
          className="flex-grow"
        />
        <p className="right-0 text-[#878787] text-nowrap">{datasets.length} results</p>
      </div>

      <div className="flex w-full flex-row items-center gap-x-4">
        <p className="flex-grow"></p>

        <div
          className="flex cursor-pointer flex-row text-[#068eff]"
          onClick={handleRefresh}
        >
          <RefreshCcw className="mr-2 h-6 w-6 text-[#068eff]" /> Refresh
        </div>

        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-row text-[#068eff]">
            <Plus className="mr-2 h-6 w-6 text-[#068eff]" /> Add Data Source
          </div>
        </label>
        <input
          className="hidden"
          id="file-upload"
          type="file"
          accept="text/xml"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </div>

      {file && (
        <div className="flex flex-row items-center gap-x-4">
          <p className="text-lg">{file.name}</p>
          <Button
            style={{ backgroundColor: "#068eff" }}
            onClick={handleOnSubmit}
          >
            Upload File
          </Button>
        </div>
      )}

      <ScrollArea className="-z-20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-4">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Number of Events</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((dataset) => (
              <TableRow key={dataset.id}>
                <TableCell className="font-medium">{dataset.id}</TableCell>
                <TableCell>{dataset.name}</TableCell>
                <TableCell>{dataset.numEvents}</TableCell>
                <TableCell>{dataset.lastUpdated}</TableCell>
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
              <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right">
                {datasets.length} sources
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </main>
  );
}
