import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA CONTEXT — embeds the full datamart for the AI
// ─────────────────────────────────────────────────────────────────────────────
const TAMBOS_INFO = {
  PKC001: { nombre: "Tambo Los Aromos", titular: "Carlos Méndez", depto: "San José", vacas: 142, nivel: "Red", sistema: "Pastoreo+Suple.", has: 185 },
  PKC002: { nombre: "La Estrella", titular: "Ana Rodríguez", depto: "San José", vacas: 165, nivel: "Élite", sistema: "Pastoreo puro", has: 210 },
  PKC003: { nombre: "El Trigal", titular: "José García", depto: "Canelones", vacas: 128, nivel: "Base", sistema: "Mixto", has: 175 },
};

const SYSTEM_BASE = `Sos el asistente inteligente del piloto Tambo Conectado de CONAPROLE, impulsado por el marco Organizational Commons de Adaptant (www.adaptant.co).

Respondés en español, con tono cálido y directo, como un asesor senior que conoce cada tambo de memoria. Usás **negrita** para números clave. Cuando corresponde, cruzás datos del tambo con el contexto macro uruguayo. Cuando el productor tiene brechas vs. mejores prácticas internacionales, lo señalás con indicaciones concretas y accionables. Nunca pedís que abran planillas. Nunca generás reportes.

TRES TAMBOS EN EL PILOTO:
- PKC001 · Tambo Los Aromos · Carlos Méndez · San José · 142 vacas · Nivel Red · Pastoreo+Suplementación
- PKC002 · La Estrella · Ana Rodríguez · San José · 165 vacas · Nivel Élite · Pastoreo puro
- PKC003 · El Trigal · José García · Canelones · 128 vacas · Nivel Base · Mixto

══════════════════════════════════════════════
PRODUCCIÓN MENSUAL — LITROS BRUTOS
══════════════════════════════════════════════
Mes            PKC001(LA) PKC002(LE) PKC003(ET) L/v/d:LA L/v/d:LE L/v/d:ET
Mayo 2024       64.077     91.244     53.310     14.9     18.4     13.5
Junio 2024      67.172     95.388     55.980     15.8     19.3     14.6
Julio 2024      76.023    108.012     63.244     17.8     21.8     16.5
Agosto 2024     84.668    120.448     70.388     19.8     24.3     18.3
Septiembre      86.980    123.736     72.120     20.5     25.0     18.8
Octubre 2024    92.352    131.428     62.850     21.6     26.5     16.4 ← PKC003 mastitis
Noviembre       86.949    123.652     72.840     20.5     24.9     19.0
Diciembre       84.476    120.204     70.348     19.8     24.3     18.3
Enero 2025      74.378    101.968     59.789     17.4     20.6     15.6 ← sequía
Febrero 2025    58.384     80.188     45.569     14.9     16.2     11.9 ← sequía plena
Marzo 2025      64.300     91.508     52.785     15.0     18.5     13.7
Abril 2025      59.342     84.448     49.494     13.9     17.1     12.9
TOTAL AÑO      899.101  1.272.224    728.717

══════════════════════════════════════════════
CALIDAD MENSUAL — GRASA / CCS (miles) / RESULTADO
══════════════════════════════════════════════
Mes           G%:LA  G%:LE  G%:ET  CCS:LA CCS:LE CCS:ET  Estado ET
Mayo 2024     3.76   3.88   3.58   148    152    178     APTO
Junio 2024    3.82   3.94   3.62   142    145    172     APTO
Julio 2024    3.85   3.96   3.65   138    138    168     APTO
Agosto 2024   3.83   3.92   3.60   145    142    175     APTO
Septiembre    3.74   3.82   3.55   158    155    185     APTO
Octubre 2024  3.68   3.76   3.48   163    158    245     RECHAZADO ← mastitis
Noviembre     3.65   3.72   3.52   168    162    218     OBSERVADO
Diciembre     3.63   3.70   3.55   172    168    192     APTO
Enero 2025    3.61   3.68   3.50   178    172    198     APTO
Febrero 2025  3.60   3.67   3.48   182    175    205     OBSERVADO ← sequía
Marzo 2025    3.63   3.70   3.55   175    168    190     APTO
Abril 2025    3.68   3.74   3.58   165    160    180     APTO
Referencias CONAPROLE: Grasa>3.5% | Proteína>3.0% | CCS<200k | UFC<100k
PKC002 estuvo siempre APTO con calidad superior. PKC003 tuvo 1 RECHAZADO (oct) y 2 OBSERVADO.

══════════════════════════════════════════════
INGRESOS, GASTOS Y MÁRGENES MENSUALES (USD)
══════════════════════════════════════════════
      PKC001 Los Aromos        PKC002 La Estrella        PKC003 El Trigal
Mes    Ingr.  Gasto  Margen%   Ingr.  Gasto  Margen%   Ingr.  Gasto  Margen%
May24  23.415  7.080   70%     33.195 10.355   69%     19.152  5.845   70%
Jun24  24.634  7.270   70%     34.903 10.635   70%     20.304  6.075   70%
Jul24  27.280  7.685   72%     39.900 10.993   72%     22.758  6.115   73%
Ago24  31.250  7.575   76%     44.566 10.853   76%     25.890  6.273   76%
Sep24  32.103  7.255   77%     45.722 10.625   77%     26.004  6.905   73%
Oct24  35.742  7.148   80%     50.933 10.485   79%     23.148  8.875   62% ← mastitis
Nov24  32.254  6.770   79%     47.564  9.965   79%     27.438  7.475   73%
Dic24  32.168  6.852   79%     45.918  9.985   78%     26.765  6.885   74%
Ene25  28.625  7.030   75%     39.258 10.185   74%     22.938  7.138   69%
Feb25  22.478  7.260   68%     30.953 10.460   66%     17.490  7.295   58% ← peor
Mar25  24.692  7.095   71%     35.139 10.425   70%     20.039  6.953   65%
Abr25  22.651  6.875   70%     32.261 10.015   69%     18.734  6.855   63%
TOTAL  337.292 85.895  75%    480.316 124.981   74%    270.660 82.689   69%
PKC003 tiene margen inferior por penalizaciones de calidad y episodio mastitis.

══════════════════════════════════════════════
CONTEXTO MACRO — URUGUAY SECTOR LECHERO
══════════════════════════════════════════════
Producción nacional: 1.920 millones de litros estimado 2024 (1.940 en 2023)
Tambos activos: ~4.310 (tendencia decreciente, escala en alza)
CONAPROLE market share remisión: ~60% | Retail: ~70%
Exportaciones lácteas 2023: ~464 millones USD | 59% de la producción
Principales destinos: China 38% LPE, Brasil 45% quesos, Argelia 15% LPE
L/vaca/año Uruguay promedio: 2.791 (NZ referencia: 4.200, meta UY 2030: 3.500)
Precio al productor may24-abr25: 0.366 a 0.388 USD/lt (pico oct por bonif. estacional)
Tipo de cambio: 42.0 a 43.8 UYU/USD en el período
IPC lácteos Uruguay: subió ~12% en el año. Consumo per cápita: 322 L equiv/hab/año
Precipitaciones 2024: 720mm (déficit vs. 820mm histórico) — sequía ene-feb 2025
Costo gasoil/energía: +6% anual. Salario rural: +7% anual. Crédito BROU: 7.8% p.a.
GDT LPE Index período: 1.098 a 1.145 (estable-alcista). Señal positiva para precio futuro.

══════════════════════════════════════════════
MEJORES PRÁCTICAS INTERNACIONALES — BRECHAS CLAVE
══════════════════════════════════════════════
INDICADOR              URY prom.  NZ        Irlanda  PB(intensivo)  Meta UY2030
L/vaca/año              2.791     4.200     5.100    8.800          3.500
Grasa (%)               3.65      4.20      3.85     4.10           3.80
CCS promedio (miles)    185       185       165      95             150
Costo prod (USD/lt)     0.24      0.18      0.22     0.38           0.22
Margen neto             28%       38%       32%      18%            35%
Uso IA (inseminación)   55%       78%       82%      95%            75%
Registros digitales     32%       95%       88%      99%            80%
Días en ordeñe/vaca     290       295       285      310            295

RECOMENDACIONES PRIORITARIAS (ordenadas por impacto/costo):
1. GENÉTICA — IA con semen sexado + protocolo IATF: +8-12% L/vaca en 3 generaciones. USD 45-80/dosis. (IDF 2023)
2. CALIDAD — Protocolo mastitis (pre/post dipping, terapia selectiva vaca seca): CCS -30 a -40k. USD 2.000-4.000/año. 
3. NUTRICIÓN — TMR en transición: +5-7% producción primer pico, -40% cetosis. USD 8.000-15.000 inversión.
4. REPRODUCCIÓN — Detección celo automatizada: intervalo parto-concepción -15 días. USD 4.000-8.000.
5. PASTURAS — Rotación 21-28 días, altura entrada 25-28cm: +15-20% utilización MS. USD 500-1.500.
6. ESTRÉS TÉRMICO — Ventiladores + aspersores (THI>68): sostiene producción veranos. USD 3.000-8.000.
7. DIGITALIZACIÓN — Registros individuales + sistema OC: decisiones 40% más rápidas. USD 200-800/año.
8. AGUA — Bebederos ad libitum >15L/min cada 15-20 vacas: +3-5% producción verano. USD 1.500-3.000.`;

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTED QUESTIONS BY CATEGORY
// ─────────────────────────────────────────────────────────────────────────────
const CHIP_CATEGORIES = [
  {
    label: "Mi tambo", icon: "🐄", color: "#1f7a42",
    chips: [
      "¿En qué mes gané más?",
      "¿Cómo me afectó la sequía?",
      "¿Mi calidad estuvo siempre bien?",
      "¿Cuánto produje en el año?",
      "¿Cuánto me cuesta producir un litro?",
    ]
  },
  {
    label: "Comparar tambos", icon: "📊", color: "#1565c0",
    chips: [
      "¿Cuál de los tres tambos rinde mejor?",
      "¿Cómo estoy vs La Estrella en calidad?",
      "¿Qué hizo diferente Ana que le fue mejor?",
      "¿Cuál tuvo mejor margen en primavera?",
      "¿El Trigal tuvo problemas de calidad?",
    ]
  },
  {
    label: "Contexto Uruguay", icon: "🇺🇾", color: "#7b1fa2",
    chips: [
      "¿Cómo estamos vs el promedio nacional?",
      "¿El precio que pagó CONAPROLE fue bueno?",
      "¿Cómo impactó el tipo de cambio?",
      "¿Qué pasó con las exportaciones en 2024?",
      "¿El GDT subió o bajó este año?",
    ]
  },
  {
    label: "Mejorar producción", icon: "🌿", color: "#e65100",
    chips: [
      "¿Qué puedo hacer para producir más litros?",
      "¿Cómo bajo mi CCS al nivel de Nueva Zelanda?",
      "¿Cuánto ganaría mejorando la genética?",
      "¿Qué hacen en Irlanda que nosotros no hacemos?",
      "¿Cuál es la mejora con mejor retorno/inversión?",
    ]
  },
];

