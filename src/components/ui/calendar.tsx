"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white", className)}
      classNames={{
        // Container
        months: "relative flex flex-col",
        month: "space-y-4",
        month_caption: "flex justify-center items-center h-10 mb-2",
        caption_label: "text-sm font-bold text-neutral-900 tracking-wide",

        // Navigation - positioned in header
        nav: "absolute top-0 left-0 right-0 flex items-center justify-between px-1 h-10",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50 hover:border-neutral-300 opacity-70 hover:opacity-100 transition-all rounded-lg z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50 hover:border-neutral-300 opacity-70 hover:opacity-100 transition-all rounded-lg z-10"
        ),

        // Week days header
        weekdays: "flex justify-between mb-2",
        weekday: "text-neutral-400 w-9 font-normal text-[0.8rem] text-center",

        // Weeks/Days grid
        month_grid: "w-full",
        week: "flex justify-between mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-neutral-900 aria-selected:opacity-100 hover:bg-neutral-100 hover:text-black rounded-md transition-colors"
        ),

        // Day states
        range_end: "day-range-end",
        selected: "bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white focus:bg-neutral-900 focus:text-white !font-medium shadow-sm rounded-md",
        today: "bg-neutral-100 text-neutral-900 font-semibold border border-neutral-200 rounded-md",
        outside: "text-neutral-300 opacity-50 aria-selected:bg-neutral-100/50 aria-selected:text-neutral-500",
        disabled: "text-neutral-300 opacity-50",
        range_middle: "aria-selected:bg-neutral-100 aria-selected:text-neutral-900",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }