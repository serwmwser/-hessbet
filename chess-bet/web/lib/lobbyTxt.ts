import { useApp } from "./ctx";

const RU = {
  stdName: "Стандарт",
  bigName: "Крупные",
  stdInfo: "Обычные партии со ставкой от 0.5 до 5 USDC. Подходят для первых игр и для тренировки на реальных ставках.",
  bigInfo: (max: string) =>
    `Партии с большой ставкой: от 5.5 до ${max} USDC (шаг 0.5). Приз больше, а верхний лимит поднимается постепенно, по мере проверки работы контракта.`,
  switchHint: "Разделы переключаются кнопками выше: выберите «Стандарт» или «Крупные», затем ставку ползунком или быстрой кнопкой.",
  quickStd: "Быстрые ставки раздела «Стандарт»: 0.5, 1, 2.5 и 5 USDC.",
  quickBig: (max: string) => `Быстрые ставки раздела «Крупные»: от 5.5 до ${max} USDC. Остальные суммы с шагом 0.5 выбирайте ползунком.`,
};

const EN: typeof RU = {
  stdName: "Standard",
  bigName: "High stakes",
  stdInfo: "Regular games with a stake from 0.5 to 5 USDC. Good for your first games and for practice with real stakes.",
  bigInfo: (max: string) =>
    `Games with a big stake: from 5.5 to ${max} USDC (step 0.5). The prize is larger, and the upper limit is raised gradually as the contract proves itself.`,
  switchHint: "Switch sections with the buttons above: pick Standard or High stakes, then choose a stake with the slider or a quick button.",
  quickStd: "Quick stakes of the Standard section: 0.5, 1, 2.5 and 5 USDC.",
  quickBig: (max: string) => `Quick stakes of the High stakes section: from 5.5 to ${max} USDC. Use the slider for other amounts in steps of 0.5.`,
};

export type LT = typeof RU;
/** Тексты разделов ставок в лобби: русский и английский (остальные языки показывают английский) */
export const useLT = (): LT => (useApp().lang === "ru" ? RU : EN);