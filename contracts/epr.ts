export type ProductCategory = "EV" | "ESS" | "MICROMOBILITY" | "POWER_TOOL" | "CONSUMER_ELECTRONICS";

export type ChemistryKey = "LFP" | "NMC_811" | "NMC_622" | "NCA" | "LCO";

export type ElementSymbol = "Li" | "Ni" | "Co" | "Mn" | "P" | "Fe";

export type ChemistryProfile = Record<ElementSymbol, number>;

export interface LiabilityInput {
  manifestId: string;
  oemId: string;
  category: ProductCategory;
  chemistry: ChemistryKey;
  units: number;
  batteryKgPerUnit: number;
  extractionConfidence: number;
  legacyCreditRatio: number;
}

export interface MaterialMass {
  element: ElementSymbol;
  fraction: number;
  massKg: number;
  levyRateAudPerKg: number;
  levyAud: number;
}

export interface LiabilityResult {
  invoiceId: string;
  manifestId: string;
  oemId: string;
  category: ProductCategory;
  chemistry: ChemistryKey;
  units: number;
  batteryKgPerUnit: number;
  totalBatteryKg: number;
  extractionConfidence: number;
  materialMasses: MaterialMass[];
  baseFeeAud: number;
  chemistryLevyAud: number;
  categoryMultiplier: number;
  confidenceMultiplier: number;
  logisticsReserveAud: number;
  grossLiabilityAud: number;
  maxLegacyOffsetAud: number;
  netCashDueAud: number;
  creditRequirementKg: number;
  dayOneStatus: "INVOICED" | "REVIEW";
}

export const ELEMENTS: ElementSymbol[] = ["Li", "Ni", "Co", "Mn", "P", "Fe"];

export const CHEMISTRY_PROFILES: Record<ChemistryKey, ChemistryProfile> = {
  LFP: { Li: 0.046, Ni: 0, Co: 0, Mn: 0, P: 0.169, Fe: 0.333 },
  NMC_811: { Li: 0.072, Ni: 0.488, Co: 0.061, Mn: 0.061, P: 0, Fe: 0 },
  NMC_622: { Li: 0.075, Ni: 0.372, Co: 0.124, Mn: 0.124, P: 0, Fe: 0 },
  NCA: { Li: 0.071, Ni: 0.515, Co: 0.098, Mn: 0.026, P: 0, Fe: 0 },
  LCO: { Li: 0.071, Ni: 0, Co: 0.604, Mn: 0, P: 0, Fe: 0 },
};

export const CATEGORY_MULTIPLIERS: Record<ProductCategory, number> = {
  EV: 1.18,
  ESS: 1.12,
  MICROMOBILITY: 1.04,
  POWER_TOOL: 1,
  CONSUMER_ELECTRONICS: 0.92,
};

export const ELEMENT_LEVY_RATES_AUD_PER_KG: Record<ElementSymbol, number> = {
  Li: 7.5,
  Ni: 2.4,
  Co: 9.8,
  Mn: 0.9,
  P: 0.35,
  Fe: 0.12,
};

export const BASE_COLLECTION_RATE_AUD_PER_KG = 2.35;
export const LOGISTICS_RESERVE_RATE = 0.14;

const round2 = (value: number) => Math.round(value * 100) / 100;
const round4 = (value: number) => Math.round(value * 10000) / 10000;

