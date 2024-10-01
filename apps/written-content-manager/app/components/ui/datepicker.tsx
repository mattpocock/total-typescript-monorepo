"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function DatePicker(props: {
  defaultValue?: string | null;
  onChange?: () => void;
  name: string;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    props.defaultValue ? new Date(props.defaultValue) : undefined
  );

  return (
    <>
      <input type="hidden" name={props.name} value={date?.toISOString()} />
      <div className="grid grid-cols-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              type="button"
              className={cn(
                "justify-start text-left font-normal rounded-r-none col-span-2 border-r-0",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                <span>Posted {format(date, "yyyy-MM-dd")}</span>
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                props.onChange?.();
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          className="rounded-l-none"
          variant="default"
          onClick={() => {
            setDate(new Date());
            props.onChange?.();
          }}
        >
          Today
        </Button>
      </div>
    </>
  );
}
