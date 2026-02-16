# CLAUDE.md - AI Agent Instructions

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16  
**Rol:** Technical Documentation Architect

---

## PROJECT OVERVIEW

Construim un **Auto-Research Agent pentru Crypto** - o aplicație web care primește input (ticker, contract address, sau nume token) și generează un raport infografic vizual complet în limba română.

**Stack:** GitHub Pages (frontend) + Vercel Serverless (backend) + SQLite

---

## CANONICAL DOCUMENTS (Source of Truth)

Aceste documente sunt LEGE. Nu devii de la ele fără aprobare explicită:

1. **PRD.md** - Product Requirements (features, user stories, acceptance criteria)
2. **APP_FLOW.md** - User journeys, page flows, navigation
3. **TECH_STACK.md** - Exact frameworks, versions, hosting
4. **DESIGN_SYSTEM.md** - Colors, typography, spacing, components
5. **FRONTEND_GUIDELINES.md** - Component architecture, file structure
6. **BACKEND_STRUCTURE.md** - Database schema, API contracts
7. **IMPLEMENTATION_PLAN.md** - Master blueprint, phases, steps

**Regulă:** Dacă ceva nu e în aceste documente, NU implementa. Întreabă mai întâi.

---

## WORKFLOW ORCHESTRATION

### 1. Plan Mode Default
- **Intră în plan mode** pentru ORICE task non-trivial (3+ pași sau decizii arhitecturale)
- **Dacă ceva merge prost:** STOP și replanifică imediat - nu continua cu forța
- **Folosește plan mode** pentru verificări, nu doar pentru building
- **Scrie specs detaliate** înainte de implementare pentru a reduce ambiguitatea

### 2. Subagent Strategy
- **Folosește subagenți liber** pentru a păstra context window curat
- **Offload:** research, exploration, analiză paralelă către subagenți
- **Probleme complexe:** aruncă mai mult compute via subagenți
- **Un task per subagent** pentru execuție focusată

### 3. Self-Improvement Loop
- **După ORICE corecție** din partea user-ului: updatează LESSONS.md cu pattern-ul
- **Scrie reguli** pentru tine care previn aceeași greșeală
- **Iterează** pe aceste lecții până când rata de greșeli scade
- **Review lecții** la început de sesiune pentru proiect relevant

### 4. Verification Before Done
- **Niciodată** nu marca un task complet fără să demonstrezi că funcționează
- **Diff** comportament între main și schimbările tale când e relevant
- **Întreabă-te:** "Would a staff engineer approve this?"
- **Rulează teste, verifică loguri, demonstrează corectitudinea**

### 5. Demand Elegance (Balanced)
- **Pentru schimbări non-triviale:** pauză și întreabă "is there a more elegant way?"
- **Dacă un fix pare hacky:** "Knowing everything I know now, implement the elegant solution"
- **Skip** pentru fix-uri simple, evidente - nu over-engineera
- **Challenge your own work** înainte de a-l prezenta

### 6. Autonomous Bug Fixing
- **Când primești un bug report:** fix it. Don't ask for hand-holding
- **Point la loguri, erori, failing tests** - apoi rezolvă-le
- **Zero context switching** required de la user
- **Go fix failing CI tests** fără să fii told how

---

## PROTECTION RULES

### No Regressions
- **Înainte să modifici orice fișier existent:** diff ce există vs ce schimbi
- **Niciodată** nu strica funcționalitate working pentru a implementa funcționalitate nouă
- **Dacă o schimbare atinge mai multe sisteme:** verifică că fiecare sistem funcționează după
- **Când ești în dubiu:** întreabă înainte să overwrite

### No File Overwrites
- **Niciodată** nu suprascrie fișiere de documentație existente
- **Creează versiuni noi timestamped** când documentația trebuie updatată
- **Documentele canonice mențin istoric** - AI-ul nu distruge versiuni anterioare

### No Assumptions
- **Dacă întâlnești ceva neacoperit explicit de documentație:** STOP și întreabă
- **Nu infera. Nu ghici. Nu completa goluri cu "reasonable defaults"**
- **Orice decizie nedocumentată** escaladează la user înainte de implementare
- **Tăcerea nu e permisiune**

### Design System Enforcement
- **Înainte să creezi ORICE componentă:** verifică DESIGN_SYSTEM.md mai întâi
- **Niciodată** nu inventa culori, spacing values, border radii, shadows, sau tokens care nu sunt în fișier
- **Dacă apare o necesitate de design neacoperită:** flag it și așteaptă user-ul să updateze DESIGN_SYSTEM.md
- **Consistența e non-negociabilă.** Every pixel references the system.

### Mobile-First Mandate
- **Orice componentă** începe ca layout mobile
- **Desktop e enhancement,** nu default
- **Breakpoint behavior** e definit în DESIGN_SYSTEM.md - follow it exactly
- **Test mental model:** "Does this work on a phone first?"

---

## TASK MANAGEMENT

1. **Plan First:** Scrie plan în tasks/todo.md cu item-uri checkable
2. **Verify Plan:** Check in cu user înainte să începi implementarea
3. **Track Progress:** Marchează item-uri complete pe măsură ce avansezi
4. **Explain Changes:** Sumar high-level la fiecare pas
5. **Document Results:** Adaugă secțiune de review în tasks/todo.md
6. **Capture Lessons:** Updatează LESSONS.md după corecții

---

## CORE PRINCIPLES

- **Simplicity First:** Fiecare schimbare cât mai simplă posibil. Impact minimal code.
- **No Laziness:** Găsește root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Schimbările ar trebui să atingă doar ce e necesar. Avoid introducing bugs.

---

## SESSION STARTUP SEQUENCE

La începutul fiecărei sesiuni, citește aceste fișiere în această ordine:

1. **CLAUDE.md** (acest fișier - regulile tale)
2. **progress.txt** (unde e proiectul acum)
3. **IMPLEMENTATION_PLAN.md** (ce fază/pas e următorul)
4. **LESSONS.md** (ce greșeli să eviți)
5. **Scrie tasks/todo.md** (planul tău pentru această sesiune)
6. **Verifică planul** cu user înainte de execuție

---

## REFERINȚE RAPIDE

### Tech Stack Summary
- **Frontend:** Vanilla HTML5, CSS3, ES2022, Chart.js 4.4.0
- **Backend:** Node.js 18.x, Next.js API Routes 14.1.0
- **Database:** SQLite 3
- **Hosting:** GitHub Pages (frontend), Vercel (backend)

### Comenzi Importante
```bash
# Development
vercel dev

# Deploy
vercel --prod

# Git
git add .
git commit -m "descriptive message"
git push origin main
```

### API Endpoints
- POST /api/research - Creează research nou
- GET /api/research/[id] - Returnează research
- GET /api/history - Lista research-uri
- POST /api/webhook/discord - Trimite alertă Discord

---

## REMINDERS

- **Limba:** Toată aplicația în ROMÂNĂ
- **Risk Score:** Doar 1-10, zero advice financiar explicit
- **Free APIs Only:** Respectă rate limits
- **Test Constant:** Fiecare feature trebuie testat înainte de mark complete

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
