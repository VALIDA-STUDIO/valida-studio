// Sections of the Project Canvas. Each one gets a sidebar row and a page at /canvas/<slug>.

const icon = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ZapIcon = () => (
  <svg {...icon}>
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  </svg>
);

const TerminalIcon = () => (
  <svg {...icon}>
    <path d="m4 17 6-6-6-6M12 19h8" />
  </svg>
);

export const CATEGORIES = [
  { slug: "events", label: "Events", Icon: ZapIcon },
  { slug: "commands", label: "Commands", Icon: TerminalIcon },
];

export const findCategory = (slug) => CATEGORIES.find((c) => c.slug === slug) ?? null;
