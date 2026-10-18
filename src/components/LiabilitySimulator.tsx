import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  CHEMISTRY_PROFILES,
  DEFAULT_LIABILITY_INPUT,
  calculateEprLiability,
  type ChemistryKey,
  type LiabilityInput,
  type ProductCategory,
} from "@contracts/epr";
import { Download, RotateCcw } from "lucide-react";

const categories: ProductCategory[] = ["EV", "ESS", "MICROMOBILITY", "POWER_TOOL", "CONSUMER_ELECTRONICS"];
const chemistries = Object.keys(CHEMISTRY_PROFILES) as ChemistryKey[];

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-AU", { maximumFractionDigits: 1 });

function downloadJson(payload: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LiabilitySimulator() {
  const [input, setInput] = useState<LiabilityInput>(DEFAULT_LIABILITY_INPUT);
  const result = useMemo(() => calculateEprLiability(input), [input]);
  const maxMass = Math.max(...result.materialMasses.map((row) => row.massKg), 1);

  const update = <K extends keyof LiabilityInput>(key: K, value: LiabilityInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="simulator-grid">
      <div className="panel simulator-controls">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Layer 1 / EPR Ledger</p>
            <h3>Day 1 liability engine</h3>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary">
            {result.dayOneStatus}
          </Badge>
        </div>

        <div className="field-grid">
          <div className="space-y-2">
            <Label htmlFor="manifestId">Export manifest ID</Label>
            <Input
              id="manifestId"
              value={input.manifestId}
              onChange={(event) => update("manifestId", event.target.value)}
              className="min-h-11 bg-background/60 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oemId">Factory / OEM digital ID</Label>
            <Input
              id="oemId"
              value={input.oemId}
              onChange={(event) => update("oemId", event.target.value)}
              className="min-h-11 bg-background/60 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Product asset class</Label>
            <Select value={input.category} onValueChange={(value) => update("category", value as ProductCategory)}>
              <SelectTrigger className="min-h-11 w-full bg-background/60 data-[size=default]:h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Chemistry blueprint</Label>
            <Select value={input.chemistry} onValueChange={(value) => update("chemistry", value as ChemistryKey)}>
              <SelectTrigger className="min-h-11 w-full bg-background/60 data-[size=default]:h-11">
                <SelectValue placeholder="Select chemistry" />
              </SelectTrigger>
              <SelectContent>
                {chemistries.map((chemistry) => (
                  <SelectItem key={chemistry} value={chemistry}>
                    {chemistry.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="slider-stack">
          <div className="slider-row">
            <div>
              <Label>Units on manifest</Label>
              <span>{number.format(input.units)} units</span>
            </div>
            <Slider
              className="min-h-11"
              value={[input.units]}
              min={1}
              max={5000}
              step={1}
              onValueChange={([value]) => update("units", value)}
              aria-label="Units on manifest"
            />
          </div>
          <div className="slider-row">
            <div>
              <Label>Battery kg per unit</Label>
              <span>{number.format(input.batteryKgPerUnit)} kg</span>
            </div>
            <Slider
              className="min-h-11"
              value={[input.batteryKgPerUnit]}
              min={0.2}
              max={900}
              step={0.2}
              onValueChange={([value]) => update("batteryKgPerUnit", value)}
              aria-label="Battery kilograms per unit"
            />
          </div>
          <div className="slider-row">
            <div>
              <Label>AI extraction confidence</Label>
              <span>{Math.round(input.extractionConfidence * 100)}%</span>
            </div>
            <Slider
              className="min-h-11"
              value={[input.extractionConfidence]}
              min={0.5}
              max={1}
              step={0.01}
              onValueChange={([value]) => update("extractionConfidence", value)}
              aria-label="AI extraction confidence"
            />
          </div>
          <div className="slider-row">
            <div>
              <Label>Legacy offset cap</Label>
              <span>{Math.round(input.legacyCreditRatio * 100)}% of invoice</span>
            </div>
            <Slider
              className="min-h-11"
              value={[input.legacyCreditRatio]}
              min={0}
              max={0.85}
              step={0.01}
              onValueChange={([value]) => update("legacyCreditRatio", value)}
              aria-label="Legacy offset cap"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            className="min-h-11 flex-1"
            onClick={() => downloadJson({ input, result }, "day-one-epr-liability.json")}
          >
            <Download className="size-4" />
            Download invoice JSON
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => setInput(DEFAULT_LIABILITY_INPUT)}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="panel invoice-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Australian EPR liability invoice</p>
            <h3 className="font-mono text-primary">{result.invoiceId}</h3>
          </div>
          <span className="terminal-chip">Day 1</span>
        </div>

        <div className="invoice-total">
          <span>Gross liability</span>
          <strong>{money.format(result.grossLiabilityAud)}</strong>
        </div>

        <div className="invoice-lines">
          <div>
            <span>Total battery mass</span>
            <b>{number.format(result.totalBatteryKg)} kg</b>
          </div>
          <div>
            <span>Base collection fee</span>
            <b>{money.format(result.baseFeeAud)}</b>
          </div>
          <div>
            <span>Chemistry levy</span>
            <b>{money.format(result.chemistryLevyAud)}</b>
          </div>
          <div>
            <span>Logistics reserve</span>
            <b>{money.format(result.logisticsReserveAud)}</b>
          </div>
          <div>
            <span>Max legacy offset</span>
            <b className="text-primary">-{money.format(result.maxLegacyOffsetAud)}</b>
          </div>
          <div className="net-line">
            <span>Net cash due if bid clears</span>
            <b>{money.format(result.netCashDueAud)}</b>
          </div>
        </div>

        <div className="material-stack">
          <div className="material-stack__header">
            <span>Extracted chemistry matrix</span>
            <span>{number.format(result.creditRequirementKg)} kg legacy credit target</span>
          </div>
          {result.materialMasses.map((row) => (
            <div className="material-row" key={row.element}>
              <span className="material-row__symbol">{row.element}</span>
              <div className="material-row__bar" aria-hidden="true">
                <span style={{ width: `${Math.max((row.massKg / maxMass) * 100, row.massKg > 0 ? 3 : 0)}%` }} />
              </div>
              <span className="material-row__mass">{number.format(row.massKg)} kg</span>
              <span className="material-row__levy">{money.format(row.levyAud)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
