import { calculateTransitExp } from './expCalculator';
import {
  getCurrentLevelExp,
  getLevelFromTotalExp,
  getLevelUpRewards,
  getRequiredExpForLevel,
} from './levelRules';
import type {
  ChallengeReward,
  ExpBreakdown,
  PetExpApplyResult,
  TitiPetState,
  TransitRideInput,
} from './petTypes';
import { getNewlyCompletedChallenges } from './stationChallenges';

const STREAK_BONUS_EXP_PER_DAY = 3;
const MAX_STREAK_BONUS_EXP = 90;

function toDateString(isoString: string): string {
  return isoString.slice(0, 10);
}

function calcNewStreak(
  lastTransitDate: string | undefined,
  rideDate: string,
  currentStreak: number,
): number {
  if (!lastTransitDate) return 1;

  const diffDays = Math.round(
    (new Date(rideDate).getTime() - new Date(lastTransitDate).getTime()) / 86400000,
  );

  if (diffDays <= 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

function calcStreakBonusExp(streakDays: number): number {
  return Math.min((streakDays - 1) * STREAK_BONUS_EXP_PER_DAY, MAX_STREAK_BONUS_EXP);
}

export function createInitialTitiPetState(userId: string): TitiPetState {
  const now = new Date().toISOString();

  return {
    userId,
    petId: `titi_${userId}`,
    name: '티티',
    level: 1,
    totalExp: 0,
    currentLevelExp: 0,
    expToNextLevel: getRequiredExpForLevel(1),
    mood: 'normal',
    equippedItems: {},
    ownedItemIds: [],
    visitedStationIds: [],
    streakDays: 0,
    completedChallengeIds: [],
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

export interface RideHistoryResult {
  finalState: TitiPetState;
  totalExpGained: number;
  levelUps: number[];
  ridesProcessed: number;
}

export function applyRideHistory(
  initialState: TitiPetState,
  rides: TransitRideInput[],
): RideHistoryResult {
  let state = initialState;
  let totalExpGained = 0;
  const levelUps: number[] = [];

  for (const ride of rides) {
    const result = applyTransitRideToTiti(state, ride);
    if (result.leveledUp) {
      for (let l = state.level + 1; l <= result.next.level; l++) {
        levelUps.push(l);
      }
    }
    totalExpGained += result.exp.totalGainedExp;
    state = result.next;
  }

  return {
    finalState: state,
    totalExpGained,
    levelUps,
    ridesProcessed: rides.length,
  };
}

export function applyTransitRideToTiti(
  currentState: TitiPetState,
  ride: TransitRideInput,
): PetExpApplyResult {
  const previous = normalizeTitiPetState(currentState);

  const rideDate = toDateString(ride.endedAt);
  const newStreakDays = calcNewStreak(previous.lastTransitDate, rideDate, previous.streakDays);
  const streakBonusExp = calcStreakBonusExp(newStreakDays);

  const rideExp = calculateTransitExp(ride);
  const exp: ExpBreakdown = {
    baseExp: rideExp.baseExp,
    stationExp: rideExp.stationExp,
    transferBonusExp: rideExp.transferBonusExp,
    newStationBonusExp: rideExp.newStationBonusExp,
    offPeakBonusExp: rideExp.offPeakBonusExp,
    streakBonusExp,
    totalGainedExp: rideExp.rideTotal + streakBonusExp,
  };

  const nextTotalExp = previous.totalExp + exp.totalGainedExp;
  const levelState = getLevelFromTotalExp(nextTotalExp);
  const rewards = getLevelUpRewards(previous.level, levelState.level);

  const visitedStationIds = Array.from(
    new Set([...previous.visitedStationIds, ride.fromStationId, ride.toStationId]),
  );

  const newChallenges = getNewlyCompletedChallenges(visitedStationIds, previous.completedChallengeIds);
  const challengeRewards: ChallengeReward[] = newChallenges.map((c) => ({
    challengeId: c.id,
    challengeName: c.name,
    itemId: c.rewardItemId,
    reason: 'challenge_complete',
  }));

  const completedChallengeIds = [
    ...previous.completedChallengeIds,
    ...newChallenges.map((c) => c.id),
  ];

  const ownedItemIds = Array.from(
    new Set([
      ...previous.ownedItemIds,
      ...rewards.map((r) => r.itemId),
      ...challengeRewards.map((r) => r.itemId),
    ]),
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
    streakDays: newStreakDays,
    lastTransitDate: rideDate,
    completedChallengeIds,
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
    challengeRewards,
  };
}
