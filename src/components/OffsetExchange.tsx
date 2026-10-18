import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DEFAULT_LIABILITY_INPUT,
  SAMPLE_BIDS,
  SAMPLE_LEGACY_EVENTS,
  calculateEprLiability,
} from "@contracts/epr";
import { ArrowRight, BadgeCheck, MapPin, PackageSearch, ShieldCheck } from "lucide-react";

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export function OffsetExchange() {
  const liability = calculateEprLiability(DEFAULT_LIABILITY_INPUT);
  const settledOffset = Math.min(liability.maxLegacyOffsetAud, 26650);
  const clearance = Math.round((settledOffset / liability.maxLegacyOffsetAud) * 100);

  return (
    <div className="exchange-grid">
      <section className="panel edge-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Layer 2 / Edge traceability</p>
            <h3>Australian scan-to-sort stream</h3>
          </div>
          <PackageSearch className="size-5 text-primary" />
        </div>
        <div className="scan-shell">
          <div className="scan-window">
            <div className="scan-line" aria-hidden="true" />
            <span className="scan-window__code">S/N: AU-LEG-7Q4-1993</span>
            <strong>NMC 622 power tool pack</strong>
            <small>CV match 96.2% · blueprint CNX-2022-04-1187</small>
          </div>
          <div className="scan-meta">
            <div>
              <MapPin className="size-4" />
              <span>-33.8688, 151.2093 · Sydney NSW</span>
            </div>
            <div>
              <ShieldCheck className="size-4" />
              <span>Pre-sort: HYDRO_NMC · chain-of-custody hash locked</span>
            </div>
          </div>
        </div>
        <div className="legacy-list">
          {SAMPLE_LEGACY_EVENTS.map((event) => (
            <article key={event.eventId} className="legacy-item">
              <div>
                <span className="font-mono text-primary">{event.eventId}</span>
                <h4>{event.suburb}, {event.state}</h4>
              </div>
              <div className="legacy-item__stats">
                <span>{event.weightKg.toLocaleString()} kg input</span>
                <b>{event.recoveredLiKg.toFixed(1)} kg Li</b>
                <Badge variant="outline">{event.creditLotId}</Badge>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel bid-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Layer 3 / New-pays-for-old</p>
            <h3>Bidding preference engine</h3>
          </div>
          <span className="terminal-chip">clearance {clearance}%</span>
        </div>

        <div className="clearance-box">
          <div className="clearance-box__top">
            <span>New import liability</span>
            <b>{money.format(liability.grossLiabilityAud)}</b>
          </div>
          <Progress value={clearance} className="h-2" />
          <div className="clearance-box__bottom">
            <span>{money.format(settledOffset)} funded into legacy recovery</span>
            <span>{money.format(liability.grossLiabilityAud - settledOffset)} residual</span>
          </div>
        </div>

        <div className="bid-stack">
          {SAMPLE_BIDS.map((bid) => (
            <article className="bid-row" key={bid.bidId}>
              <div>
                <span className="font-mono text-xs text-muted-foreground">{bid.bidId}</span>
                <h4>{bid.oemId}</h4>
                <p>{bid.creditLotId} · {money.format(bid.bidAudPerKgLi)} / kg Li</p>
              </div>
              <div className="bid-row__right">
                <b>{money.format(bid.requestedOffsetAud)}</b>
                <Badge variant={bid.status === "OPEN" ? "outline" : "default"}>{bid.status}</Badge>
              </div>
            </article>
          ))}
        </div>

        <div className="offset-chain">
          <div className="offset-chain__title">
            <BadgeCheck className="size-4" />
            <span>Legal offset chain</span>
          </div>
          <div className="offset-chain__steps">
            <span>New import liability</span>
            <ArrowRight className="size-4" />
            <span>Awarded bid</span>
            <ArrowRight className="size-4" />
            <span>Assayed legacy recovery</span>
            <ArrowRight className="size-4" />
            <span>Offset ledger entry + instrument hash</span>
          </div>
        </div>
      </section>
    </div>
  );
}
