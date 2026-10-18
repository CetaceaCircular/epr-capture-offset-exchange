export const MERMAID_DATA_FLOW = `flowchart LR
  subgraph CN[China manufacturing and export]
    A[MIIT battery ID registry\nfactory / OEM digital ID] --> B[AI extraction worker\nOCR + schema normalisation]
    C[China Customs export manifest\nHS line, gross mass, consignee] --> B
    D[Manufacturing BOM registry\ncathode chemistry matrix] --> B
    B --> E[(EPR Ledger\ncanonical battery blueprint)]
  end

  subgraph AU[Australian import and in-market life]
    F[AU import manifest\nDay 1 liability trigger] --> G[Dynamic EPR invoice\nweight x chemistry x category]
    E --> F
    E --> H[Edge CV scan app\nserial / casing / barcode]
    H --> I[Geolocation + sort stream\nLFP / NMC / LCO / QA]
    I --> J[Closed-loop hydromet facility\nLi2CO3 / FePO4 / NMC precursor]
  end

  subgraph X[New-Pays-for-Old offset exchange]
    J --> K[Assay verified recovery event\nlegacy Australian stock]
    K --> L[Historical Recovery Credit lot\nkg Li-equivalent + audit hash]
    M[Chinese OEM bid desk\nCATL / BYD / tool OEMs] --> N[Bid matching engine]
    L --> N
    G --> N
    N --> O[Liability offset settlement\nlegal instrument hash]
    O --> P[Import liability cleared\nnew shipment released]
  end

  G --> Q[Net cash due]
  O --> R[Immutable audit trail\ncredit provenance + no double count]`;

export const PYTHON_MOCK_SCRIPT = `from dataclasses import dataclass
from typing import Dict, Literal

Element = Literal["Li", "Ni", "Co", "Mn", "P", "Fe"]
Category = Literal["EV", "ESS", "MICROMOBILITY", "POWER_TOOL", "CONSUMER_ELECTRONICS"]
Chemistry = Literal["LFP", "NMC_811", "NMC_622", "NCA", "LCO"]

CHEMISTRY_MATRIX: Dict[Chemistry, Dict[Element, float]] = {
    "LFP":      {"Li": 0.046, "Ni": 0.000, "Co": 0.000, "Mn": 0.000, "P": 0.169, "Fe": 0.333},
    "NMC_811":  {"Li": 0.072, "Ni": 0.488, "Co": 0.061, "Mn": 0.061, "P": 0.000, "Fe": 0.000},
    "NMC_622":  {"Li": 0.075, "Ni": 0.372, "Co": 0.124, "Mn": 0.124, "P": 0.000, "Fe": 0.000},
    "NCA":      {"Li": 0.071, "Ni": 0.515, "Co": 0.098, "Mn": 0.026, "P": 0.000, "Fe": 0.000},
    "LCO":      {"Li": 0.071, "Ni": 0.000, "Co": 0.604, "Mn": 0.000, "P": 0.000, "Fe": 0.000},
}

CATEGORY_MULTIPLIER: Dict[Category, float] = {
    "EV": 1.18,
    "ESS": 1.12,
    "MICROMOBILITY": 1.04,
    "POWER_TOOL": 1.00,
    "CONSUMER_ELECTRONICS": 0.92,
}

LEVY_AUD_PER_KG: Dict[Element, float] = {
    "Li": 7.50, "Ni": 2.40, "Co": 9.80, "Mn": 0.90, "P": 0.35, "Fe": 0.12,
}
BASE_AUD_PER_KG = 2.35
LOGISTICS_RESERVE = 0.14

@dataclass
class ManifestLine:
    manifest_id: str
    oem_id: str
    category: Category
    chemistry: Chemistry
    units: int
    battery_kg_per_unit: float
    extraction_confidence: float
    legacy_credit_ratio: float = 0.62

def calculate_day_one_liability(line: ManifestLine) -> dict:
    total_kg = line.units * line.battery_kg_per_unit
    matrix = CHEMISTRY_MATRIX[line.chemistry]
    masses = {el: round(total_kg * frac, 2) for el, frac in matrix.items()}
    base_fee = total_kg * BASE_AUD_PER_KG
    chemistry_levy = sum(masses[el] * LEVY_AUD_PER_KG[el] for el in masses)
    confidence_multiplier = 1.0 if line.extraction_confidence >= 0.90 else 1.08 if line.extraction_confidence >= 0.75 else 1.22
    subtotal = (base_fee + chemistry_levy) * CATEGORY_MULTIPLIER[line.category] * confidence_multiplier
    reserve = subtotal * LOGISTICS_RESERVE
    gross = subtotal + reserve
    offset_cap = gross * min(line.legacy_credit_ratio, 0.85)
    return {
        "invoice_id": f"AUEPR-{line.manifest_id[-6:].upper()}-{line.oem_id[-4:].upper()}",
        "total_battery_kg": round(total_kg, 2),
        "material_mass_kg": masses,
        "base_fee_aud": round(base_fee, 2),
        "chemistry_levy_aud": round(chemistry_levy, 2),
        "gross_liability_aud": round(gross, 2),
        "max_legacy_offset_aud": round(offset_cap, 2),
        "net_cash_due_aud": round(gross - offset_cap, 2),
        "status": "INVOICED" if line.extraction_confidence >= 0.75 else "REVIEW",
    }

if __name__ == "__main__":
    sample = ManifestLine(
        manifest_id="CNX-2026-10-884211",
        oem_id="CATL-SZ-0091",
        category="EV",
        chemistry="NMC_811",
        units=480,
        battery_kg_per_unit=312,
        extraction_confidence=0.94,
    )
    print(calculate_day_one_liability(sample))`;

