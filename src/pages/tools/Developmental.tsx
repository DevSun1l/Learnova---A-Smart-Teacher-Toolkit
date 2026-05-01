import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TOPICS, TopicKey, GRADE_BANDS, GradeBand, DEV_TIPS } from "@/lib/topicContent";
import { Compass, Sparkles, FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";

const Developmental = () => {
  const [band, setBand] = useState<GradeBand | null>(null);
  const [topicKey, setTopicKey] = useState<TopicKey | null>(null);
  const [show, setShow] = useState(false);

  const tips = band && topicKey ? DEV_TIPS[band][topicKey] : null;

  const downloadPDF = () => {
    const element = document.getElementById('dev-pdf-content');
    const opt = {
      margin: 10,
      filename: `Developmental_Advisor_${band}_${topicKey}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    (html2pdf() as any).from(element).set(opt).save();
  };

  return (
    <AppShell showBack>
      <h1 className="font-display text-4xl mb-2">Developmental Advisor</h1>
      <p className="text-muted-foreground mb-6">Age-appropriate strategies grounded in Piaget, Vygotsky, and Erikson.</p>

      <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] mb-6 space-y-5">
        <div>
          <Label>Grade level</Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
            {GRADE_BANDS.map(g => (
              <button key={g.id} onClick={() => { setBand(g.id); setShow(false); }}
                className={`p-3 rounded-2xl text-left transition border-2 ${band === g.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}>
                <p className="font-semibold text-sm">{g.label}</p>
                <p className="text-xs text-muted-foreground">{g.range}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Subject topic</Label>
          <div className="grid sm:grid-cols-3 gap-2 mt-2">
            {Object.values(TOPICS).map(t => (
              <button key={t.id} onClick={() => { setTopicKey(t.id); setShow(false); }}
                className={`p-3 rounded-2xl text-left transition border-2 ${topicKey === t.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}>
                <span className="text-xl mr-2">{t.emoji}</span>
                <span className="font-semibold text-sm">{t.title}</span>
              </button>
            ))}
          </div>
        </div>
        <Button disabled={!band || !topicKey} onClick={() => setShow(true)} className="w-full h-12 bg-gradient-cool text-accent-foreground rounded-xl">
          <Sparkles className="h-4 w-4 mr-2"/> Generate Smart Tips
        </Button>
      </Card>

      {show && tips && band && topicKey && (
        <div className="space-y-4 animate-fade-in">
          <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] bg-gradient-to-br from-teal-50 to-cyan-50 relative">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1 text-accent">
                  <Compass className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{GRADE_BANDS.find(g => g.id === band)!.label} · {TOPICS[topicKey].title}</span>
                </div>
                <h2 className="font-display text-2xl">Theory-aligned strategies</h2>
              </div>
              <Button onClick={downloadPDF} size="sm" variant="outline" className="rounded-xl flex items-center gap-2 border-accent/20 text-accent hover:bg-accent/5">
                <FileDown className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </Card>
          
          <TheoryCard color="from-purple-500 to-fuchsia-400" name="Piaget" subtitle="Cognitive development" body={tips.piaget} />
          <TheoryCard color="from-orange-500 to-amber-400" name="Vygotsky" subtitle="Social & scaffolded learning" body={tips.vygotsky} />
          <TheoryCard color="from-pink-500 to-rose-400" name="Erikson" subtitle="Psychosocial development" body={tips.erikson} />
          
          <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-xl mb-3">✨ Smart Tips</h3>
            <ul className="space-y-2 list-disc pl-5">
              {tips.smartTips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </Card>

          {/* Hidden PDF content */}
          <div id="dev-pdf-content" className="hidden">
            <div style={{ padding: '20px', fontFamily: 'serif' }}>
              <div style={{ border: '2px solid #333', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                  <img src="/logo.ico" alt="Learnova" style={{ height: '30px' }} />
                  <h1 style={{ margin: 0, fontSize: '24px' }}>LEARNOVA</h1>
                </div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#666' }}>Developmental Advisor</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <strong>Grade:</strong> {GRADE_BANDS.find(g => g.id === band)!.label}
                </div>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <strong>Topic:</strong> {TOPICS[topicKey].title}
                </div>
              </div>

              <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Piaget (Cognitive)</h3>
                <p>{tips.piaget}</p>
              </div>

              <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Vygotsky (Social)</h3>
                <p>{tips.vygotsky}</p>
              </div>

              <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Erikson (Psychosocial)</h3>
                <p>{tips.erikson}</p>
              </div>

              <div style={{ border: '2px solid #22c55e', padding: '15px', backgroundColor: '#f0fdf4' }}>
                <h3 style={{ color: '#166534', marginTop: 0 }}>✨ Smart Tips</h3>
                <ul>
                  {tips.smartTips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

const TheoryCard = ({ color, name, subtitle, body }: any) => (
  <Card className="p-5 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] flex gap-4">
    <div className={`h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center font-display font-bold text-xl`}>
      {name[0]}
    </div>
    <div>
      <p className="font-display text-lg font-bold">{name}</p>
      <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      <p className="text-sm text-foreground/85">{body}</p>
    </div>
  </Card>
);

export default Developmental;