export function calculateEprLiability(input: LiabilityInput): LiabilityResult {
  const profile = CHEMISTRY_PROFILES[input.chemistry];
  const totalBatteryKg = input.units * input.batteryKgPerUnit;
  const materialMasses = ELEMENTS.map((element) => {
    const fraction = profile[element];
    const massKg = totalBatteryKg * fraction;
    const levyRateAudPerKg = ELEMENT_LEVY_RATES_AUD_PER_KG[element];
    return {
      element,
      fraction: round4(fraction),
      massKg: round2(massKg),
      levyRateAudPerKg,
      levyAud: round2(massKg * levyRateAudPerKg),
    };
  });

  const baseFeeAud = totalBatteryKg * BASE_COLLECTION_RATE_AUD_PER_KG;
  const chemistryLevyAud = materialMasses.reduce((sum, row) => sum + row.levyAud, 0);
  const categoryMultiplier = CATEGORY_MULTIPLIERS[input.category];
  const confidenceMultiplier = input.extractionConfidence >= 0.9 ? 1 : input.extractionConfidence >= 0.75 ? 1.08 : 1.22;
  const subtotal = (baseFeeAud + chemistryLevyAud) * categoryMultiplier * confidenceMultiplier;
  const logisticsReserveAud = subtotal * LOGISTICS_RESERVE_RATE;
  const grossLiabilityAud = subtotal + logisticsReserveAud;
  const maxLegacyOffsetAud = grossLiabilityAud * Math.min(Math.max(input.legacyCreditRatio, 0), 0.85);
  const recoveredLiKg = materialMasses.find((row) => row.element === "Li")?.massKg ?? 0;
  const creditRequirementKg = Math.max(recoveredLiKg * 6.4, totalBatteryKg * 0.32);

  return {
    invoiceId: `AUEPR-${input.manifestId.slice(-6).toUpperCase()}-${input.oemId.slice(-4).toUpperCase()}`,
    manifestId: input.manifestId,
    oemId: input.oemId,
    category: input.category,
    chemistry: input.chemistry,
    units: input.units,
    batteryKgPerUnit: input.batteryKgPerUnit,
    totalBatteryKg: round2(totalBatteryKg),
    extractionConfidence: input.extractionConfidence,
    materialMasses,
    baseFeeAud: round2(baseFeeAud),
    chemistryLevyAud: round2(chemistryLevyAud),
    categoryMultiplier,
    confidenceMultiplier,
    logisticsReserveAud: round2(logisticsReserveAud),
    grossLiabilityAud: round2(grossLiabilityAud),
    maxLegacyOffsetAud: round2(maxLegacyOffsetAud),
    netCashDueAud: round2(grossLiabilityAud - maxLegacyOffsetAud),
    creditRequirementKg: round2(creditRequirementKg),
    dayOneStatus: input.extractionConfidence >= 0.75 ? "INVOICED" : "REVIEW",
  };
}

export const DEFAULT_LIABILITY_INPUT: LiabilityInput = {
  manifestId: "CNX-2026-10-884211",
  oemId: "CATL-SZ-0091",
  category: "EV",
  chemistry: "NMC_811",
  units: 480,
  batteryKgPerUnit: 312,
  extractionConfidence: 0.94,
  legacyCreditRatio: 0.62,
};

export interface LegacyRecoveryEvent {
  eventId: string;
  scannedAt: string;
  suburb: string;
  state: string;
  chemistryGuess: ChemistryKey;
  matchedManifestId: string | null;
  weightKg: number;
  recoveredLiKg: number;
  creditLotId: string;
}

export interface CreditBid {
  bidId: string;
  oemId: string;
  creditLotId: string;
  bidAudPerKgLi: number;
  requestedOffsetAud: number;
  status: "OPEN" | "AWARDED" | "SETTLED";
}

export const SAMPLE_LEGACY_EVENTS: LegacyRecoveryEvent[] = [
  {
    eventId: "AU-EDGE-8841",
    scannedAt: "2026-10-16T09:24:00+10:00",
    suburb: "Wetherill Park",
    state: "NSW",
    chemistryGuess: "NMC_622",
    matchedManifestId: null,
    weightKg: 1840,
    recoveredLiKg: 131.2,
    creditLotId: "LOT-NSW-041",
  },
  {
    eventId: "AU-EDGE-8842",
    scannedAt: "2026-10-16T10:11:00+10:00",
    suburb: "Dandenong South",
    state: "VIC",
    chemistryGuess: "LFP",
    matchedManifestId: null,
    weightKg: 2285,
    recoveredLiKg: 105.1,
    creditLotId: "LOT-VIC-018",
  },
  {
    eventId: "AU-EDGE-8843",
    scannedAt: "2026-10-16T11:03:00+10:00",
    suburb: "Canning Vale",
    state: "WA",
    chemistryGuess: "LCO",
    matchedManifestId: null,
    weightKg: 690,
    recoveredLiKg: 48.9,
    creditLotId: "LOT-WA-009",
  },
];

export const SAMPLE_BIDS: CreditBid[] = [
  {
    bidId: "BID-1001",
    oemId: "CATL-SZ-0091",
    creditLotId: "LOT-NSW-041",
    bidAudPerKgLi: 96,
    requestedOffsetAud: 11800,
    status: "AWARDED",
  },
  {
    bidId: "BID-1002",
    oemId: "BYD-SZ-1140",
    creditLotId: "LOT-VIC-018",
    bidAudPerKgLi: 88,
    requestedOffsetAud: 9250,
    status: "OPEN",
  },
  {
    bidId: "BID-1003",
    oemId: "TTI-DG-2210",
    creditLotId: "LOT-WA-009",
    bidAudPerKgLi: 122,
    requestedOffsetAud: 5600,
    status: "SETTLED",
  },
];
