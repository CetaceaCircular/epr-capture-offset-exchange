import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MERMAID_DATA_FLOW, PYTHON_MOCK_SCRIPT, SQL_SCHEMA_MOCK } from "@/data/artifacts";
import { Check, Copy, Download } from "lucide-react";

const artifacts = {
  mermaid: {
    label: "Mermaid DFD",
    filename: "epr-data-flow.mmd",
    mime: "text/plain",
    content: MERMAID_DATA_FLOW,
  },
  python: {
    label: "Python mock",
    filename: "epr_liability_mock.py",
    mime: "text/x-python",
    content: PYTHON_MOCK_SCRIPT,
  },
  sql: {
    label: "SQL schema",
    filename: "epr_offset_schema.sql",
    mime: "application/sql",
    content: SQL_SCHEMA_MOCK,
  },
} as const;

type ArtifactKey = keyof typeof artifacts;

function downloadText(key: ArtifactKey) {
  const artifact = artifacts[key];
  const blob = new Blob([artifact.content], { type: artifact.mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = artifact.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CodeWorkbench() {
  const [copied, setCopied] = useState<ArtifactKey | null>(null);

  const copy = async (key: ArtifactKey) => {
    await navigator.clipboard.writeText(artifacts[key].content);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="panel code-workbench">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Requested artefacts</p>
          <h3>Data flow, calculator and offset schema</h3>
        </div>
        <span className="terminal-chip">copy / download</span>
      </div>
      <Tabs defaultValue="mermaid" className="w-full">
        <TabsList className="code-tabs">
          {(Object.keys(artifacts) as ArtifactKey[]).map((key) => (
            <TabsTrigger key={key} value={key} className="min-h-11 px-4 font-mono text-xs uppercase tracking-[0.18em]">
              {artifacts[key].label}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(artifacts) as ArtifactKey[]).map((key) => (
          <TabsContent key={key} value={key} className="code-tab-content">
            <div className="code-toolbar">
              <span>{artifacts[key].filename}</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="min-h-11" onClick={() => void copy(key)}>
                  {copied === key ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied === key ? "Copied" : "Copy"}
                </Button>
                <Button type="button" variant="outline" className="min-h-11" onClick={() => downloadText(key)}>
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
            <pre className="code-block">
              <code>{artifacts[key].content}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
