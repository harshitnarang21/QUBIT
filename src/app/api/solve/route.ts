import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student, assignmentText } = body;

    if (!student || !student.name || !student.roll || !student.batch || !student.subject || !assignmentText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "PASTE_YOUR_NEW_GEMINI_API_KEY_HERE") {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Compute last digit of roll number for theme selection
    const rollDigits = student.roll.replace(/\D/g, "");
    const lastDigit = rollDigits.length > 0 ? rollDigits[rollDigits.length - 1] : "0";

    const promptTemplate = `You are an expert Digital Design professor. Solve the student's assignment completely.
Your ENTIRE response must be a single, complete, valid HTML document with embedded CSS.
Output NOTHING except the HTML — no explanation, no markdown, no preamble.

STUDENT INFORMATION:
- Name: {{STUDENT_NAME}}
- Roll Number: {{ROLL_NUMBER}}
- Batch / Section: {{BATCH}}
- Subject: {{SUBJECT}}
- Institute: {{INSTITUTE}}

ASSIGNMENT CONTENT:
{{ASSIGNMENT_TEXT}}

════════════════════════════════════════
THEME SELECTION RULE
════════════════════════════════════════

Take the last digit of the roll number: {{LAST_DIGIT_OF_ROLL}}

Map it to a theme:
  0, 1 → Theme A: Classic Navy      (cover: #0a1232, accent: #d4af37)
  2, 3 → Theme B: Forest Green      (cover: #0c1e14, accent: #50b478)
  4, 5 → Theme C: Maroon University (cover: #26080e, accent: #c3a064)
  6, 7 → Theme D: Slate & Orange    (cover: #16181e, accent: #eb6e28)
  8    → Theme E: Purple Elegant    (cover: #120826, accent: #be9beb)
  9    → Theme F: Teal Modern       (cover: #082026, accent: #20b9be)

Use ONLY the selected theme's colors throughout the entire document.

════════════════════════════════════════
HTML DOCUMENT STRUCTURE — FOLLOW EXACTLY
════════════════════════════════════════

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>

/* === PAGE SETUP === */
@page { size: A4; margin: 15mm 15mm 20mm 15mm; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cover { page-break-after: always; }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: [choose based on theme]; font-size: 11pt; }

/* === COVER PAGE === */
/* Full A4 dark page with left accent bar, student info grid, decorative circle */
/* height: 297mm; width: 210mm; position: relative; overflow: hidden */

/* === PAGE HEADER === */
/* Colored bar at top of every solution page showing: Subject · Name · Roll No. */

/* === SECTION HEADINGS (## in solution) === */
/* Pill-shaped colored background, left border in accent color */

/* === QUESTION HEADINGS (**Question N:**) === */
/* Slightly smaller, bold, accent color text, bottom border line */

/* === TRUTH TABLES === */
/* Full-width, striped rows, colored header row using theme header color */

/* === VERILOG CODE BLOCKS === */
/* Dark background, left accent border 4px, monospace font */

/* === KEY CONCEPT BOXES === */
/* Light accent background, left border, italic text, rounded corners */

/* NO PAGE FOOTER. Do NOT include any footer element. */

</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <!-- Left accent bar (8px wide, full height, accent color) -->
  <!-- Subject title large, "Assignment Solution" subtitle -->
  <!-- Divider line in accent color -->
  <!-- Student info grid: label | value for each field -->
  <!-- Decorative circles bottom-right -->
  <!-- NO footer. NO branding. NO theme name. -->
</div>

<!-- SOLUTION PAGES -->
<div class="solution-body">
  <!-- Page header bar -->
  <!-- Jump straight into solving questions. Do NOT write assignment objectives. -->
</div>

</body>
</html>

════════════════════════════════════════
FONT SELECTION PER THEME
════════════════════════════════════════

Theme A (Classic Navy)     → body: 'Georgia, serif'       mono: 'Courier New'
Theme B (Forest Green)     → body: 'Palatino, serif'      mono: 'Courier New'
Theme C (Maroon University)→ body: 'Times New Roman'      mono: 'Lucida Console'
Theme D (Slate & Orange)   → body: 'Arial, sans-serif'    mono: 'Consolas'
Theme E (Purple Elegant)   → body: 'Garamond, serif'      mono: 'Courier New'
Theme F (Teal Modern)      → body: 'Trebuchet MS'         mono: 'Courier New'

════════════════════════════════════════
THEME COLOR VARIABLES — USE FOR ALL ELEMENTS
════════════════════════════════════════

For your selected theme, define and use these exact CSS custom property values.

Theme A — Classic Navy:
  --cover-bg:#0a1232 --cover-accent:#d4af37 --cover-text:#e6e1d2
  --header-bg:#0a1232 --header-text:#ffffff --section-bg:#e8ecf8 --section-text:#14235a
  --code-bg:#1e2a4a --code-text:#c8d8f8 --code-comment:#8a9e6a
  --body-text:#1e2337 --page-bg:#f8f9fc --accent-line:#d4af37
  --table-head-bg:#0a1232 --table-head-txt:#ffffff --table-even-bg:#edf0fa
  --key-concept-bg:#e8ecf8

Theme B — Forest Green:
  --cover-bg:#0c1e14 --cover-accent:#50b478 --cover-text:#e1f0e6
  --header-bg:#124628 --header-text:#dcf5e6 --section-bg:#daf0e4 --section-text:#0f4628
  --code-bg:#0e2e1c --code-text:#a8e6c0 --code-comment:#6abf88
  --body-text:#1e3226 --page-bg:#f7fbf8 --accent-line:#50b478
  --table-head-bg:#124628 --table-head-txt:#dcf5e6 --table-even-bg:#e8f7ee
  --key-concept-bg:#daf0e4

Theme C — Maroon University:
  --cover-bg:#26080e --cover-accent:#c3a064 --cover-text:#f5ead7
  --header-bg:#78142a --header-text:#fff5e6 --section-bg:#f8ebe4 --section-text:#640f19
  --code-bg:#2e0810 --code-text:#f0c8a0 --code-comment:#a08848
  --body-text:#2d191c --page-bg:#fdfaf5 --accent-line:#c3a064
  --table-head-bg:#78142a --table-head-txt:#fff5e6 --table-even-bg:#fdf0e8
  --key-concept-bg:#f8ebe4

Theme D — Slate & Orange:
  --cover-bg:#16181e --cover-accent:#eb6e28 --cover-text:#ebebf0
  --header-bg:#262a37 --header-text:#f0f0f5 --section-bg:#f0ebe1 --section-text:#a04b14
  --code-bg:#1a1e2a --code-text:#ffd0a8 --code-comment:#a0b870
  --body-text:#262834 --page-bg:#f8f8fa --accent-line:#eb6e28
  --table-head-bg:#262a37 --table-head-txt:#f0f0f5 --table-even-bg:#f2efea
  --key-concept-bg:#f0ebe1

Theme E — Purple Elegant:
  --cover-bg:#120826 --cover-accent:#be9beb --cover-text:#ebe6f8
  --header-bg:#37196e --header-text:#f0ebff --section-bg:#eee6ff --section-text:#3c1278
  --code-bg:#1a0e38 --code-text:#d4b8ff --code-comment:#8a9e6a
  --body-text:#23193a --page-bg:#faf8ff --accent-line:#be9beb
  --table-head-bg:#37196e --table-head-txt:#f0ebff --table-even-bg:#f4eeff
  --key-concept-bg:#eee6ff

Theme F — Teal Modern:
  --cover-bg:#082026 --cover-accent:#20b9be --cover-text:#e1f2f4
  --header-bg:#0a5a64 --header-text:#dcf8fa --section-bg:#d7f2f4 --section-text:#085864
  --code-bg:#071e24 --code-text:#a0e8ec --code-comment:#70a878
  --body-text:#19323a --page-bg:#f6fcfd --accent-line:#20b9be
  --table-head-bg:#0a5a64 --table-head-txt:#dcf8fa --table-even-bg:#e8f9fa
  --key-concept-bg:#d7f2f4

════════════════════════════════════════
CSS RULES — WRITE ALL OF THESE
════════════════════════════════════════

COVER PAGE:
  - Full A4 height: height: 297mm; width: 210mm; overflow: hidden
  - background: var(--cover-bg)
  - Left accent bar: position absolute, width 8mm, height 100%, background: var(--cover-accent)
  - Content starts at margin-left: 22mm
  - DO NOT include any theme badge or theme name anywhere
  - Subject title: font-size 30pt, font-weight bold, color: var(--cover-text)
  - "ASSIGNMENT SOLUTION" subtitle: font-size 14pt, color: var(--cover-accent), letter-spacing 1px
  - Horizontal divider: height 1px, background: linear-gradient(to right, accent, transparent)
  - Student info: display grid, grid-template-columns: 130px 1fr
  - NO cover footer. NO branding text of any kind.

SOLUTION PAGES:
  - background: var(--page-bg)
  - Page header: background var(--header-bg), color var(--header-text)

HEADINGS:
  - background: var(--section-bg), color: var(--section-text)
  - border-left: 4px solid var(--accent-line), border-radius: 0 6px 6px 0

TRUTH TABLES:
  - Full width, striped rows, colored header row, centered text

VERILOG CODE BLOCKS:
  - background: var(--code-bg), border-left: 4px solid accent
  - Monospace font, syntax-colored comments

KEY CONCEPT BOXES:
  - background: var(--key-concept-bg), border-left: 4px solid accent, italic

NO FOOTER:
  - Do NOT include any footer element.
  - Do NOT write any branding, product names, AI credits, theme names, or "study reference" text anywhere.

════════════════════════════════════════
CONTENT RULES
════════════════════════════════════════

RULE 1 — NO THINKING OUT LOUD
Never write your reasoning process. No self-corrections mid-answer.
Only write the FINAL correct answer.

RULE 2 — NO ASSIGNMENT OBJECTIVES
Do NOT include any "Assignment Objectives" or "Learning Objectives" section.
Jump straight into solving the questions.

RULE 3 — VERILOG CODE
Every module header:
  // ============================================================
  // Module     : [module_name]
  // Student    : {{STUDENT_NAME}}
  // Roll No.   : {{ROLL_NUMBER}}
  // Batch      : {{BATCH}}
  // Subject    : {{SUBJECT}}
  // Description: [one clean sentence]
  // ============================================================
All wire declarations at TOP. Descriptive names only (no w1, w2, w3).

RULE 4 — NAND EQUIVALENTS (use directly)
  NOT A    → nand(out, A, A)
  A AND B  → wire t; nand(t,A,B); nand(out,t,t)
  A OR B   → wire na,nb; nand(na,A,A); nand(nb,B,B); nand(out,na,nb)
  A XOR B  → wire t,ta,tb; nand(t,A,B); nand(ta,A,t); nand(tb,B,t); nand(out,ta,tb)

RULE 5 — Complete tables, no rows missing.
RULE 6 — No LaTeX. Plain text only.

════════════════════════════════════════
ABSOLUTELY FORBIDDEN CONTENT
════════════════════════════════════════
Do NOT include ANY of the following anywhere in the HTML output:
  ✗ Any product name, brand name, or company name
  ✗ "Powered by" credits of any kind
  ✗ "Study reference only" or similar disclaimers
  ✗ Theme name display (no "Classic Navy", "Forest Green", etc.)
  ✗ "Assignment Objectives" or "Learning Objectives" section
  ✗ Any footer bar with branding
  ✗ Any AI attribution

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════

Your output must be:
  A complete, valid HTML file starting with <!DOCTYPE html>
  All CSS embedded inside <style> tags
  One cover page div, then all solution content
  Nothing outside the HTML — no markdown, no explanation
  The HTML must render perfectly when printed to PDF from a browser (Ctrl+P / Save as PDF)
  Beautiful enough that a student would be proud to submit it`;

    const finalPrompt = promptTemplate
      .replace(/{{STUDENT_NAME}}/g, student.name)
      .replace(/{{ROLL_NUMBER}}/g, student.roll)
      .replace(/{{BATCH}}/g, student.batch)
      .replace(/{{SUBJECT}}/g, student.subject)
      .replace(/{{INSTITUTE}}/g, student.inst || '\u2014')
      .replace(/{{LAST_DIGIT_OF_ROLL}}/g, lastDigit)
      .replace('{{ASSIGNMENT_TEXT}}', assignmentText.substring(0, 8000));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt
    });

    let solution = response.text || "No solution generated.";

    // Strip markdown code fences if Gemini wraps the HTML in them
    solution = solution.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    return NextResponse.json({
      success: true,
      solution: solution
    });

  } catch (error) {
    console.error("Error processing assignment:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
