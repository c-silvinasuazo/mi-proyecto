---
id: REG-220
title: The embed scrolls in Safari and stays centered
level: Extended
area: Public site
bugs: [ENG-118, ENG-2178]
last_run: passed
automation: 🟡 placeholder — `tests/eph/public-site.spec.ts`
---

# REG-220 — The embed scrolls in Safari and stays centered

## What to verify

The embed scrolls in Safari and stays centered

Prevents the return of: ENG-2178, ENG-118

## Automation

🟡 placeholder — `tests/eph/public-site.spec.ts`

## Last run

✅ 2026-11-03 (production, qaengreminders on Boost; embed code from Settings → Appearance on a test page served from localhost): in Safari (and Chrome) the embedded schedule loads, scrolls through to the end of the page and stays centered in its container, also after resizing the window. Note: the embed doesn't load when the test page is opened directly from Finder as a local file; serve it over http

---

Source: [Test Cases and Regression Suite — QA](https://app.notion.com/p/schedhub/Test-Cases-and-Regression-Suite-QA-3f9aa2cdf66a8188ab57cd6ac103451e) (Notion), exported 2026-11-09.
