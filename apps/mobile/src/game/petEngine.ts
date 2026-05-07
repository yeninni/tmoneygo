import { calculateTransitExp } from './expCalculator';
import {
  getCurrentLevelExp,
  getLevelFromTotalExp,
  getLevelUpRewards,
  getRequiredExpForLevel,
} from './levelRules';
import type { PetExpApplyResult, TitiPetState, TransitRideInput } from './petTypes';

export function createInitialTitiPetState(userId: string): TitiPetState {
  const now = new Date().toISOString();

  return {
    userId,
    petId: `titi_${userId}`,
    name: '\uD2F0\uD2F0',
    level: 1,
    totalExp: 0,
    currentLevelExp: 0,
    expToNextLevel: getRequiredExpForLevel(1),
    mood: 'normal',
    equippedItems: {},
    ownedItemIds: [],
    visitedStationIds: [],
    updatedAt: now,
  };
}

export function normalizeTitiPetState(state: TitiPetState): TitiPetState {
  const levelState = getLevelFromTotalExp(state.totalExp);

  return {
    ...state,
    level: levelState.level,
    currentLevelExp: levelState.currentLevelExp,
    expToNextLevel: levelState.expToNextLevel,
  };
}

export function applyTransitRideToTiti(
  currentState: TitiPetState,
  ride: TransitRideInput,
): PetExpApplyResult {
  const previous = normalizeTitiPetState(currentState);
  const exp = calculateTransitExp(ride);
  const nextTotalExp = previous.totalExp + exp.totalGainedExp;
  const levelState = getLevelFromTotalExp(nextTotalExp);
  const rewards = getLevelUpRewards(previous.level, levelState.level);
  const ownedItemIds = Array.from(
    new Set([...previous.ownedItemIds, ...rewards.map((reward) => reward.itemId)]),
  );
  const visitedStationIds = Array.from(
    new Set([...previous.visitedStationIds, ride.fromStationId, ride.toStationId]),
  );
  const gainedLevels = levelState.level - previous.level;

  const next: TitiPetState = {
    ...previous,
    level: levelState.level,
    totalExp: nextTotalExp,
    currentLevelExp: getCurrentLevelExp(nextTotalExp, levelState.level),
    expToNextLevel: levelState.expToNextLevel,
    mood: gainedLevels > 0 ? 'excited' : 'happy',
    ownedItemIds,
    visitedStationIds,
    lastTransitAt: ride.endedAt,
    updatedAt: new Date().toISOString(),
  };

  return {
    previous,
    next,
    exp,
    leveledUp: gainedLevels > 0,
    gainedLevels,
    rewards,
  };
}
