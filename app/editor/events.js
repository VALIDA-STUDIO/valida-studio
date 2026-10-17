// Events an Event node can listen to. `paper` is the event class, `outputs` the variables it provides.
export const EVENTS = {
  player_join: {
    id: "player_join",
    label: "Player joins",
    paper: "PlayerJoinEvent",
    outputs: [
      { id: "player", label: "player" },
      { id: "joinMessage", label: "join message" },
    ],
  },
  player_quit: {
    id: "player_quit",
    label: "Player leaves",
    paper: "PlayerQuitEvent",
    outputs: [
      { id: "player", label: "player" },
      { id: "quitMessage", label: "quit message" },
      { id: "reason", label: "reason" },
    ],
  },
};

export const DEFAULT_EVENT = "player_join";
