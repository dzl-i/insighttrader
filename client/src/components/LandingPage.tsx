"use client";

import Link from "next/link";
import { BarChart } from "lucide-react";
import StarGrid from "~/components/graphs/StarGrid";
import dashboard from "public/dashboard.png";
import Image from "next/image";
import { BarChart3, BookText, List, TrendingUp } from "lucide-react";
import { useRef } from "react";
import { useIsVisible } from "./hooks/useIsVisible";

export default function LandingPage() {
  const ref1 = useRef(null);
  const isVisible1 = useIsVisible(ref1);
  const ref2 = useRef(null);
  const isVisible2 = useIsVisible(ref2);
  const ref3 = useRef(null);
  const isVisible3 = useIsVisible(ref3);

  return (
    <>
      {/* Navbar */}
      <nav className="flex items-center justify-between p-12">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          <h1 className="text-xl font-bold">Insight Trader</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="block px-8 py-2 duration-500 hover:opacity-85"
            href="#"
            onClick={
              (e) => {
                e.preventDefault();
                window.location.href = "/register";
            }}
          >
            Register
          </Link>
          <Link
            className="after:duration-1500 relative inline-flex h-fit w-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-8 py-2 text-blue-500 outline-none ring-blue-500 transition-colors after:absolute after:inset-0 after:-z-10 after:animate-pulse after:rounded-full after:bg-blue-500 after:bg-opacity-0 after:blur-lg after:transition-all hover:border-blue-500/40 hover:text-blue-500 after:hover:bg-opacity-15 focus:ring-2 focus:ring-offset-2"
            href="#"
            onClick={
              (e) => {
                e.preventDefault();
                window.location.href = "/app";
            }}
          >
            Login
          </Link>
        </div>
      </nav>
      <StarGrid />
      {/* Main page */}
      <main className="space-y-24 text-center">
        <div
          ref={ref1}
          className={`space-y-12 py-16 transition-opacity duration-700 ease-in ${isVisible1 ? "opacity-100" : "opacity-0"}`}
        >
          <h1 className="text-6xl font-bold">Insight Trader</h1>
          <p className="italic opacity-50">
            Navigate the News, Master the Market.
          </p>

          <div className="before:from-bg-white/5 before:to-bg-white/0 relative mx-auto block w-[85%] before:absolute before:-inset-2 before:-z-10 before:rounded-lg before:border before:border-white/20 before:bg-gradient-to-br before:backdrop-blur-md">
            <Image
              className="inline-block rounded-md"
              src={dashboard}
              alt="Dashboard"
            />
          </div>
        </div>
        <div
          ref={ref2}
          className={`space-y-12 transition-opacity duration-700 ease-in ${isVisible2 ? "opacity-100" : "opacity-0"}`}
        >
          <h2 className="mx-auto block w-[85%] text-4xl font-medium italic">
            Introducing the new way you navigate the market.
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(240px,_1fr))] gap-8 px-24">
            <div className="before:from-bg-white/5 before:to-bg-white/0 relative space-y-4 bg-black/15 p-4 text-center transition-colors duration-500 before:absolute before:-inset-2 before:-z-10 before:rounded-lg before:border before:border-white/20 before:bg-gradient-to-br before:backdrop-blur-md after:absolute after:inset-0 after:-z-10 after:animate-pulse after:rounded-full after:bg-white after:bg-opacity-0 after:blur-lg after:transition-all after:hover:bg-opacity-5">
              <BarChart3 className="mx-auto block h-16 w-16 rounded-full border border-white p-5" />
              <h3 className="text-lg font-bold">Market Analysis</h3>
              <p className="text-sm font-light">
                Gain a comprehensive understanding of market trends through
                in-depth analysis across a vast collection of articles.
              </p>
            </div>
            <div className="before:from-bg-white/5 before:to-bg-white/0 relative space-y-4 bg-black/15 p-4 text-center transition-colors duration-500 before:absolute before:-inset-2 before:-z-10 before:rounded-lg before:border before:border-white/20 before:bg-gradient-to-br before:backdrop-blur-md after:absolute after:inset-0 after:-z-10 after:animate-pulse after:rounded-full after:bg-white after:bg-opacity-0 after:blur-lg after:transition-all after:hover:bg-opacity-5">
              <BookText className="mx-auto block h-16 w-16 rounded-full border border-white p-5" />
              <h3 className="text-lg font-bold">Article Insights</h3>
              <p className="text-sm font-light">
                We summarizes key points and insights for each news article,
                giving you a quick overview.
              </p>
            </div>
            <div className="before:from-bg-white/5 before:to-bg-white/0 relative space-y-4 bg-black/15 p-4 text-center transition-colors duration-500 before:absolute before:-inset-2 before:-z-10 before:rounded-lg before:border before:border-white/20 before:bg-gradient-to-br before:backdrop-blur-md after:absolute after:inset-0 after:-z-10 after:animate-pulse after:rounded-full after:bg-white after:bg-opacity-0 after:blur-lg after:transition-all after:hover:bg-opacity-5">
              <List className="mx-auto block h-16 w-16 rounded-full border border-white p-5" />
              <h3 className="text-lg font-bold">Topic Modelling</h3>
              <p className="text-sm font-light">
                Identify emerging trends and popular topics by analyzing
                patterns across the entire corpus of articles.
              </p>
            </div>
            <div className="before:from-bg-white/5 before:to-bg-white/0 relative space-y-4 bg-black/15 p-4 text-center transition-colors duration-500 before:absolute before:-inset-2 before:-z-10 before:rounded-lg before:border before:border-white/20 before:bg-gradient-to-br before:backdrop-blur-md after:absolute after:inset-0 after:-z-10 after:animate-pulse after:rounded-full after:bg-white after:bg-opacity-0 after:blur-lg after:transition-all after:hover:bg-opacity-5">
              <TrendingUp className="mx-auto block h-16 w-16 rounded-full border border-white p-5" />
              <h3 className="text-lg font-bold">Stock Recommender</h3>
              <p className="text-sm font-light">
                Leveraging natural language processing on news articles, we
                provide data-driven stock recommendations tailored to your
                investment goals.
              </p>
            </div>
          </div>
        </div>
        <div
          ref={ref3}
          className={`relative space-y-12 p-32 text-center transition-opacity duration-700 ease-in ${isVisible3 ? "opacity-100" : "opacity-0"}`}
        >
          <div className="glow absolute left-1/2 top-1/2 -z-10 aspect-square w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-500/35 blur-3xl filter transition-all"></div>
          <h1 className="text-5xl font-medium">
            Begin your market analysis journey now.
          </h1>
          <Link
            className="w=fit after:duration-1500 relative inline-flex h-fit rounded-full border border-blue-500 bg-blue-500/5 px-8 py-2 text-blue-500 outline-none ring-blue-500 transition-colors after:absolute after:inset-0 after:-z-10 after:animate-pulse after:rounded-full after:bg-blue-500 after:bg-opacity-0 after:blur-lg after:transition-all hover:border-blue-500/40 hover:text-blue-500 after:hover:bg-opacity-15 focus:ring-2 focus:ring-offset-2"
            href="#"
            onClick={
              (e) => {
                e.preventDefault();
                window.location.href = "/app";
            }}
          >
            Get Started
          </Link>
        </div>
        <footer className="border border-b-transparent border-l-transparent border-r-transparent border-t-white/10 p-12 py-8">
          <span className="text-sm font-light opacity-50">
            Copyright © 2024. SENG3011 F11A CRUNCH
          </span>
        </footer>
      </main>
    </>
  );
}
