// ModeToggle component with fixed hover effect and icon alignment
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

export default function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group relative block rounded-lg p-3 hover:bg-white/10">
          <Sun className="h-6 w-6 black transition-all dark:-rotate-90 dark:hidden" />
          <Moon className="h-6 w-6 rotate-90 hidden transition-all dark:rotate-0 dark:block" />
          <div className="absolute left-full top-1/2 ml-4 -translate-y-1/2 scale-0 text-sm text-white shadow-md group-hover:scale-100">
            <div className="w-max rounded-lg bg-zinc-800 px-4 py-2">
              Dark mode
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
