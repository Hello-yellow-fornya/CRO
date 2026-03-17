# CRO Scoring Model

## Overview
The scoring model is used to evaluate and prioritise test ideas based on their potential impact, confidence, and effort.

## ICE Framework

Each test idea is scored on three dimensions (1–10):

| Dimension   | Definition                                                        |
|-------------|-------------------------------------------------------------------|
| **Impact**  | How much will this move the primary KPI if it wins?               |
| **Confidence** | How confident are we this will win, based on evidence?         |
| **Ease**    | How easy is this to implement and launch?                         |

**ICE Score** = (Impact + Confidence + Ease) / 3

## Scoring Guidelines

### Impact (1–10)
- **9–10**: Directly affects primary conversion event on high-traffic page
- **6–8**: Affects secondary conversion or medium-traffic page
- **3–5**: Affects micro-conversion or low-traffic page
- **1–2**: Minor UX polish with no clear conversion tie

### Confidence (1–10)
- **9–10**: Backed by user research, analytics data, and competitive evidence
- **6–8**: Supported by analytics or heuristic review
- **3–5**: Based on best practice or gut feel
- **1–2**: Pure speculation

### Ease (1–10)
- **9–10**: Copy/content change only, no dev needed
- **6–8**: Front-end change, minimal dev effort
- **3–5**: Requires back-end changes or third-party integration
- **1–2**: Major rebuild or cross-team dependency

## Usage
Score every test idea before adding it to the roadmap. Prioritise highest ICE scores first, adjusting for strategic client goals where needed.
