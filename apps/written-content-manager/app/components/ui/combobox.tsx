"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export function Combobox(props: {
  options: { value: string; label: string }[];
  name: string;
  defaultValue: string | undefined;
  onChange?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  emptyText: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(props.defaultValue ?? "");
  const valueToLabelMap = useMemo(
    () =>
      new Map<string, string>(
        props.options.flatMap((o) => [
          [o.value, o.label],
          [o.label, o.value],
        ])
      ),
    [props.options]
  );

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = ref.current?.form;
    if (form) {
      const aborter = new AbortController();
      form.addEventListener(
        "reset",
        () => {
          setValue("");
        },
        {
          signal: aborter.signal,
        }
      );

      return () => aborter.abort();
    }
  }, [ref.current]);

  return (
    <>
      <input type="hidden" value={value} name={props.name} ref={ref} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild autoFocus={props.autoFocus}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", props.className)}
          >
            {value
              ? valueToLabelMap.get(value)
              : (props.placeholder ?? "Select...")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>{props.emptyText}</CommandEmpty>
              <CommandGroup>
                {props.options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={(label) => {
                      const resolvedValue = valueToLabelMap.get(label);
                      if (!resolvedValue) return;
                      setValue(resolvedValue === value ? "" : resolvedValue);
                      setOpen(false);
                      props.onChange?.();
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
