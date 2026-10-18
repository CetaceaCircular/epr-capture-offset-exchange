import { ArrowDown, ArrowRight, Database, FileSearch, Factory, Gavel, HandCoins, Recycle, ScanLine, Ship } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FlowNode = {
  id: string;
  zone: "CN" | "AU" | "EXCHANGE";
  title: string;
  detail: string;
  icon: LucideIcon;
};

const nodes: FlowNode[] = [
  {
    id: "miit",
    zone: "CN",
    title: "MIIT + factory ID",
    detail: "Battery ID, OEM registry, pack model and plant identifier are normalised into a canonical blueprint key.",
    icon: Factory,
  },
  {
    id: "customs",
    zone: "CN",
    title: "China Customs feed",
    detail: "Export declaration, HS line, consignee, gross mass and shipment date are streamed into the ledger worker.",
    icon: FileSearch,
  },
  {
    id: "ledger",
    zone: "CN",
    title: "AI EPR ledger",
    detail: "Cross-references BOM chemistry, customs weight and digital ID confidence; writes an immutable liability event.",
    icon: Database,
  },
  {
    id: "import",
    zone: "AU",
    title: "Day 1 import trigger",
    detail: "When the manifest lands, the invoice is generated without waiting for manual Australian declaration.",
    icon: Ship,
  },
  {
    id: "edge",
    zone: "AU",
    title: "CV edge scan",
    detail: "Importer, distributor or repair agent scans casing, serial or barcode; geolocation and sort stream are logged.",
    icon: ScanLine,
  },
  {
    id: "recovery",
    zone: "AU",
    title: "Hydromet recovery",
    detail: "Legacy stock is processed into battery-grade Li2CO3, FePO4 and NMC precursor with assay proof.",
    icon: Recycle,
  },
  {
    id: "credits",
    zone: "EXCHANGE",
    title: "Historical credit lot",
    detail: "Verified recovered kg Li-equivalent is minted as a credit lot with anti-double-count hash.",
    icon: HandCoins,
  },
  {
    id: "bid",
    zone: "EXCHANGE",
    title: "OEM bid match",
    detail: "Chinese OEMs bid for credits that clear their new import liability and fund legacy collection.",
    icon: Gavel,
  },
];

const zones = [
  { id: "CN", label: "China export layer" },
  { id: "AU", label: "Australia in-market layer" },
  { id: "EXCHANGE", label: "Offset exchange" },
] as const;

export function FlowDiagram() {
  return (
    <div className="flow-board" aria-label="Battery data flow from China export log to Australian credit offset">
      {zones.map((zone, zoneIndex) => (
        <section className="flow-zone" key={zone.id}>
          <div className="flow-zone__header">
            <span>{zone.label}</span>
            <small>0{zoneIndex + 1}</small>
          </div>
          <div className="flow-zone__nodes">
            {nodes
              .filter((node) => node.zone === zone.id)
              .map((node, nodeIndex, zoneNodes) => {
                const Icon = node.icon;
                const isLastInZone = nodeIndex === zoneNodes.length - 1;
                return (
                  <div className="flow-node-wrap" key={node.id}>
                    <article className="flow-node">
                      <div className="flow-node__icon" aria-hidden="true">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <h3>{node.title}</h3>
                        <p>{node.detail}</p>
                      </div>
                    </article>
                    {!isLastInZone ? (
                      <div className="flow-connector" aria-hidden="true">
                        <ArrowDown className="size-4 md:hidden" />
                        <ArrowRight className="hidden size-4 md:block" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
