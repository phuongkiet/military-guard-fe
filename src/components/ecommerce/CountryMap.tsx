interface CountryMapProps {
  mapColor?: string;
}

const markerItems = [
  { name: "United States", left: "20%", top: "38%" },
  { name: "India", left: "68%", top: "48%" },
  { name: "United Kingdom", left: "45%", top: "28%" },
  { name: "Sweden", left: "50%", top: "22%" },
];

export default function CountryMap({ mapColor }: CountryMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
      <svg
        viewBox="0 0 1000 420"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="World map overview"
      >
        <rect width="1000" height="420" fill="transparent" />
        <g fill={mapColor || "#D0D5DD"}>
          <path d="M86 165c21-18 52-31 89-31 27 0 53 8 66 22 12 12 16 28 7 39-16 18-58 13-87 25-25 10-42 34-75 22-21-8-29-32 0-77z" />
          <path d="M262 118c27-19 75-24 110-15 28 8 42 25 38 40-5 20-35 27-59 35-18 7-32 16-40 30-12 19-44 22-61 7-17-16-22-65 12-97z" />
          <path d="M442 103c27-16 67-18 93-8 20 8 28 24 23 36-7 14-24 18-38 21-17 5-30 13-37 26-8 14-30 17-44 8-15-9-22-41 3-83z" />
          <path d="M539 151c19-16 52-22 80-17 19 4 34 16 33 29-1 14-16 23-33 30-14 6-27 13-33 24-8 13-27 17-42 10-16-8-24-41-5-76z" />
          <path d="M639 166c16-12 42-18 65-14 17 4 29 15 27 27-2 12-14 20-28 26-13 5-24 11-29 21-7 12-24 15-37 8-14-8-20-34 2-68z" />
          <path d="M722 196c20-13 50-17 73-9 15 5 23 17 20 30-3 13-14 20-26 26-12 6-22 13-27 23-7 14-25 16-40 7-15-10-20-41 0-77z" />
          <path d="M853 255c14-11 34-16 52-13 14 3 24 12 24 23 0 10-8 16-18 21-10 4-19 9-23 17-6 11-21 14-33 8-13-7-18-30-2-56z" />
        </g>
      </svg>

      {markerItems.map((marker) => (
        <span
          key={marker.name}
          title={marker.name}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-brand-500 shadow"
          style={{ left: marker.left, top: marker.top }}
        />
      ))}
    </div>
  );
}
