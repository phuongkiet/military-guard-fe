import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import type { Instance as FlatpickrInstance } from "flatpickr/dist/types/instance";
import { TimeIcon } from "../../assets/icons";

type TimePickerProps = {
  id: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function TimePicker({
  id,
  value = "",
  onChange,
  placeholder,
  disabled = false,
}: TimePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<FlatpickrInstance | null>(null);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    pickerRef.current = flatpickr(inputRef.current, {
      static: true,
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      minuteIncrement: 5,
      defaultDate: value || undefined,
      onChange: (_, currentTimeString) => {
        onChange?.(currentTimeString);
      },
    });

    return () => {
      pickerRef.current?.destroy();
      pickerRef.current = null;
    };
  }, [onChange]);

  useEffect(() => {
    if (!pickerRef.current) {
      return;
    }

    if (!value) {
      pickerRef.current.clear();
      return;
    }

    if (pickerRef.current.input.value !== value) {
      pickerRef.current.setDate(value, false, "H:i");
    }
  }, [value]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        value={value}
        readOnly
        disabled={disabled}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border appearance-none bg-transparent px-4 py-2.5 pr-12 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <TimeIcon className="size-5" />
      </span>
    </div>
  );
}