export const SQL_SCHEMA_MOCK = `CREATE TABLE oems (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  oem_ref VARCHAR(64) NOT NULL UNIQUE,
  legal_name VARCHAR(255) NOT NULL,
  country_of_registration CHAR(2) NOT NULL DEFAULT 'CN',
  miit_manufacturer_id VARCHAR(128)
);

CREATE TABLE battery_blueprints (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  oem_id BIGINT UNSIGNED NOT NULL,
  blueprint_ref VARCHAR(96) NOT NULL UNIQUE,
  category ENUM('EV','ESS','MICROMOBILITY','POWER_TOOL','CONSUMER_ELECTRONICS') NOT NULL,
  chemistry_key VARCHAR(32) NOT NULL,
  chemistry_matrix JSON NOT NULL,
  nominal_pack_kg DECIMAL(10,2) NOT NULL,
  source_hash VARCHAR(128) NOT NULL,
  FOREIGN KEY (oem_id) REFERENCES oems(id)
);

CREATE TABLE export_manifests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  manifest_no VARCHAR(96) NOT NULL UNIQUE,
  oem_id BIGINT UNSIGNED NOT NULL,
  blueprint_id BIGINT UNSIGNED NOT NULL,
  customs_declaration_id VARCHAR(128) NOT NULL,
  exported_at TIMESTAMP NOT NULL,
  destination_port VARCHAR(64) NOT NULL,
  units INT NOT NULL,
  battery_kg_per_unit DECIMAL(10,2) NOT NULL,
  ai_extraction_confidence DECIMAL(4,3) NOT NULL,
  FOREIGN KEY (oem_id) REFERENCES oems(id),
  FOREIGN KEY (blueprint_id) REFERENCES battery_blueprints(id)
);

CREATE TABLE epr_liabilities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(96) NOT NULL UNIQUE,
  manifest_id BIGINT UNSIGNED NOT NULL,
  gross_aud DECIMAL(14,2) NOT NULL,
  offset_cap_aud DECIMAL(14,2) NOT NULL,
  status ENUM('INVOICED','PARTIALLY_OFFSET','CLEARED','REVIEW') NOT NULL,
  invoiced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cleared_at TIMESTAMP NULL,
  FOREIGN KEY (manifest_id) REFERENCES export_manifests(id)
);

CREATE TABLE edge_scan_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_ref VARCHAR(96) NOT NULL UNIQUE,
  scanned_at TIMESTAMP NOT NULL,
  actor_org VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  casing_image_hash VARCHAR(128) NOT NULL,
  chemistry_guess VARCHAR(32) NOT NULL,
  matched_blueprint_id BIGINT UNSIGNED NULL,
  estimated_kg DECIMAL(10,2) NOT NULL,
  sort_stream ENUM('HYDRO_LFP','HYDRO_NMC','HYDRO_LCO','MANUAL_QA') NOT NULL,
  FOREIGN KEY (matched_blueprint_id) REFERENCES battery_blueprints(id)
);

CREATE TABLE legacy_recovery_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recovery_ref VARCHAR(96) NOT NULL UNIQUE,
  scan_event_id BIGINT UNSIGNED NOT NULL,
  processed_at TIMESTAMP NOT NULL,
  facility_id VARCHAR(64) NOT NULL,
  input_kg DECIMAL(12,2) NOT NULL,
  recovered_li_kg DECIMAL(12,3) NOT NULL,
  credit_lot_id VARCHAR(96) NOT NULL UNIQUE,
  assay_hash VARCHAR(128) NOT NULL,
  FOREIGN KEY (scan_event_id) REFERENCES edge_scan_events(id)
);

CREATE TABLE credit_bids (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bid_ref VARCHAR(96) NOT NULL UNIQUE,
  oem_id BIGINT UNSIGNED NOT NULL,
  credit_lot_id VARCHAR(96) NOT NULL,
  bid_aud_per_kg_li DECIMAL(10,2) NOT NULL,
  requested_offset_aud DECIMAL(14,2) NOT NULL,
  status ENUM('OPEN','AWARDED','SETTLED','EXPIRED') NOT NULL,
  FOREIGN KEY (oem_id) REFERENCES oems(id)
);

CREATE TABLE liability_offsets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  liability_id BIGINT UNSIGNED NOT NULL,
  bid_id BIGINT UNSIGNED NOT NULL,
  recovery_event_id BIGINT UNSIGNED NOT NULL,
  offset_aud DECIMAL(14,2) NOT NULL,
  legal_instrument_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (liability_id) REFERENCES epr_liabilities(id),
  FOREIGN KEY (bid_id) REFERENCES credit_bids(id),
  FOREIGN KEY (recovery_event_id) REFERENCES legacy_recovery_events(id)
);`;
