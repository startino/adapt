export const categories = ['move', 'eat', 'sleep', 'mind'] as const;
export type Category = (typeof categories)[number];