const KPI_DATA = [
  { label: "Producción total (3 tambos)", value: "2.9M L", delta: "Año completo", up: null },
  { label: "Ingreso total piloto", value: "$1.09M", delta: "USD brutos", up: null },
  { label: "Mejor tambo", value: "La Estrella", delta: "480K USD · 74% margen", up: true },
  { label: "Mayor brecha calidad", value: "El Trigal", delta: "2 obs + 1 rechazo", up: false },
  { label: "Precio prom. período", value: "$0.378", delta: "USD/lt efectivo", up: null },
  { label: "L/vaca/día mejor", value: "26.5", delta: "La Estrella oct", up: true },
  { label: "Gap vs NZ", value: "−33%", delta: "L/vaca/año promedio", up: false },
];

const G800="#0e4524", G600="#1f7a42", G400="#3db86b", G100="#d1f0dc", G50="#f0faf4";
const B700="#1565c0", B50="#e3f2fd";
const P700="#7b1fa2", P50="#f3e5f5";
const O700="#e65100", O50="#fff3e0";
const SL50="#f8fafc", SL100="#f1f5f9", SL200="#e2e8f0", SL300="#cbd5e1";
const SL400="#94a3b8", SL600="#475569", SL700="#334155", SL800="#1e293b";

function fmt(text) {
  return text.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");
}

