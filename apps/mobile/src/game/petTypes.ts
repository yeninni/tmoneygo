export type TitiItemSlot = 'hat' | 'clothes' | 'accessory' | 'background';

export type TitiMood = 'happy' | 'normal' | 'sleepy' | 'excited';

export interface TitiItem {
  id: string;
  name: string;
  slot: TitiItemSlot;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAtLevel: number;
}

export type EquippedItems = Partial<Record<TitiItemSlot, TitiItem['id']>>;

export interface TitiPetState {
  userId: string;
  petId: string;
  name: '\uD2F0\uD2F0';
  level: number;
  totalExp: number;
  currentLevelExp: number;
  expToNextLevel: number;
  mood: TitiMood;
  equippedItems: EquippedItems;
  ownedItemIds: string[];
  visitedStationIds: string[];
  lastTransitAt?: string;
  updatedAt: string;
}

export interface TransitRideInput {
  rideId: string;
  userId: string;
  startedAt: string;
  endedAt: string;
  lineId?: string;
  fromStationId: string;
  toStationId: string;
  movedStationCount: number;
  hasTransfer: boolean;
  isNewStationVisit: boolean;
}

export interface ExpBreakdown {
  baseExp: number;
  stationExp: number;
  transferBonusExp: number;
  newStationBonusExp: number;
  totalGainedExp: number;
}

export interface LevelUpReward {
  level: number;
  itemId: string;
  reason: 'level_up';
}

export interface PetExpApplyResult {
  previous: TitiPetState;
  next: TitiPetState;
  exp: ExpBreakdown;
  leveledUp: boolean;
  gainedLevels: number;
  rewards: LevelUpReward[];
}
