// Events an Event node can listen to. `paper` is the event class, `outputs` what the event hands over.
export const EVENTS = {
  pre_player_attack_entity: {
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
};

export const DEFAULT_EVENT = "pre_player_attack_entity";
