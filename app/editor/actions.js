// Actions: fields on the node, one "then" output. `paper` hints at the call behind it.
export const ACTIONS = {
  broadcast: {
    label: "Broadcast",
    desc: "Sends a message to everyone online",
    icon: "megaphone",
    fields: [{ key: "message", label: "Message", area: true, placeholder: "Welcome, {player}!", vars: true }],
    paper: "Bukkit.broadcast(message)",
  },
  send_message: {
    label: "Send message",
    desc: "Sends a message to one player",
    icon: "message",
    fields: [
      { key: "target", label: "To", placeholder: "{player}", vars: true },
      { key: "message", label: "Message", area: true, placeholder: "Hi {player.name}!", vars: true },
    ],
    paper: "target.sendMessage(message)",
  },
  cancel_event: {
    label: "Cancel event",
    desc: "Stops the event, only for events that can be cancelled",
    icon: "ban",
    fields: [],
    paper: "event.setCancelled(true)",
  },
};
