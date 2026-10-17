// Events an Event node can listen to. `outputs` are the variables it provides; `setters` are
// what a Modify event block can change on it. `paper` is the call behind each.
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
      { key: "joinMessage", label: "Join message", text: true, vars: true, placeholder: "{player.name} joined", paper: "event.joinMessage(Component)" },
      { key: "clearJoinMessage", label: "Hide join message", toggle: true, paper: "event.joinMessage(null)" },
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
      { key: "quitMessage", label: "Quit message", text: true, vars: true, placeholder: "{player.name} left", paper: "event.quitMessage(Component)" },
      { key: "clearQuitMessage", label: "Hide quit message", toggle: true, paper: "event.quitMessage(null)" },
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
      { key: "message", label: "Message", text: true, vars: true, placeholder: "{player.name}: {message}", paper: "event.message(Component)" },
      { key: "cancel", label: "Cancel the event", toggle: true, paper: "event.setCancelled(true)" },
    ],
  },
};

export const DEFAULT_EVENT = "player_join";
