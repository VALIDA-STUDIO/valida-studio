// Events an Event node can listen to. `outputs` are the variables it provides; `setters` are what can
// be changed on it from a Modify event block. `paper` is the call behind each.
export const EVENTS = {
  player_join: {
    id: "player_join",
    label: "Player joins",
    paper: "PlayerJoinEvent",
    outputs: [
      { id: "player", label: "player", type: "Player" },
      { id: "joinMessage", label: "join message", type: "String" },
    ],
    setters: [
      { key: "joinMessage", label: "Join message", text: true, vars: true, excludes: ["clearJoinMessage"], placeholder: "{player.name} joined", paper: "event.joinMessage(Component)" },
      { key: "clearJoinMessage", label: "Hide join message", toggle: true, excludes: ["joinMessage"], paper: "event.joinMessage(null)" },
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
    setters: [
      { key: "quitMessage", label: "Quit message", text: true, vars: true, excludes: ["clearQuitMessage"], placeholder: "{player.name} left", paper: "event.quitMessage(Component)" },
      { key: "clearQuitMessage", label: "Hide quit message", toggle: true, excludes: ["quitMessage"], paper: "event.quitMessage(null)" },
    ],
  },
  player_chat: {
    id: "player_chat",
    label: "Player chats",
    paper: "AsyncChatEvent",
    cancellable: true,
    outputs: [
      { id: "player", label: "player", type: "Player" },
      { id: "message", label: "message", type: "String" },
    ],
    setters: [
      { key: "message", label: "Message", text: true, vars: true, excludes: ["cancel"], placeholder: "{player.name}: {message}", paper: "event.message(Component)" },
      { key: "cancel", label: "Cancel the event", toggle: true, excludes: ["message"], paper: "event.setCancelled(true)" },
    ],
  },
};

export const DEFAULT_EVENT = "player_join";
