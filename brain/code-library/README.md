# Code Library

## Overview
Reusable code snippets and patterns for common CRO implementations.

## Structure
Organise snippets by category:

```
code-library/
├── README.md
├── modals/
├── sticky-bars/
├── form-optimisation/
├── social-proof/
├── urgency-scarcity/
└── utilities/
```

## Naming Convention
- Use kebab-case for file names
- Prefix with the testing platform if platform-specific (e.g., `vwo-modal-trigger.js`)
- Include a comment header in each snippet with: description, author, date, and client (if applicable)

## Snippet Header Template
```javascript
/**
 * Snippet: [Name]
 * Description: [What it does]
 * Platform: [VWO / Optimizely / Custom]
 * Author: [Name]
 * Date: [YYYY-MM-DD]
 */
```

## Usage
1. Browse the relevant category folder
2. Copy the snippet into your test variation
3. Adapt selectors, copy, and styling to the client's site
4. QA thoroughly before launch (see `brain/qa-checklist.md`)
