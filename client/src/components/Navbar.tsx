"use client";

import {
  BarChart,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  LogOut,
  Timer,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";
import CustomTooltip from "./CustomTooltip";

type NavLinkType = {
  name: string;
  children: ReactNode;
  href: string;
};

export default function Navbar() {
  const pathName = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isCurrentPath = (path: string) => {
    return pathName === path;
  };

  const topNavLinks = [
    {
      name: "Dashboard",
      children: (
        <TrendingUp className="h-6 w-6" aria-label="Market Sentiment" />
      ),
      href: "/app",
    },
    {
      name: "Alerts",
      children: <Timer className="h-6 w-6" aria-label="Alerts" />,
      href: "/app/alerts",
    },
    {
      name: "Data Sources",
      children: <FileText className="h-6 w-6" aria-label="Data Sources" />,
      href: "/app/data",
    },
  ];

  const bottomNavLinks = [
    {
      name: "Plans",
      children: (
        <DollarSign className="h-6 w-6" aria-label="Plans" />
      ),
      href: "/app/plans",
    },
  ];

  const handleLogout = () => {
    signOut(
      {
        redirect: false,
        callbackUrl: "/",
      }
    );
    router.push("/");
  };

  return (
    // <nav className="relative inline-flex h-screen flex-col justify-between border-r border-r-white/10 bg-zinc-900 p-10">
    <nav className="relative inline-flex h-screen flex-col justify-between border-r border-r-black/10 bg-black/5 p-10 dark:bg-zinc-900 dark:border-r-white/10">
      {/* Upper part */}
      <div className="space-y-6 overflow-visible">
        {/* App Icon */}
        {open ? (
          <Link href="/" className="flex flex-nowrap items-center gap-6">
            <div className="rounded-lg bg-black/10 p-3 dark:bg-white/10">
              <BarChart className="h-6 w-6" aria-label="Insight Trader" />
            </div>
            <span className="text-lg font-bold text-nowrap">Insight Trader</span>
          </Link>
        ) : (
          <Link href="/" className="mx-auto block rounded-lg bg-black/10 p-3 dark:bg-white/10">
            <BarChart className="h-6 w-6" aria-label="Insight Trader" />
          </Link>
        )}
        <hr className="h-[1px] border-none bg-white/10" />
        {/* Nav links */}
        {topNavLinks.map((link: NavLinkType, index: number) => (
          <div key={index}>
            {open ? (
              <Link
                className={`flex flex-row items-center gap-4 rounded-lg pr-2 ${isCurrentPath(link.href) ? "font-bold text-blue-500" : "hover:text-white/50"}`}
                href={link.href}
              >
                <div
                  className={`rounded-lg ${isCurrentPath(link.href) && "bg-blue-500"}/25 p-3`}
                >
                  {link.children}
                </div>
                <span className="text-nowrap">{link.name}</span>
              </Link>
            ) : (
              <Link
                href={link.href}
                className={`group relative block rounded-lg p-3 ${isCurrentPath(link.href) ? "bg-blue-500/25 text-blue-500" : "duration-150 hover:bg-white/10"}`}
              >
                {link.children}
                <div className="absolute left-full top-1/2 ml-4 -translate-y-1/2 scale-0 text-sm text-white shadow-md group-hover:scale-100">
                  <div className="w-max rounded-lg bg-zinc-800 px-4 py-2">
                    {link.name}
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
      {/* Lower part */}
      <div className="space-y-4 flex flex-col items-stretch">
        {bottomNavLinks.map((link: NavLinkType, index: number) => (
          <div key={index}>
            {open ? (
              <Link
                className={`flex flex-row items-center gap-4 rounded-lg pr-2 ${isCurrentPath(link.href) ? "font-bold text-blue-500" : "hover:text-white/50"}`}
                href={link.href}
              >
                <div
                  className={`rounded-lg ${isCurrentPath(link.href) && "bg-blue-500"}/25 p-3`}
                >
                  {link.children}
                </div>
                <span className="text-nowrap">{link.name}</span>
              </Link>
            ) : (
              <Link
                href={link.href}
                className={`group relative block rounded-lg p-3 ${isCurrentPath(link.href) ? "bg-blue-500/25 text-blue-500" : "duration-150 hover:bg-white/10"}`}
              >
                {link.children}
                <div className="absolute left-full top-1/2 ml-4 -translate-y-1/2 scale-0 text-sm text-white shadow-md group-hover:scale-100">
                  <div className="w-max rounded-lg bg-zinc-800 px-4 py-2">
                    {link.name}
                  </div>
                </div>
              </Link>
            )}
          </div>
        ))}
        {open ? (
          <button
            onClick={handleLogout}
            className="flex flex-wrap justify-center gap-4 rounded-lg border border-red-500 p-2 text-red-500 duration-150 hover:bg-red-500/25"
          >
            <LogOut className="h-6 w-6" aria-label="Log out" />
            <span>Log out</span>
          </button>
        ) : (
          <>
              <DarkModeToggle />
              <button className="group relative block rounded-lg mx-auto border border-red-500 p-2 text-red-500 duration-150 hover:bg-red-500/25">
                <LogOut className="h-6 w-6" aria-label="Log out" />
                <div className="absolute left-full top-1/2 ml-4 -translate-y-1/2 scale-0 text-sm text-white shadow-md group-hover:scale-100">
                  <div className="w-max rounded-lg bg-zinc-800 px-4 py-2">
                    Log out
                  </div>
                </div>
              </button>
          </>
        )}
      </div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="absolute right-[-2.5em] top-7 -translate-x-1/2 translate-y-1/2 rounded-full border border-black/10 bg-gray-200 p-2 dark:bg-zinc-900 dark:border-white/10"
      >
        {open ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>
    </nav>
  );
}
