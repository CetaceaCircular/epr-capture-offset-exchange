import { ArrowRight } from "lucide-react";

const moneyLoop = [
  {
    step: "1",
    title: "New import lands",
    text: "A shipment of new batteries (or solar panels) arrives in Australia. A Day-1 EPR invoice is issued to the importer, priced per kilogram by chemistry.",
  },
  {
    step: "2",
    title: "Legacy stock is recovered",
    text: "Old stock already in Australia is scanned, sorted and hydromet-processed into battery-grade materials. Verified output mints a credit lot.",
  },
  {
    step: "3",
    title: "OEMs bid for credits",
    text: "Importers buy credits to offset their invoice — and win first-refusal off-take on the recovered lithium, nickel, cobalt, FePO4, silver and silicon.",
  },
  {
    step: "4",
    title: "Australia builds capacity",
    text: "Settlement is hash-linked (no double counting). Credit revenue is ring-fenced to fund the collection and processing infrastructure Australia lacks.",
  },
];

const numberBand = [
  { label: "EV / ESS levy", value: "A$4–7 /kg", note: "≈ A$1,300–2,200 per EV pack" },
  { label: "Solar PV levy", value: "A$5–8 /panel", note: "legacy panels hold ~A$73 of silver" },
  { label: "3C handheld levy", value: "A$5 /kg", note: "A$0.25 phone · A$17.50 e-bike" },
  { label: "Recovered value", value: "A$2.9–17.3k /t", note: "LFP → NMC 811 → LCO, battery grade" },
];

const glossary = [
  ["EPR", "Extended Producer Responsibility — the maker pays for end-of-life"],
  ["LIB", "Lithium-ion battery"],
  ["NMC / LFP / LCO", "Battery chemistries: nickel-manganese-cobalt, lithium-iron-phosphate, lithium-cobalt"],
  ["OEM", "Original equipment manufacturer (e.g. the battery or panel maker)"],
  ["MIIT", "China's industry ministry — runs the battery traceability registry"],
  ["Hydromet", "Hydrometallurgy — water-based refining that outputs battery-grade material"],
  ["Day 1", "The moment an import lands — the only point 100% of liability is capturable"],
  ["Credit lot", "Verified recovered material, sold to importers as an invoice offset"],
];

export function PlainEnglish() {
  return (
    <section id="idea" className="content-section plain-english" aria-label="The idea in plain language">
      <div className="section-heading">
        <p className="eyebrow">Plain language first</p>
        <h2>The idea in 60 seconds.</h2>
        <p>
          Australia already carries ~200,000 tonnes of end-of-life batteries and ~280,000 tonnes of legacy solar
          panels — orphan waste with no producer left to bill, and no funded recovery infrastructure. Meanwhile China
          wants secure feedstock. This architecture is the bridge: new imports pay a Day-1 levy, and importers clear
          part of it by funding the recovery of the old stock — earning first dibs on the materials it produces.
        </p>
      </div>

      <div className="money-loop" aria-label="How the money flows">
        {moneyLoop.map((item, i) => (
          <article key={item.step} className="money-loop__step">
            <div className="money-loop__head">
              <span className="money-loop__num">{item.step}</span>
              <h3>{item.title}</h3>
              {i < moneyLoop.length - 1 && <ArrowRight className="money-loop__arrow size-5" aria-hidden="true" />}
            </div>
            <p>{item.text}</p>
          </article>
        ))}
      </div>

      <div className="number-band" aria-label="Headline numbers">
        {numberBand.map((n) => (
          <div key={n.label} className="number-band__cell">
            <span className="number-band__label">{n.label}</span>
            <strong>{n.value}</strong>
            <span className="number-band__note">{n.note}</span>
          </div>
        ))}
      </div>

      <details className="glossary">
        <summary>Acronym glossary — tap to expand</summary>
        <dl>
          {glossary.map(([term, def]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
