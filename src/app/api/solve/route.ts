import { NextRequest, NextResponse } from "next/server";

// Theme lookup — selected server-side based on roll number last digit
const THEMES: Record<string, { name: string; font: string; mono: string; cover: string; accent: string; coverText: string; headerBg: string; headerText: string; sectionBg: string; sectionText: string; codeBg: string; codeText: string; pageBg: string; bodyText: string; tableHeadBg: string; tableHeadText: string; tableEvenBg: string }> = {
  '0': { name: 'Navy', font: 'Georgia, serif', mono: 'Courier New', cover: '#0a1232', accent: '#d4af37', coverText: '#e6e1d2', headerBg: '#0a1232', headerText: '#ffffff', sectionBg: '#e8ecf8', sectionText: '#14235a', codeBg: '#1e2a4a', codeText: '#c8d8f8', pageBg: '#f8f9fc', bodyText: '#1e2337', tableHeadBg: '#0a1232', tableHeadText: '#ffffff', tableEvenBg: '#edf0fa' },
  '1': { name: 'Navy', font: 'Georgia, serif', mono: 'Courier New', cover: '#0a1232', accent: '#d4af37', coverText: '#e6e1d2', headerBg: '#0a1232', headerText: '#ffffff', sectionBg: '#e8ecf8', sectionText: '#14235a', codeBg: '#1e2a4a', codeText: '#c8d8f8', pageBg: '#f8f9fc', bodyText: '#1e2337', tableHeadBg: '#0a1232', tableHeadText: '#ffffff', tableEvenBg: '#edf0fa' },
  '2': { name: 'Green', font: 'Palatino, serif', mono: 'Courier New', cover: '#0c1e14', accent: '#50b478', coverText: '#e1f0e6', headerBg: '#124628', headerText: '#dcf5e6', sectionBg: '#daf0e4', sectionText: '#0f4628', codeBg: '#0e2e1c', codeText: '#a8e6c0', pageBg: '#f7fbf8', bodyText: '#1e3226', tableHeadBg: '#124628', tableHeadText: '#dcf5e6', tableEvenBg: '#e8f7ee' },
  '3': { name: 'Green', font: 'Palatino, serif', mono: 'Courier New', cover: '#0c1e14', accent: '#50b478', coverText: '#e1f0e6', headerBg: '#124628', headerText: '#dcf5e6', sectionBg: '#daf0e4', sectionText: '#0f4628', codeBg: '#0e2e1c', codeText: '#a8e6c0', pageBg: '#f7fbf8', bodyText: '#1e3226', tableHeadBg: '#124628', tableHeadText: '#dcf5e6', tableEvenBg: '#e8f7ee' },
  '4': { name: 'Maroon', font: 'Times New Roman, serif', mono: 'Lucida Console', cover: '#26080e', accent: '#c3a064', coverText: '#f5ead7', headerBg: '#78142a', headerText: '#fff5e6', sectionBg: '#f8ebe4', sectionText: '#640f19', codeBg: '#2e0810', codeText: '#f0c8a0', pageBg: '#fdfaf5', bodyText: '#2d191c', tableHeadBg: '#78142a', tableHeadText: '#fff5e6', tableEvenBg: '#fdf0e8' },
  '5': { name: 'Maroon', font: 'Times New Roman, serif', mono: 'Lucida Console', cover: '#26080e', accent: '#c3a064', coverText: '#f5ead7', headerBg: '#78142a', headerText: '#fff5e6', sectionBg: '#f8ebe4', sectionText: '#640f19', codeBg: '#2e0810', codeText: '#f0c8a0', pageBg: '#fdfaf5', bodyText: '#2d191c', tableHeadBg: '#78142a', tableHeadText: '#fff5e6', tableEvenBg: '#fdf0e8' },
  '6': { name: 'Slate', font: 'Arial, sans-serif', mono: 'Consolas', cover: '#16181e', accent: '#eb6e28', coverText: '#ebebf0', headerBg: '#262a37', headerText: '#f0f0f5', sectionBg: '#f0ebe1', sectionText: '#a04b14', codeBg: '#1a1e2a', codeText: '#ffd0a8', pageBg: '#f8f8fa', bodyText: '#262834', tableHeadBg: '#262a37', tableHeadText: '#f0f0f5', tableEvenBg: '#f2efea' },
  '7': { name: 'Slate', font: 'Arial, sans-serif', mono: 'Consolas', cover: '#16181e', accent: '#eb6e28', coverText: '#ebebf0', headerBg: '#262a37', headerText: '#f0f0f5', sectionBg: '#f0ebe1', sectionText: '#a04b14', codeBg: '#1a1e2a', codeText: '#ffd0a8', pageBg: '#f8f8fa', bodyText: '#262834', tableHeadBg: '#262a37', tableHeadText: '#f0f0f5', tableEvenBg: '#f2efea' },
  '8': { name: 'Purple', font: 'Garamond, serif', mono: 'Courier New', cover: '#120826', accent: '#be9beb', coverText: '#ebe6f8', headerBg: '#37196e', headerText: '#f0ebff', sectionBg: '#eee6ff', sectionText: '#3c1278', codeBg: '#1a0e38', codeText: '#d4b8ff', pageBg: '#faf8ff', bodyText: '#23193a', tableHeadBg: '#37196e', tableHeadText: '#f0ebff', tableEvenBg: '#f4eeff' },
  '9': { name: 'Teal', font: 'Trebuchet MS, sans-serif', mono: 'Courier New', cover: '#082026', accent: '#20b9be', coverText: '#e1f2f4', headerBg: '#0a5a64', headerText: '#dcf8fa', sectionBg: '#d7f2f4', sectionText: '#085864', codeBg: '#071e24', codeText: '#a0e8ec', pageBg: '#f6fcfd', bodyText: '#19323a', tableHeadBg: '#0a5a64', tableHeadText: '#dcf8fa', tableEvenBg: '#e8f9fa' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student, assignmentText } = body;

    if (!student || !student.name || !student.roll || !student.batch || !student.subject || !assignmentText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured. Please set GROQ_API_KEY in .env.local" }, { status: 500 });
    }

    // Select theme based on roll number
    const rollDigits = student.roll.replace(/\D/g, "");
    const lastDigit = rollDigits.length > 0 ? rollDigits[rollDigits.length - 1] : "0";
    const t = THEMES[lastDigit] || THEMES['0'];

    // Build the prompt with EXACT colors baked in (no CSS variables for the model to mess up)
    const prompt = `You are an expert professor for the subject "${student.subject}". Solve the student's assignment completely and thoroughly.

Your output must be a SINGLE, COMPLETE, VALID HTML document. Output NOTHING except HTML — no markdown fences, no explanation.

STUDENT: ${student.name} | ROLL: ${student.roll} | BATCH: ${student.batch} | SUBJECT: ${student.subject} | INSTITUTE: ${student.inst || '—'}

ASSIGNMENT:
${assignmentText.substring(0, 8000)}

═══════════════════════════════
EXACT HTML TO PRODUCE
═══════════════════════════════

<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
@page { size: A4; margin: 15mm; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .cover { page-break-after: always; } }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: ${t.font}; font-size: 11pt; color: ${t.bodyText}; background: ${t.pageBg}; line-height: 1.6; }

/* COVER */
.cover { height: 297mm; width: 210mm; background: ${t.cover}; position: relative; overflow: hidden; padding: 60px 40px 40px 30mm; }
.cover .bar { position: absolute; left: 0; top: 0; width: 8mm; height: 100%; background: ${t.accent}; }
.cover h1 { font-size: 28pt; color: ${t.coverText}; margin-top: 80px; }
.cover .sub { font-size: 13pt; color: ${t.accent}; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
.cover .line { height: 2px; background: linear-gradient(to right, ${t.accent}, transparent); margin: 30px 0; width: 60%; }
.cover .info { display: grid; grid-template-columns: 130px 1fr; gap: 10px 16px; margin-top: 20px; }
.cover .lbl { font-size: 10pt; color: ${t.accent}; font-weight: bold; text-transform: uppercase; }
.cover .val { font-size: 11pt; color: ${t.coverText}; }
.cover .circle { position: absolute; bottom: 40px; right: 40px; width: 120px; height: 120px; border: 3px solid ${t.accent}; border-radius: 50%; opacity: 0.3; }
.cover .circle2 { position: absolute; bottom: 20px; right: 20px; width: 80px; height: 80px; border: 2px solid ${t.accent}; border-radius: 50%; opacity: 0.15; }

/* HEADER BAR */
.hdr { background: ${t.headerBg}; color: ${t.headerText}; padding: 8px 16px; font-size: 9pt; margin-bottom: 20px; display: flex; justify-content: space-between; }

/* SECTION HEADINGS */
.sec { background: ${t.sectionBg}; color: ${t.sectionText}; padding: 10px 16px; border-left: 4px solid ${t.accent}; border-radius: 0 6px 6px 0; font-size: 14pt; font-weight: bold; margin: 24px 0 16px; }

/* QUESTION */
.q { font-weight: bold; color: ${t.sectionText}; font-size: 12pt; margin: 20px 0 10px; padding-bottom: 4px; border-bottom: 2px solid ${t.accent}; }

/* TABLES */
table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
th { background: ${t.tableHeadBg}; color: ${t.tableHeadText}; padding: 8px; text-align: center; }
td { padding: 6px 8px; text-align: center; border: 1px solid #ddd; }
tr:nth-child(even) { background: ${t.tableEvenBg}; }

/* CODE */
pre { background: ${t.codeBg}; color: ${t.codeText}; padding: 14px 16px; border-left: 4px solid ${t.accent}; border-radius: 4px; font-family: ${t.mono}, monospace; font-size: 10pt; overflow-x: auto; margin: 12px 0; white-space: pre-wrap; }

/* KEY CONCEPT */
.tip { background: ${t.sectionBg}; border-left: 4px solid ${t.accent}; padding: 10px 14px; margin: 12px 0; border-radius: 4px; font-style: italic; font-size: 10pt; }

.content { padding: 10px 20px 40px; }
p, ul, ol { margin: 8px 0; }
li { margin-left: 20px; }
</style></head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="bar"></div>
  <h1>${student.subject}</h1>
  <div class="sub">Assignment Solution</div>
  <div class="line"></div>
  <div class="info">
    <span class="lbl">Name</span><span class="val">${student.name}</span>
    <span class="lbl">Roll No.</span><span class="val">${student.roll}</span>
    <span class="lbl">Batch</span><span class="val">${student.batch}</span>
    <span class="lbl">Subject</span><span class="val">${student.subject}</span>
    <span class="lbl">Institute</span><span class="val">${student.inst || '—'}</span>
  </div>
  <div class="circle"></div>
  <div class="circle2"></div>
</div>

<!-- SOLUTION — YOUR JOB: Fill in complete, detailed solutions below -->
<div class="content">
  <div class="hdr"><span>${student.subject}</span><span>${student.name} · ${student.roll}</span></div>

  <!-- USE THESE CSS CLASSES:
    <div class="sec">Section Title</div>
    <div class="q">Question N:</div>
    <table><tr><th>...</th></tr><tr><td>...</td></tr></table>
    <pre>code here</pre>
    <div class="tip">Key concept note</div>
    <p>paragraph text</p>
  -->

  <!-- SOLVE EVERY QUESTION COMPLETELY. Show full truth tables, circuit descriptions, and Verilog code where needed. -->

</div>
</body></html>

═══════════════════════════════
RULES
═══════════════════════════════
1. Output the COMPLETE HTML document — the cover page HTML above is ALREADY written for you. Copy it exactly, then ADD your solutions inside the <div class="content"> section.
2. Solve EVERY question extremely thoroughly. elaborate on the answers, explain the steps clearly, provide circuit descriptions, and show full truth tables. A professor should be highly impressed by the level of detail.
3. Use the exact CSS classes shown: .sec, .q, table, pre, .tip, p
4. For ANY Verilog code requested, you MUST provide BOTH a "design.sv" and a "testbench.sv".
5. The Verilog testbench MUST be EDA Playground friendly and INCLUDE waveform dumping code inside an initial block:
    initial begin
      $dumpfile("dump.vcd");
      $dumpvars;
    end
6. For Verilog code, add a module header comment with student name, roll, batch, subject.
7. All wire names must be descriptive (not w1, w2).
8. Truth tables must be COMPLETE — show ALL rows.
9. No LaTeX. Plain text and HTML only.
10. Do NOT include any branding, footer, "study reference", theme names, AI credits, or assignment objectives section.
11. No markdown code fences. Raw HTML only.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert professor. Output ONLY a complete HTML document. No markdown, no explanation, no code fences. Start with <!DOCTYPE html> and end with </html>.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 32768,
        temperature: 0.3
      })
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Groq API error: ${groqResponse.status}`);
    }

    const data = await groqResponse.json();
    let solution = data.choices?.[0]?.message?.content || "No solution generated.";

    // Strip markdown code fences if the model wraps the HTML in them
    solution = solution.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

    return NextResponse.json({
      success: true,
      solution: solution
    });

  } catch (error) {
    console.error("Error processing assignment:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
