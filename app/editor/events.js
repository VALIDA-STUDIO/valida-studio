// Events an Event node can listen to. `paper` is the event class, `outputs` what the event hands over.
export const EVENT_GROUPS = [
  {
    group: "Player",
    events: [
      { id: "player_join", label: "Player joins", paper: "PlayerJoinEvent", outputs: [{ id: "player", label: "player" }] },
      { id: "player_quit", label: "Player leaves", paper: "PlayerQuitEvent", outputs: [{ id: "player", label: "player" }] },
      { id: "player_chat", label: "Player chats", paper: "AsyncChatEvent", cancellable: true, outputs: [{ id: "player", label: "player" }, { id: "message", label: "message" }] },
      { id: "player_death", label: "Player dies", paper: "PlayerDeathEvent", outputs: [{ id: "player", label: "player" }, { id: "killer", label: "killer" }] },
      {
        id: "pre_player_attack_entity",
        label: "Player attacks entity",
        paper: "PrePlayerAttackEntityEvent",
        cancellable: true,
        outputs: [
          { id: "player", label: "player" },
          { id: "attacked", label: "attacked" },
          { id: "willAttack", label: "will attack" },
        ],
      },
    ],
  },
  {
    group: "Block",
    events: [
      { id: "block_break", label: "Player breaks block", paper: "BlockBreakEvent", cancellable: true, outputs: [{ id: "player", label: "player" }, { id: "block", label: "block" }] },
      { id: "block_place", label: "Player places block", paper: "BlockPlaceEvent", cancellable: true, outputs: [{ id: "player", label: "player" }, { id: "block", label: "block" }] },
    ],
  },
  {
    group: "Entity",
    events: [
      { id: "entity_damage", label: "Entity takes damage", paper: "EntityDamageEvent", cancellable: true, outputs: [{ id: "entity", label: "entity" }, { id: "damage", label: "damage" }] },
    ],
  },
];

export const EVENTS = Object.fromEntries(EVENT_GROUPS.flatMap((g) => g.events.map((e) => [e.id, e])));
export const DEFAULT_EVENT = "pre_player_attack_entity";
