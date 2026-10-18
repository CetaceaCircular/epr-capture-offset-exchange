import { Button } from "@/components/ui/button";
import { CodeWorkbench } from "@/components/CodeWorkbench";
import { FlowDiagram } from "@/components/FlowDiagram";
import { LiabilitySimulator } from "@/components/LiabilitySimulator";
import { OffsetExchange } from "@/components/OffsetExchange";
import { PlainEnglish } from "@/components/PlainEnglish";
import { ArrowDownRight, Cpu, DatabaseZap, Landmark, Radar, Recycle, Workflow } from "lucide-react";

const layerCards = [
  {
    id: "01",
    icon: DatabaseZap,
    title: "Upstream AI capture",
    text: "Customs, MIIT and manufacturing registry fields are normalised into one battery blueprint keyed by OEM, model, chemistry matrix and factory digital ID.",
  },
  {
    id: "02",
    icon: Radar,
    title: "Edge traceability",
    text: "Computer vision resolves a casing, serial or barcode back to the blueprint, then writes geolocation, custody and pre-sort routing before transport.",
  },
  {
    id: "03",
    icon: Recycle,
    title: "Credit offset exchange",
    text: "Verified legacy recovery becomes a tradable credit lot; bids from new-product importers clear Day 1 liabilities without double counting.",
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-background text-foreground">
      <div className="terminal-shell">
        <header className="site-header">
          <a href="#top" className="brand" aria-label="EPR Capture Exchange home">
            <span className="brand-mark">EPR</span>
            <span>
              Capture & Material Offset Exchange
              <small>CN → AU mock architecture</small>
            </span>
          </a>
          <nav className="site-nav" aria-label="Page sections">
            <a href="#idea">The idea</a>
            <a href="#flow">Flow</a>
            <a href="#simulator">Liability engine</a>
            <a href="#exchange">Offset exchange</a>
            <a href="#artefacts">Artefacts</a>
          </nav>
        </header>

        <section id="top" className="hero-section">
          <div className="hero-frame">
            <div className="hero-copy">
              <p className="system-line">
                <span className="pulse-dot" aria-hidden="true" />
                RUN epr_offset_exchange.sys · cross-border ledger online
              </p>
              <h1>Automated EPR liability capture for every LIB asset class entering Australia.</h1>
              <p className="hero-lede">
                A lean three-layer architecture that turns China export telemetry into Day 1 Australian EPR invoices,
                uses edge AI to identify legacy batteries in-market, and lets OEM bids fund recovery of old stock in
                exchange for auditable import-liability relief.
              </p>
              <div className="hero-actions">
                <Button asChild size="lg" className="min-h-12 px-6">
                  <a href="#simulator">
                    Run liability mock
                    <ArrowDownRight className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6">
                  <a href="#artefacts">Inspect schema artefacts</a>
                </Button>
              </div>
            </div>
            <div className="hero-console" aria-label="System status console">
              <div className="console-row">
                <span>source.miit_registry</span>
                <b>linked</b>
              </div>
              <div className="console-row">
                <span>source.china_customs</span>
                <b>streaming</b>
              </div>
              <div className="console-row">
                <span>ledger.invoice_latency</span>
                <b>Day 1</b>
              </div>
              <div className="console-row">
                <span>edge.cv_match</span>
                <b>96.2%</b>
              </div>
              <div className="console-row">
                <span>exchange.double_count_guard</span>
                <b>enforced</b>
              </div>
            </div>
          </div>
        </section>

        <section className="layer-strip" aria-label="Architecture layers">
          {layerCards.map((layer) => {
            const Icon = layer.icon;
            return (
              <article key={layer.id} className="layer-card">
                <div className="layer-card__top">
                  <span>{layer.id}</span>
                  <Icon className="size-5" />
                </div>
                <h2>{layer.title}</h2>
                <p>{layer.text}</p>
              </article>
            );
          })}
        </section>

        <PlainEnglish />

        <section id="flow" className="content-section">
          <div className="section-heading">
            <p className="eyebrow">Conceptual data flow diagram</p>
            <h2>One battery, one ledger key, three compliance states.</h2>
            <p>
              The ledger key follows the asset from export manifest to edge scan and finally into an offset settlement
              record. Each transition is hash-linked so a recovered legacy credit can extinguish only one new import
              liability.
            </p>
          </div>
          <FlowDiagram />
        </section>

        <section id="simulator" className="content-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Mock-up calculation script</p>
              <h2>Layer 1 liability from weight and chemistry.</h2>
            </div>
            <div className="heading-note">
              <Cpu className="size-4" />
              <span>Illustrative rates only — swap in the approved Australian fee schedule at deployment.</span>
            </div>
          </div>
          <LiabilitySimulator />
        </section>

        <section id="exchange" className="content-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Legacy recovery credit market</p>
              <h2>New stock clears by funding old stock recovery.</h2>
            </div>
            <div className="heading-note">
              <Landmark className="size-4" />
              <span>Offsets are capped, assay-verified and settled against a single invoice.</span>
            </div>
          </div>
          <OffsetExchange />
        </section>

        <section id="artefacts" className="content-section">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Generated deliverables</p>
              <h2>Mermaid, Python and SQL in one workbench.</h2>
            </div>
            <div className="heading-note">
              <Workflow className="size-4" />
              <span>Same mock contract is mirrored in the TypeScript API and Drizzle schema.</span>
            </div>
          </div>
          <CodeWorkbench />
        </section>

        <footer className="site-footer">
          <span>EPR Capture & Material Offset Exchange · conceptual architecture mock</span>
          <a href="#top" className="inline-flex min-h-11 items-center">Back to top</a>
        </footer>
      </div>
    </main>
  );
}
