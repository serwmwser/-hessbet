import { useApp } from "./ctx";

const RU = {
  stdName: "Стандарт",
  bigName: "Крупные",
  stdInfo: "Обычные партии со ставкой от 0.5 до 5 USDC. Подходят для первых игр и для тренировки на реальных ставках.",
  bigInfo: (max: string) =>
    `Партии с большой ставкой: от 5.5 до ${max} USDC (шаг 0.5). Приз больше, а верхний лимит поднимается постепенно, по мере проверки работы контракта.`,
};

const EN: typeof RU = {
  stdName: "Standard",
  bigName: "High stakes",
  stdInfo: "Regular games with a stake from 0.5 to 5 USDC. Good for your first games and for practice with real stakes.",
  bigInfo: (max: string) =>
    `Games with a big stake: from 5.5 to ${max} USDC (step 0.5). The prize is larger, and the upper limit is raised gradually as the contract proves itself.`,
};

export type LT = typeof RU;
/** Тексты разделов ставок в лобби: русский и английский (остальные языки показывают английский) */
export const useLT = (): LT => (useApp().lang === "ru" ? RU : EN);
