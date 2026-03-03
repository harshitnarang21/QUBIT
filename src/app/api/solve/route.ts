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

        // Initialize Gemini
        const ai = new GoogleGenAI({ apiKey: "AIzaSyB15eBt1vNRMqJcmeIwjBVXKwh6fn2T2IA" });

        const promptTemplate = `You are an expert Digital Design professor. Solve the student's assignment completely.
Your response will be directly converted to a PDF and submitted — it must be 100% clean,
professional, and publication-ready. Zero tolerance for messy output.

STUDENT INFORMATION:
- Name: {{STUDENT_NAME}}
- Roll Number: {{ROLL_NUMBER}}
- Batch / Section: {{BATCH}}
- Subject: {{SUBJECT}}
- Institute: {{INSTITUTE}}

ASSIGNMENT CONTENT:
{{ASSIGNMENT_TEXT}}

═══════════════════════════════════════════════
ABSOLUTE RULES — VIOLATING ANY OF THESE IS NOT ALLOWED
═══════════════════════════════════════════════

RULE 1 — NO THINKING OUT LOUD
Never write your reasoning process, trial-and-error, self-corrections, or working notes
anywhere in the output. The following types of lines are STRICTLY FORBIDDEN:
  ✗ "Let's try...", "Wait, that's wrong...", "Let me reconsider..."
  ✗ "This is not right.", "Actually...", "No, this is incorrect."
  ✗ "A simpler approach would be...", "We can also use..."
  ✗ Any comment that says something was wrong or is being corrected
  ✗ Any line that shows you changing your mind mid-answer
Only write the FINAL, CORRECT answer. Never show working doubts.

RULE 2 — VERILOG CODE MUST BE PERFECT
  ✗ NEVER put reasoning, confusion, or trial-and-error inside code comments
  ✗ NEVER declare wires or variables in the middle of the module — ALL wire/reg
    declarations go at the TOP of the module, before any gate instantiations
  ✗ NEVER write comments like "// this may not be right" or "// let's try this"
  ✓ Every comment must be a clean, factual description of what that specific line does
  ✓ Every module MUST have the student header block shown below
  ✓ All signal names must be meaningful (not just w1, w2, w3... — use descriptive names
    like xor_ab, borrow_a_not, etc.)

RULE 3 — NO REDUNDANT DERIVATIONS
  ✗ Do NOT repeat the same Boolean expression 4-5 times with minor changes
  ✗ Do NOT show multiple failed simplification attempts
  ✓ Show the derivation ONCE, cleanly, step by step to the final answer

RULE 4 — NO FILLER TEXT
  ✗ Do not start answers with "Great question!" or "Certainly!" or similar phrases
  ✗ Do not repeat the question back before answering it

═══════════════════════════════════════════════
FORMATTING RULES
═══════════════════════════════════════════════

STRUCTURE:
  ## Introduction
  [2–3 sentences about the subject and what this assignment covers]

  **Question [N]: [Title]**
  [Complete solution]
  **Key Concept:** [One clean sentence summarizing the core idea]

  ## Conclusion
  [2–3 sentence summary]

TRUTH TABLES — use this exact format:
  | A | B | Bin | D | Bout |
  |---|---|-----|---|------|
  | 0 | 0 |  0  | 0 |  0   |
  (fill all rows completely, no skipping)

BOOLEAN EXPRESSIONS:
  - One expression per line
  - Show simplification steps clearly and ONCE only
  - Use plain text: A', A XOR B, A XNOR B (no LaTeX, no $...$ symbols)
  - Example: Bout = A'B + A'Bin + BBin

K-MAPS:
  - State number of variables
  - List minterms clearly
  - Describe each group (pair/quad/octet) in ONE line each
  - Write the final simplified expression

VERILOG DESIGN MODULE — every module must follow this exact structure:

  // ============================================================
  // Module     : [module_name]
  // Student    : {{STUDENT_NAME}}
  // Roll No.   : {{ROLL_NUMBER}}
  // Batch      : {{BATCH}}
  // Subject    : {{SUBJECT}}
  // Description: [one clean sentence describing the module]
  // ============================================================
  module module_name (
      input  wire A,        // [what this input represents]
      input  wire B,        // [what this input represents]
      output wire D         // [what this output represents]
  );

      // ── Wire Declarations ──────────────────────────────────
      wire [descriptive_name];   // [what this wire carries]
      wire [descriptive_name];   // [what this wire carries]
      // (ALL wires declared here, before any logic)

      // ── [Section Name e.g. "Difference Logic"] ─────────────
      [gate instantiations with one-line comment each]

      // ── [Section Name e.g. "Borrow-out Logic"] ─────────────
      [gate instantiations with one-line comment each]

  endmodule // end of module [module_name]

VERILOG TESTBENCH — every testbench must follow this structure:

  // ============================================================
  // Module     : tb_[module_name]
  // Student    : {{STUDENT_NAME}}
  // Roll No.   : {{ROLL_NUMBER}}
  // Batch      : {{BATCH}}
  // Subject    : {{SUBJECT}}
  // Description: Testbench for [module_name]. Tests all [N] input combinations.
  // ============================================================
  module tb_[module_name];

      // ── Inputs ─────────────────────────────────────────────
      reg A;    // [description]

      // ── Outputs ────────────────────────────────────────────
      wire D;   // [description]

      // ── UUT Instantiation ───────────────────────────────────
      [module_name] uut ( .A(A), .D(D) );

      // ── Test Vectors ────────────────────────────────────────
      initial begin
          $display("=== [Module Name] Testbench ===");
          // [test cases with expected value comments]
          $finish;
      end

      // ── Signal Monitor ──────────────────────────────────────
      initial begin
          $monitor("[format string]", $time, [signals]);
      end

  endmodule // end of module tb_[module_name]

SIMULATION WAVEFORM TABLE — after every testbench, include:
  | Time (ns) | A | B | [inputs] | D | [outputs] | Expected |
  |-----------|---|---|----------|---|-----------|----------|
  | [values for every test case] |
  Then one line: "Output matches truth table — design verified. ✓"

═══════════════════════════════════════════════
NAND GATE IMPLEMENTATION RULES (IMPORTANT)
═══════════════════════════════════════════════

When implementing circuits using only NAND gates:

1. First write the standard Boolean expressions (already known)
2. Apply De Morgan's theorem ONCE to convert to NAND form, step by step
3. Draw a clear gate-level diagram description (numbered gates, labeled wires)
4. Then write the Verilog code using the EXACT structure above
5. Use DESCRIPTIVE wire names:
   ✓ nand_ab, not_a, xor_ab_intermediate, borrow_term1
   ✗ w1, w2, w3, w4, w5

Standard NAND equivalents (use these directly, do not re-derive them):
  NOT A      →  nand(out, A, A)
  A AND B    →  wire t; nand(t,A,B); nand(out,t,t)
  A OR B     →  wire na,nb; nand(na,A,A); nand(nb,B,B); nand(out,na,nb)
  A XOR B    →  wire t,ta,tb; nand(t,A,B); nand(ta,A,t); nand(tb,B,t); nand(out,ta,tb)

═══════════════════════════════════════════════
FINAL CHECKLIST (verify before writing output)
═══════════════════════════════════════════════

Before writing your response, confirm:
  ☑ No reasoning leakage or self-corrections anywhere in the output
  ☑ All wire declarations are at the TOP of every module
  ☑ Every Verilog comment describes what the line DOES, not what you're "trying"
  ☑ Boolean derivations shown cleanly, ONCE, no re-attempts
  ☑ Student name {{STUDENT_NAME}} appears in every module header
  ☑ All truth tables are complete with no rows missing
  ☑ Simulation waveform table included after every testbench
  ☑ No LaTeX, no dollar signs, no \\frac{} anywhere`;

        const finalPrompt = promptTemplate
            .replace(/{{STUDENT_NAME}}/g, student.name)
            .replace(/{{ROLL_NUMBER}}/g, student.roll)
            .replace(/{{BATCH}}/g, student.batch)
            .replace(/{{SUBJECT}}/g, student.subject)
            .replace(/{{INSTITUTE}}/g, student.inst || '—')
            .replace('{{ASSIGNMENT_TEXT}}', assignmentText.substring(0, 8000));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: finalPrompt
        });

        const solution = response.text || "No solution generated.";

        return NextResponse.json({
            success: true,
            solution: solution
        });

    } catch (error) {
        console.error("Error processing assignment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
