export type Department = {
  name: string;
  headcount: number;
  revenueTarget: number; // 万円（年間）
};

/**
 * 部門マスタ
 * headcount: 部門人数
 * revenueTarget: 年間売上目標（万円）
 */
export const DEPARTMENTS: Department[] = [
  { name: "アカウント事業本部", headcount: 25, revenueTarget: 80000 },
  { name: "リテール事業本部", headcount: 24, revenueTarget: 65000 },
  { name: "ウェルフェア事業部", headcount: 6, revenueTarget: 48000 },
  { name: "岩手事業部", headcount: 3, revenueTarget: 35000 },
  { name: "アート事業部", headcount: 5, revenueTarget: 32000 },
  { name: "海外事業部", headcount: 6, revenueTarget: 0 },
  { name: "広報室", headcount: 6, revenueTarget: 0 },
  { name: "ブランディング室", headcount: 2, revenueTarget: 0 },
  { name: "経営管理部", headcount: 3, revenueTarget: 0 },
  { name: "組織デザイン部", headcount: 4, revenueTarget: 0 },
  { name: "法務部", headcount: 2, revenueTarget: 0 },
  { name: "経営", headcount: 5, revenueTarget: 0 },
];

/** 全社の従業員数 */
export const TOTAL_HEADCOUNT = DEPARTMENTS.reduce(
  (s, d) => s + d.headcount,
  0,
);

/** 全社の売上目標（万円） */
export const TOTAL_REVENUE_TARGET = DEPARTMENTS.reduce(
  (s, d) => s + d.revenueTarget,
  0,
);

/** 1人あたり月間労働時間（分） */
export const MONTHLY_WORK_MINUTES = 160 * 60; // 160h

/** 年間営業日 */
export const ANNUAL_WORK_DAYS = 245;

/** 1人あたり年間労働時間（分） */
export const ANNUAL_WORK_MINUTES = ANNUAL_WORK_DAYS * 8 * 60;

/** 部門を名前で取得 */
export function getDepartment(name: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.name === name);
}
