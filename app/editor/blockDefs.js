// Building blocks that can hang off a command. Field values are stored in the node's data.
// {sender} is the player who ran the command, {argname} the value of an argument.

export const BLOCKS = {
  send_message: {
    desc: "Message to the sender or a player",
    kind: "action",
    title: "Send message",
    summary: (v) => v.message,
    fields: [{ key: "message", label: "Message", placeholder: "Teleporting you to {player}…", hint: "Use {sender} or {argname} as placeholders." }],
    outputs: ["then"],
  },
  broadcast: {
    desc: "Message to everyone online",
    kind: "action",
    title: "Broadcast",
    summary: (v) => v.message,
    fields: [{ key: "message", label: "Message", placeholder: "{sender} joined the party!" }],
    outputs: ["then"],
  },
  teleport: {
    desc: "Move a player somewhere",
    kind: "action",
    title: "Teleport",
    summary: (v) => [v.who, v.to].filter(Boolean).join(" → "),
    fields: [
      { key: "who", label: "Who", placeholder: "{sender}", hint: "A player: {sender} or {argname}." },
      { key: "to", label: "To", placeholder: "{player}", hint: "A player, or x y z, or a world spawn." },
    ],
    outputs: ["then"],
  },
  give_item: {
    desc: "Put an item in an inventory",
    kind: "action",
    title: "Give item",
    summary: (v) => [v.amount, v.item].filter(Boolean).join("× "),
    fields: [
      { key: "item", label: "Item", placeholder: "diamond_sword" },
      { key: "amount", label: "Amount", placeholder: "1", type: "number" },
    ],
    outputs: ["then"],
  },
  play_sound: {
    desc: "Play a sound for a player",
    kind: "action",
    title: "Play sound",
    summary: (v) => v.sound,
    fields: [
      { key: "sound", label: "Sound", placeholder: "entity.player.levelup" },
      { key: "volume", label: "Volume", placeholder: "1", type: "number" },
      { key: "pitch", label: "Pitch", placeholder: "1", type: "number" },
    ],
    outputs: ["then"],
  },
  run_command: {
    desc: "Run another command as console",
    kind: "action",
    title: "Run command",
    summary: (v) => v.command && "/" + v.command.replace(/^\//, ""),
    fields: [{ key: "command", label: "Command", placeholder: "say hello", hint: "Runs as the console." }],
    outputs: ["then"],
  },
  wait: {
    desc: "Pause before the next block",
    kind: "action",
    title: "Wait",
    summary: (v) => v.seconds && `${v.seconds} s`,
    fields: [{ key: "seconds", label: "Seconds", placeholder: "2", type: "number" }],
    outputs: ["then"],
  },
  has_permission: {
    desc: "Branch on a permission",
    kind: "condition",
    title: "Has permission",
    summary: (v) => v.permission,
    fields: [{ key: "permission", label: "Permission", placeholder: "lobby.vip", hint: "Checked on {sender}." }],
    outputs: ["yes", "no"],
  },
};

export const PALETTE = [
  { kind: "action", label: "Actions", types: ["send_message", "broadcast", "teleport", "give_item", "play_sound", "run_command", "wait"] },
  { kind: "condition", label: "Conditions", types: ["has_permission"] },
];
