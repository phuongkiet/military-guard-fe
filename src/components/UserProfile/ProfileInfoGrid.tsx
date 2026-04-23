type ProfileInfoItem = {
  label: string;
  value: string | number | null | undefined;
};

type ProfileInfoGridProps = {
  items: ProfileInfoItem[];
  className?: string;
};

const formatValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
};

export default function ProfileInfoGrid({ items, className = "" }: ProfileInfoGridProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`.trim()}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/3"
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">
            {formatValue(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
