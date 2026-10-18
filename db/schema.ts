import {
  bigint,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const oems = mysqlTable(
  "oems",
  {
    id: serial("id").primaryKey(),
    oemRef: varchar("oem_ref", { length: 64 }).notNull().unique(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    countryOfRegistration: varchar("country_of_registration", { length: 2 }).notNull().default("CN"),
    miitManufacturerId: varchar("miit_manufacturer_id", { length: 128 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    miitIdx: index("oems_miit_idx").on(table.miitManufacturerId),
  }),
);

export const batteryBlueprints = mysqlTable(
  "battery_blueprints",
  {
    id: serial("id").primaryKey(),
    oemId: bigint("oem_id", { mode: "number", unsigned: true }).notNull(),
    blueprintRef: varchar("blueprint_ref", { length: 96 }).notNull().unique(),
    category: mysqlEnum("category", ["EV", "ESS", "MICROMOBILITY", "POWER_TOOL", "CONSUMER_ELECTRONICS"]).notNull(),
    chemistryKey: varchar("chemistry_key", { length: 32 }).notNull(),
    chemistryMatrix: json("chemistry_matrix").notNull(),
    nominalPackKg: decimal("nominal_pack_kg", { precision: 10, scale: 2 }).notNull(),
    sourceHash: varchar("source_hash", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    oemIdx: index("blueprints_oem_idx").on(table.oemId),
    chemistryIdx: index("blueprints_chemistry_idx").on(table.chemistryKey),
  }),
);

export const exportManifests = mysqlTable(
  "export_manifests",
  {
    id: serial("id").primaryKey(),
    manifestNo: varchar("manifest_no", { length: 96 }).notNull().unique(),
    oemId: bigint("oem_id", { mode: "number", unsigned: true }).notNull(),
    blueprintId: bigint("blueprint_id", { mode: "number", unsigned: true }).notNull(),
    customsDeclarationId: varchar("customs_declaration_id", { length: 128 }).notNull(),
    exportedAt: timestamp("exported_at").notNull(),
    portOfLoading: varchar("port_of_loading", { length: 64 }).notNull(),
    destinationPort: varchar("destination_port", { length: 64 }).notNull(),
    units: int("units").notNull(),
    batteryKgPerUnit: decimal("battery_kg_per_unit", { precision: 10, scale: 2 }).notNull(),
    aiExtractionConfidence: decimal("ai_extraction_confidence", { precision: 4, scale: 3 }).notNull(),
  },
  (table) => ({
    oemIdx: index("manifests_oem_idx").on(table.oemId),
    exportedIdx: index("manifests_exported_idx").on(table.exportedAt),
  }),
);

export const eprLiabilities = mysqlTable(
  "epr_liabilities",
  {
    id: serial("id").primaryKey(),
    invoiceNo: varchar("invoice_no", { length: 96 }).notNull().unique(),
    manifestId: bigint("manifest_id", { mode: "number", unsigned: true }).notNull(),
    grossAud: decimal("gross_aud", { precision: 14, scale: 2 }).notNull(),
    offsetCapAud: decimal("offset_cap_aud", { precision: 14, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["INVOICED", "PARTIALLY_OFFSET", "CLEARED", "REVIEW"]).notNull(),
    invoicedAt: timestamp("invoiced_at").notNull().defaultNow(),
    clearedAt: timestamp("cleared_at"),
  },
  (table) => ({
    manifestIdx: index("liabilities_manifest_idx").on(table.manifestId),
    statusIdx: index("liabilities_status_idx").on(table.status),
  }),
);

export const edgeScanEvents = mysqlTable(
  "edge_scan_events",
  {
    id: serial("id").primaryKey(),
    eventRef: varchar("event_ref", { length: 96 }).notNull().unique(),
    scannedAt: timestamp("scanned_at").notNull(),
    actorOrg: varchar("actor_org", { length: 255 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
    serialOrVinHash: varchar("serial_or_vin_hash", { length: 128 }),
    casingImageHash: varchar("casing_image_hash", { length: 128 }).notNull(),
    chemistryGuess: varchar("chemistry_guess", { length: 32 }).notNull(),
    matchedBlueprintId: bigint("matched_blueprint_id", { mode: "number", unsigned: true }),
    estimatedKg: decimal("estimated_kg", { precision: 10, scale: 2 }).notNull(),
    sortStream: mysqlEnum("sort_stream", ["HYDRO_LFP", "HYDRO_NMC", "HYDRO_LCO", "MANUAL_QA"]).notNull(),
  },
  (table) => ({
    scannedIdx: index("edge_scans_scanned_idx").on(table.scannedAt),
    blueprintIdx: index("edge_scans_blueprint_idx").on(table.matchedBlueprintId),
  }),
);

export const legacyRecoveryEvents = mysqlTable(
  "legacy_recovery_events",
  {
    id: serial("id").primaryKey(),
    recoveryRef: varchar("recovery_ref", { length: 96 }).notNull().unique(),
    scanEventId: bigint("scan_event_id", { mode: "number", unsigned: true }).notNull(),
    processedAt: timestamp("processed_at").notNull(),
    facilityId: varchar("facility_id", { length: 64 }).notNull(),
    inputKg: decimal("input_kg", { precision: 12, scale: 2 }).notNull(),
    recoveredLiKg: decimal("recovered_li_kg", { precision: 12, scale: 3 }).notNull(),
    recoveredNiKg: decimal("recovered_ni_kg", { precision: 12, scale: 3 }).notNull().default("0"),
    recoveredCoKg: decimal("recovered_co_kg", { precision: 12, scale: 3 }).notNull().default("0"),
    creditLotId: varchar("credit_lot_id", { length: 96 }).notNull().unique(),
    assayHash: varchar("assay_hash", { length: 128 }).notNull(),
  },
  (table) => ({
    scanIdx: index("legacy_recovery_scan_idx").on(table.scanEventId),
    processedIdx: index("legacy_recovery_processed_idx").on(table.processedAt),
  }),
);

export const creditBids = mysqlTable(
  "credit_bids",
  {
    id: serial("id").primaryKey(),
    bidRef: varchar("bid_ref", { length: 96 }).notNull().unique(),
    oemId: bigint("oem_id", { mode: "number", unsigned: true }).notNull(),
    creditLotId: varchar("credit_lot_id", { length: 96 }).notNull(),
    bidAudPerKgLi: decimal("bid_aud_per_kg_li", { precision: 10, scale: 2 }).notNull(),
    requestedOffsetAud: decimal("requested_offset_aud", { precision: 14, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["OPEN", "AWARDED", "SETTLED", "EXPIRED"]).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    oemIdx: index("credit_bids_oem_idx").on(table.oemId),
    lotIdx: index("credit_bids_lot_idx").on(table.creditLotId),
    statusIdx: index("credit_bids_status_idx").on(table.status),
  }),
);

export const liabilityOffsets = mysqlTable(
  "liability_offsets",
  {
    id: serial("id").primaryKey(),
    liabilityId: bigint("liability_id", { mode: "number", unsigned: true }).notNull(),
    bidId: bigint("bid_id", { mode: "number", unsigned: true }).notNull(),
    recoveryEventId: bigint("recovery_event_id", { mode: "number", unsigned: true }).notNull(),
    offsetAud: decimal("offset_aud", { precision: 14, scale: 2 }).notNull(),
    legalInstrumentHash: varchar("legal_instrument_hash", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    liabilityIdx: index("offsets_liability_idx").on(table.liabilityId),
    bidIdx: index("offsets_bid_idx").on(table.bidId),
    recoveryIdx: index("offsets_recovery_idx").on(table.recoveryEventId),
  }),
);

export type Oem = typeof oems.$inferSelect;
export type BatteryBlueprint = typeof batteryBlueprints.$inferSelect;
export type ExportManifest = typeof exportManifests.$inferSelect;
export type EprLiability = typeof eprLiabilities.$inferSelect;
export type EdgeScanEvent = typeof edgeScanEvents.$inferSelect;
export type LegacyRecoveryEventRow = typeof legacyRecoveryEvents.$inferSelect;
export type CreditBidRow = typeof creditBids.$inferSelect;
export type LiabilityOffset = typeof liabilityOffsets.$inferSelect;
