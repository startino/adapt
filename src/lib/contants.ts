export const categories = ['MOVE', 'EAT', 'SLEEP', 'MIND'] as const;
export type Category = (typeof categories)[number];
