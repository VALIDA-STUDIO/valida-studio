// Icons for building blocks (lucide outlines)
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
const I = (paths, extra = null) => (props) => (
  <svg {...base} width={props?.size ?? 14} height={props?.size ?? 14}>
    {paths.map((d, i) => (
      <path key={i} d={d} />
    ))}
    {extra}
  </svg>
);

export const BLOCK_ICONS = {
  send_message: I(["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"]),
  broadcast: I(["m3 11 18-5v12L3 14v-3z", "M11.6 16.8a3 3 0 1 1-5.8-1.6"]),
  teleport: I(["m3 11 19-9-9 19-2-8-8-2z"]),
  give_item: I(["M20 12v10H4V12", "M2 7h20v5H2z", "M12 22V7", "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z", "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"]),
  play_sound: I(["M11 5 6 9H2v6h4l5 4V5z", "M15.54 8.46a5 5 0 0 1 0 7.07", "M19.07 4.93a10 10 0 0 1 0 14.14"]),
  run_command: I(["m4 17 6-6-6-6M12 19h8"]),
  wait: I(["M12 6v6l4 2"], <circle cx="12" cy="12" r="10" />),
  has_permission: I(["M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", "m9 12 2 2 4-4"]),
};
