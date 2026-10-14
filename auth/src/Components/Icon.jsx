import "./Icon.css";

const paths = {
  bag: ["M6 7h12l1 14H5L6 7Z", "M9 8V6a3 3 0 0 1 6 0v2"],
  cart: ["M3 3h2l3 12h10l3-8H6", "M9 20h.01", "M18 20h.01"],
  heart: [
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  ],
  home: ["m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z"],
  grid: [
    "M3 3h7v7H3V3Z",
    "M14 3h7v7h-7V3Z",
    "M3 14h7v7H3v-7Z",
    "M14 14h7v7h-7v-7Z",
  ],
  package: [
    "m12 3 9 5v8l-9 5-9-5V8l9-5Z",
    "m3 8 9 5 9-5",
    "M12 13v8",
    "m7 5 9 5",
  ],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m17 17 4 4"],
  arrow: ["M4 12h16", "m14 6 6 6-6 6"],
  back: ["M20 12H4", "m10 6-6 6 6 6"],
  logout: ["M9 3H4v18h5", "M9 12h12", "m17 8 4 4-4 4"],
  check: ["m5 12 4 4L19 6"],
  shield: ["m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z", "m8 12 3 3 5-6"],
  sparkles: [
    "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
    "M21 2v4",
    "M19 4h4",
  ],
  user: ["M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 22a8 8 0 0 1 16 0"],
  mail: ["M3 5h18v14H3V5Z", "m3 5 9 7 9-7"],
  phone: ["M6 3h4l1 5-3 2a13 13 0 0 0 6 6l2-3 5 1v4c-1 5-19-9-15-15Z"],
  lock: ["M5 10h14v11H5V10Z", "M8 10V7a4 4 0 0 1 8 0v3", "M12 15v2"],
  trash: ["M3 6h18", "M9 6V3h6v3", "m6 6 1 15h10l1-15", "M10 10v7", "M14 10v7"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  loader: ["M21 12a9 9 0 1 1-6-8.5"],
  filter: ["M4 7h16", "M4 17h16", "M8 4v6", "M16 14v6"],
  pin: [
    "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z",
    "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  ],
};

function Icon({ name, className = "" }) {
  const iconPaths = paths[name] || paths.bag;
  return (
    <svg
      className={"icon " + className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {iconPaths.map((path, index) => (
        <path d={path} key={index} />
      ))}
    </svg>
  );
}
// Displays a reusable icon; all visual properties are defined in Icon.css.

export default Icon;
