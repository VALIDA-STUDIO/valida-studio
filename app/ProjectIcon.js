const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

// Project icons, keyed by project.icon (shared by the switcher and project pages)
export const ICONS = {
  folder: (
    <svg {...stroke}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  ),
  cube: (
    <svg {...stroke}>
      <path d="m21 16-9 5-9-5V8l9-5 9 5z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
  ),
  zap: (
    <svg {...stroke}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  message: (
    <svg {...stroke}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  shield: (
    <svg {...stroke}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  star: (
    <svg {...stroke}>
      <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  ),
  flag: (
    <svg {...stroke}>
      <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.3 2 2 0 3.3-.5 4.7-1.5v10.5c-1.4 1-2.7 1.5-4.7 1.5-2.3 0-4.3-2-7.3-2a6 6 0 0 0-4 1.5" />
    </svg>
  ),
  users: (
    <svg {...stroke}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  map: (
    <svg {...stroke}>
      <path d="M14.1 6 9 3 3.6 5.1A1 1 0 0 0 3 6v13.4a1 1 0 0 0 1.4.9L9 18l6 3 5.4-2.1a1 1 0 0 0 .6-.9V4.6a1 1 0 0 0-1.4-.9z" />
      <path d="M15 5.8V21M9 3v15" />
    </svg>
  ),
  bell: (
    <svg {...stroke}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  heart: (
    <svg {...stroke}>
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .9-4.5 2.5C10.5 3.9 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />
    </svg>
  ),
  pickaxe: (
    <svg {...stroke}>
      <path d="M14.5 6.5 3 18l3 3L17.5 9.5" />
      <path d="M12 4c3-1.5 7-1 9 2.5" />
      <path d="M14 2c1.5 3 1 7-2.5 9" />
    </svg>
  ),
  layout: (
    <svg {...stroke}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  globe: (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
    </svg>
  ),
  wrench: (
    <svg {...stroke}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

export const ICON_NAMES = Object.keys(ICONS);

export default function ProjectIcon({ icon }) {
  return ICONS[icon] ?? ICONS.folder;
}
