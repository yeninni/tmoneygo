import type { LevelUpReward } from './petTypes';

export const MAX_TITI_LEVEL = 30;

export const LEVEL_UP_REWARD_ITEMS: Record<number, string> = {
  2: 'item_leaf_hat',
  3: 'item_blue_scarf',
  5: 'item_tmoney_bag',
  8: 'item_raincoat',
  10: 'item_subway_room',
  15: 'item_star_glasses',
  20: 'item_captain_uniform',
  30: 'item_gold_tmoney_card',
};

export function getRequiredExpForLevel(level: number): number {
  if (level >= MAX_TITI_LEVEL) {
    return 0;
  }

  return 80 + level * 40 + Math.floor(Math.pow(level, 1.35) * 12);
}

export function getCurrentLevelExp(totalExp: number, level: number): number {
  let remainingExp = totalExp;

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    remainingExp -= getRequiredExpForLevel(currentLevel);
  }

  return Math.max(0, remainingExp);
}

export function getLevelFromTotalExp(totalExp: number): {
  level: number;
  currentLevelExp: number;
  expToNextLevel: number;
} {
  let level = 1;
  let remainingExp = Math.max(0, totalExp);

  while (level < MAX_TITI_LEVEL) {
    const requiredExp = getRequiredExpForLevel(level);

    if (remainingExp < requiredExp) {
      return {
        level,
        currentLevelExp: remainingExp,
        expToNextLevel: requiredExp - remainingExp,
      };
    }

    remainingExp -= requiredExp;
    level += 1;
  }

  return {
    level: MAX_TITI_LEVEL,
    currentLevelExp: 0,
    expToNextLevel: 0,
  };
}

export function getLevelUpRewards(fromLevel: number, toLevel: number): LevelUpReward[] {
  const rewards: LevelUpReward[] = [];

  for (let level = fromLevel + 1; level <= toLevel; level += 1) {
    const itemId = LEVEL_UP_REWARD_ITEMS[level];

    if (itemId) {
      rewards.push({
        level,
        itemId,
        reason: 'level_up',
      });
    }
  }

  return rewards;
}
