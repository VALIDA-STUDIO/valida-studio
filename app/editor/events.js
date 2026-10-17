// Events an Event node can listen to. `paper` is the event class, `outputs` the variables it provides.
export const EVENTS = {
  player_join: {
    id: "player_join",
    label: "Player joins",
    paper: "PlayerJoinEvent",
    outputs: [
      { id: "player", label: "player", type: "Player" },
      { id: "joinMessage", label: "join message", type: "String" },
    ],
  },
  player_quit: {
    id: "player_quit",
    label: "Player leaves",
    paper: "PlayerQuitEvent",
    outputs: [
      { id: "player", label: "player", type: "Player" },
      { id: "quitMessage", label: "quit message", type: "String" },
      { id: "reason", label: "reason", type: "String" },
    ],
  },
};

export const DEFAULT_EVENT = "player_join";
