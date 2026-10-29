// GERADO por scripts/build-tokens.ts — não edite à mão.
export const dur = {
  "instant": 0.1,
  "fast": 0.16,
  "medium": 0.28,
  "slow": 0.5,
  "trail": 1.2,
  "ambient": 20,
  "stagger": 0.08
} as const;

export const ease = {
  "enter": [0.22, 1, 0.36, 1],
  "exit": [0.4, 0, 1, 1],
  "standard": [0.4, 0, 0.2, 1],
  "stamp": [0.34, 1.56, 0.64, 1]
} as const;

export const move = {
  "xs": 4,
  "sm": 12,
  "md": 24
} as const;

export const reveal = { amount: 0.2, once: true, maxStagger: 6 } as const;
