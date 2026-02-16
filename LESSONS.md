# LESSONS.md - Mistakes and Patterns

## Auto-Research Agent pentru Crypto

**Versiune:** 1.0  
**Data:** 2026-02-16

---

## FORMAT

Fiecare intrare include:
1. **Ce s-a întâmplat** - Descrierea situației
2. **De ce s-a întâmplat** - Root cause
3. **Regula** - Ce să faci diferit data viitoare

---

## LECȚII

### LEC-001: Limba Aplicației
**Data:** 2026-02-16

**Ce s-a întâmplat:**
În timpul interogatoriului inițial nu s-a specificat explicit că aplicația trebuie să fie în limba română. A trebuit clarificat ulterior.

**De ce s-a întâmplat:**
Interogatorul nu a inclus întrebări specifice despre limbă/localizare.

**Regula:**
Întreabă mereu explicit despre limbă/localizare la începutul oricărui proiect cu UI.

---

### LEC-002: Clarificare Output Format
**Data:** 2026-02-16

**Ce s-a întâmplat:**
Inițial nu s-a specificat clar formatul output-ului (dashboard web vs Discord bot vs altceva).

**De ce s-a întâmplat:**
Presupunere implicită că e Discord bot (bazat pe proiectele anterioare).

**Regula:**
Nu presupune platforma de output. Întreabă explicit: web app, mobile app, Discord bot, CLI tool, etc.

---

### LEC-003: GitHub Pages vs VPS
**Data:** 2026-02-16

**Ce s-a întâmplat:**
Inițial s-a presupus VPS (DigitalOcean) dar user-ul a preferat GitHub Pages (static hosting).

**De ce s-a întâmplat:**
TECH_STACK.md menționa VPS dar user-ul a specificat GitHub Pages ulterior.

**Regula:**
Confirmă explicit hosting preference înainte de a începe arhitectura.

---

## PATTERN-URI BUNE

### PAT-001: Interogatoriu Exhaustiv
**Data:** 2026-02-16

**Descriere:**
Folosirea ruthless interrogator approach a eliminat majoritatea presupunerilor înainte de a începe documentația.

**Rezultat:**
Documentație canonical completă cu zero ambiguități.

**Aplicare:**
Folosește pentru orice proiect nou cu specificații complexe.

---

### PAT-002: Documentație Canonical
**Data:** 2026-02-16

**Descriere:**
Crearea celor 11 documente (PRD, APP_FLOW, TECH_STACK, etc.) înainte de orice cod.

**Rezultat:**
Zero scope creep, claritate completă, reference point pentru toată dezvoltarea.

**Aplicare:**
Standard pentru toate proiectele non-triviale.

---

## ERORI DE EVITAT

### ERR-001: Nu presupune API availability
- Verifică mereu dacă API-urile necesare sunt disponibile pe free tier
- Confirmă rate limits înainte de arhitectură

### ERR-002: Nu presupune autentificare
- Explicit întreabă: auth required sau public?
- Specifică metoda: password, OAuth, JWT, etc.

### ERR-003: Nu presupune limbă
- Limba default ar trebui specificată explicit
- Include localizare în planificare

---

*Document version: 1.0*  
*Last updated: 2026-02-16*
