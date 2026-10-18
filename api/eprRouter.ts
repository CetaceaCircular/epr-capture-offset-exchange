import { z } from "zod";
import {
  calculateEprLiability,
  DEFAULT_LIABILITY_INPUT,
  SAMPLE_BIDS,
  SAMPLE_LEGACY_EVENTS,
} from "@contracts/epr";
import { createRouter, publicQuery } from "./middleware";

const liabilityInputSchema = z.object({
  manifestId: z.string().min(4),
  oemId: z.string().min(3),
  category: z.enum(["EV", "ESS", "MICROMOBILITY", "POWER_TOOL", "CONSUMER_ELECTRONICS"]),
  chemistry: z.enum(["LFP", "NMC_811", "NMC_622", "NCA", "LCO"]),
  units: z.number().int().positive().max(1_000_000),
  batteryKgPerUnit: z.number().positive().max(10_000),
  extractionConfidence: z.number().min(0).max(1),
  legacyCreditRatio: z.number().min(0).max(0.85),
});

export const eprRouter = createRouter({
  calculateLiability: publicQuery.input(liabilityInputSchema).mutation(({ input }) => {
    return calculateEprLiability(input);
  }),
  blueprintDefaults: publicQuery.query(() => ({
    input: DEFAULT_LIABILITY_INPUT,
    legacyEvents: SAMPLE_LEGACY_EVENTS,
    bids: SAMPLE_BIDS,
  })),
});
