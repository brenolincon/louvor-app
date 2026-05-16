"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import "react-day-picker/dist/style.css";

type DatePickerProps = {
  value?: Date;
  placeholder?: string;
  onChange: (date: Date | undefined) => void;
};

export function DatePicker({
  value,
  placeholder = "Selecionar data",
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-left text-sm text-white transition hover:border-violet-500 focus:border-violet-500"
      >
        <span>
          {value
            ? format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            : placeholder}
        </span>

        <CalendarIcon size={18} className="text-zinc-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-14 z-50 rounded-3xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            locale={ptBR}
            captionLayout="dropdown"
            fromYear={1940}
            toYear={new Date().getFullYear() + 5}
            modifiersClassNames={{
              selected: "rdp-custom-selected",
              today: "rdp-custom-today",
            }}
            classNames={{
              chevron: "fill-violet-500 text-violet-500",
              dropdown: "rdp-dropdown",
              dropdowns: "flex items-center gap-2",
              caption_label: "text-sm font-semibold text-white capitalize",
              caption: "flex items-center justify-between px-1 pb-4",
            }}
          />
        </div>
      )}
    </div>
  );
}