function TypingDots() {
  return (
    <div style={{display:"flex",gap:4,padding:"4px 2px",alignItems:"center"}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:7,height:7,borderRadius:"50%",background:SL400,
          animation:"blink 1.2s infinite",animationDelay:`${i*0.2}s`}}/>
      ))}
    </div>
  );
}

export default function App() {
  const [activeTambo, setActiveTambo] = useState("PKC001");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showChips, setShowChips] = useState(true);
  const msgsEnd = useRef(null);
  const historyRef = useRef([]);

  useEffect(()=>{msgsEnd.current?.scrollIntoView({behavior:"smooth"})},[messages,loading]);

  const tambo = TAMBOS_INFO[activeTambo];

  async function send(text) {
    if (loading) return;
    const q = text || input.trim();
    if (!q) return;
    setInput(""); setShowChips(false);
    const userMsg = {role:"user",content:q};
    const hist = [...historyRef.current, userMsg];
    historyRef.current = hist;
    setMessages(hist); setLoading(true);
    const systemPrompt = SYSTEM_BASE +
      `\n\nEl productor que consulta ahora es: ${tambo.titular} del ${tambo.nombre} (${activeTambo}). Cuando sea relevante, priorizá datos de su tambo pero podés cruzar con los otros dos y con el contexto macro.`;
    try {
      const res = await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,
          system:systemPrompt,messages:hist})
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sin respuesta.";
      const newHist = [...hist,{role:"assistant",content:reply}];
      historyRef.current = newHist;
      setMessages(newHist);
    } catch {
      const errHist = [...hist,{role:"assistant",content:"**Error de conexión.** Verificá tu acceso a internet."}];
      historyRef.current = errHist;
      setMessages(errHist);
    }
    setLoading(false);
  }

  const catColors = { 0:G600, 1:B700, 2:P700, 3:O700 };
  const catBgs   = { 0:G50,  1:B50,  2:P50,  3:O50  };

  return (
    <div style={{fontFamily:"'DM Sans','Inter',system-ui,sans-serif",height:"100vh",
      display:"flex",flexDirection:"column",background:SL50,color:SL800,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .msg-in{animation:fadeUp .18s ease-out}
        .chip-btn:hover{opacity:.85}
        .tambo-tab:hover{background:${G50}!important}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:${SL300};border-radius:2px}
      `}</style>

      {/* TOP BANNER */}
      <div style={{background:G800,color:"rgba(255,255,255,.55)",fontSize:10,
        textAlign:"center",padding:"3px 16px",letterSpacing:".08em",fontWeight:500,
        textTransform:"uppercase",flexShrink:0}}>
        <span style={{color:"#fff",fontWeight:700}}>Tambo Conectado</span>
        {" · Piloto Organizational Commons · "}
        <span style={{color:"#fff",fontWeight:700}}>Adaptant</span>
        {" · CONAPROLE · 3 Tambos · May 2024 – Abr 2025"}
      </div>

      {/* HEADER */}
      <div style={{background:G800,padding:"0 16px",display:"flex",
        alignItems:"center",justifyContent:"space-between",height:52,
        flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* Tambo selector tabs */}
          {Object.entries(TAMBOS_INFO).map(([id,t])=>{
            const active = id===activeTambo;
            return (
              <button key={id} className="tambo-tab"
                onClick={()=>{setActiveTambo(id);setMessages([]);historyRef.current=[];setShowChips(true);}}
                style={{background:active?"rgba(255,255,255,.15)":"transparent",
                  border:active?"1px solid rgba(255,255,255,.3)":"1px solid transparent",
                  borderRadius:8,padding:"5px 10px",cursor:"pointer",transition:"all .15s",
                  textAlign:"left"}}>
                <div style={{fontSize:11,fontWeight:active?600:400,
                  color:active?"#fff":"rgba(255,255,255,.55)"}}>
                  {t.nombre}
                </div>
                <div style={{fontSize:9,color:active?"rgba(255,255,255,.7)":"rgba(255,255,255,.35)"}}>
                  {t.nivel} · {t.vacas} v.
                </div>
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:G400,
            animation:"pulse 2s infinite",boxShadow:`0 0 0 3px rgba(61,184,107,.2)`}}/>
          <div style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",
            color:"rgba(255,255,255,.7)",fontSize:10,fontFamily:"monospace",
            padding:"2px 8px",borderRadius:4,fontWeight:500}}>OC · DEMO</div>
        </div>
      </div>

      {/* KPI STRIP */}
      <div style={{background:"#fff",borderBottom:`1px solid ${SL200}`,
        display:"flex",overflowX:"auto",flexShrink:0,scrollbarWidth:"none"}}>
        {KPI_DATA.map((k,i)=>(
          <div key={i} style={{flex:"0 0 auto",padding:"8px 14px",
            borderRight:`1px solid ${SL200}`,minWidth:100}}>
            <div style={{fontSize:9,color:SL400,fontWeight:600,
              textTransform:"uppercase",letterSpacing:".05em"}}>{k.label}</div>
            <div style={{fontSize:14,fontWeight:700,color:SL800,lineHeight:1.3,marginTop:1}}>
              {k.value}
            </div>
            <div style={{fontSize:9,marginTop:1,
              color:k.up===true?G600:k.up===false?"#ef4444":SL400}}>
              {k.up===true&&"▲ "}{k.up===false&&"▼ "}{k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* MESSAGES */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 18px",
        display:"flex",flexDirection:"column",gap:10}}>

        {/* Welcome card */}
        <div className="msg-in" style={{display:"flex",gap:8,maxWidth:"90%",alignSelf:"flex-start"}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:G800,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,fontWeight:700,color:"#fff",flexShrink:0,marginTop:2}}>TC</div>
          <div style={{background:"#fff",border:`1px solid ${SL200}`,
            borderRadius:"12px 12px 12px 3px",padding:"12px 14px",fontSize:13,lineHeight:1.65}}>
            <div style={{background:G50,border:`1px solid ${G100}`,borderRadius:8,
              padding:"10px 12px",marginBottom:10}}>
              <strong style={{color:G800}}>Piloto Tambo Conectado — 3 tambos, datos reales simulados.</strong>
              <br/><span style={{fontSize:12,color:SL600}}>
                Podés cambiar de tambo arriba y preguntarme lo que le preguntarías a tu asesor. 
                Cruzo datos de producción, calidad, precios, contexto de Uruguay y mejores prácticas internacionales.
              </span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["🐄","Producción y calidad por tambo"],["📊","Comparativas entre los 3 tambos"],
                ["🇺🇾","Contexto macro Uruguay 2024"],["🌿","Mejoras con base internacional"]].map(([ic,txt],i)=>(
                <div key={i} style={{fontSize:12,color:SL700,display:"flex",alignItems:"center",gap:6}}>
                  <span>{ic}</span><span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {messages.map((m,i)=>{
          const isUser=m.role==="user";
          return (
            <div key={i} className="msg-in" style={{display:"flex",gap:8,maxWidth:"90%",
              alignSelf:isUser?"flex-end":"flex-start",
              flexDirection:isUser?"row-reverse":"row"}}>
              <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,marginTop:2,
                background:isUser?G100:G800,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:9,fontWeight:700,color:isUser?G800:"#fff"}}>
                {isUser?tambo.titular.split(" ").map(w=>w[0]).join("").slice(0,2):"TC"}
              </div>
              <div style={{
                background:isUser?G600:"#fff",
                color:isUser?"#fff":SL800,
                border:isUser?"none":`1px solid ${SL200}`,
                borderRadius:isUser?"12px 12px 3px 12px":"12px 12px 12px 3px",
                padding:"9px 13px",fontSize:13,lineHeight:1.65,
              }} dangerouslySetInnerHTML={{__html:fmt(m.content)}}/>
            </div>
          );
        })}

        {loading&&(
          <div className="msg-in" style={{display:"flex",gap:8,maxWidth:"90%",alignSelf:"flex-start"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:G800,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:9,fontWeight:700,color:"#fff",flexShrink:0,marginTop:2}}>TC</div>
            <div style={{background:"#fff",border:`1px solid ${SL200}`,
              borderRadius:"12px 12px 12px 3px",padding:"9px 13px"}}>
              <TypingDots/>
            </div>
          </div>
        )}
        <div ref={msgsEnd}/>
      </div>

      {/* CATEGORY TABS + CHIPS */}
      {showChips&&(
        <div style={{background:"#fff",borderTop:`1px solid ${SL100}`,flexShrink:0}}>
          {/* Category tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${SL100}`,padding:"0 16px"}}>
            {CHIP_CATEGORIES.map((cat,i)=>(
              <button key={i} onClick={()=>setActiveCategory(i)} style={{
                background:"transparent",border:"none",cursor:"pointer",
                padding:"8px 10px",fontSize:11,fontWeight:activeCategory===i?600:400,
                color:activeCategory===i?catColors[i]:SL400,
                borderBottom:activeCategory===i?`2px solid ${catColors[i]}`:"2px solid transparent",
                fontFamily:"inherit",transition:"all .15s",whiteSpace:"nowrap",
                display:"flex",alignItems:"center",gap:4
              }}>
                <span>{cat.icon}</span>{cat.label}
              </button>
            ))}
          </div>
          {/* Chips row */}
          <div style={{display:"flex",gap:6,overflowX:"auto",padding:"8px 16px",
            scrollbarWidth:"none"}}>
            {CHIP_CATEGORIES[activeCategory].chips.map((s,i)=>(
              <button key={i} className="chip-btn" onClick={()=>send(s)} style={{
                flex:"0 0 auto",background:catBgs[activeCategory],
                color:catColors[activeCategory],
                border:`1px solid ${catColors[activeCategory]}30`,
                padding:"5px 12px",borderRadius:100,fontSize:12,
                cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",
                fontWeight:400,transition:"all .15s"
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT */}
      <div style={{background:"#fff",borderTop:`1px solid ${SL200}`,
        padding:"10px 16px 14px",display:"flex",gap:8,alignItems:"flex-end",flexShrink:0}}>
        {/* Tambo avatar */}
        <div style={{width:30,height:30,borderRadius:"50%",background:G100,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:10,fontWeight:700,color:G800,flexShrink:0}}>
          {tambo.titular.split(" ").map(w=>w[0]).join("").slice(0,2)}
        </div>
        <textarea value={input}
          onChange={e=>{setInput(e.target.value);e.target.style.height="auto";
            e.target.style.height=Math.min(e.target.scrollHeight,90)+"px"}}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          rows={1} disabled={loading}
          placeholder={`Preguntá como ${tambo.titular}...`}
          style={{flex:1,border:`1px solid ${SL300}`,borderRadius:10,
            padding:"8px 12px",fontFamily:"inherit",fontSize:13,
            color:SL800,resize:"none",outline:"none",maxHeight:90,
            lineHeight:1.5,background:SL50}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{
          width:36,height:36,borderRadius:9,flexShrink:0,
          background:loading||!input.trim()?SL300:G600,
          border:"none",cursor:loading||!input.trim()?"not-allowed":"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
