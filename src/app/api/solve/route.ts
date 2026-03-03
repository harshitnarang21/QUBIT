import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const name = formData.get("name") as string;
        const rollNo = formData.get("rollNo") as string;
        const batch = formData.get("batch") as string;
        const file = formData.get("file") as File;

        if (!name || !rollNo || !batch || !file) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // In a real application, we would call the Gemini API here:
        const fileBuffer = await file.arrayBuffer();

        // Initialize Gemini
        const ai = new GoogleGenAI({ apiKey: "AIzaSyB15eBt1vNRMqJcmeIwjBVXKwh6fn2T2IA" });

        let solution = "";

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                inlineData: {
                                    data: Buffer.from(fileBuffer).toString("base64"),
                                    mimeType: file.type,
                                }
                            },
                            {
                                text: `You are an expert professor of Digital Design and Digital Electronics with 20+ years of teaching experience. A student has submitted their assignment for a complete, well-formatted solution.

STUDENT INFORMATION:
- Name: ${name}
- Roll Number: ${rollNo}
- Batch / Section: ${batch}
- Subject: Digital Design
- Institute: University

ASSIGNMENT CONTENT:
Please solve the questions found in the attached document.

---

INSTRUCTIONS FOR SOLVING:

Solve every question found in the assignment above. Follow ALL formatting and content rules below strictly.

---

FORMATTING RULES:

1. SECTION HEADINGS
   Use ## for main sections (e.g., ## Introduction, ## Conclusion)
   Use ### for sub-sections if needed

2. QUESTIONS
   Format each question as:
   **Question [number]: [Question Title or Brief Description]**
   Then write the full solution below it.

3. BOOLEAN EXPRESSIONS & LOGIC
   - Write Boolean expressions clearly in plain text
   - Example: F = A'B + AB'C, Y = (A + B)'·C
   - Clearly show each step of simplification

4. TRUTH TABLES
   Format using plain text with pipe separators, like:
   
   | A | B | C | Output F |
   |---|---|---|----------|
   | 0 | 0 | 0 |    0     |
   | 0 | 0 | 1 |    1     |
   (complete all rows)

5. K-MAPS (KARNAUGH MAPS)
   - State the number of variables
   - List the minterms / maxterms
   - Describe all groups (pairs, quads, octets) clearly
   - Show the simplified Boolean expression as the final result
   - Example: "Group 1 (Quad): cells 0,1,4,5 → eliminates B and C → gives A'"

6. LOGIC CIRCUITS
   - Describe gate connections step by step
   - Name each gate clearly (AND, OR, NOT, NAND, NOR, XOR, XNOR)
   - Describe input-to-output signal flow
   - Example: "Input A and B' feed into AND gate G1, output of G1 and C feed into OR gate G2..."

7. FLIP-FLOPS & SEQUENTIAL CIRCUITS
   - Show the excitation table if relevant
   - Show state transition table
   - Describe Q(next) equations clearly

8. NUMBER SYSTEM CONVERSIONS
   - Show every step of the conversion
   - Label each step clearly (e.g., "Step 1: Divide by 2...")

9. VERILOG CODE (CRITICAL RULE)
   - Every Verilog module must include a header comment block at the top exactly like this:

   // ============================================================
   // Module     : [module name]
   // Student    : ${name}
   // Roll No.   : ${rollNo}
   // Batch      : ${batch}
   // Subject    : Digital Design
   // Description: [brief description of what this module does]
   // ============================================================

   - All major sections inside the code (ports, wires, always blocks, assign statements) must have inline comments explaining what they do
   - Variable and signal names must be meaningful and clearly named
   - Every endmodule must have a comment: // end of module [module name]

10. EXPLANATIONS
    - After every answer, add a short "Key Concept" note:
    - Example: **Key Concept:** A Full Adder adds three 1-bit inputs and produces a Sum and Carry output.

---

STRUCTURE OF YOUR RESPONSE:

## Introduction
[2–3 sentences introducing the subject and what this assignment covers]

**Question 1: [Title]**
[Full detailed solution with proper formatting as described above]

**Question 2: [Title]**
[Full detailed solution]

... (continue for all questions found)

## Conclusion
[2–3 sentences summarizing the key topics covered in this assignment]

---

IMPORTANT RULES:
- Do NOT skip any question found in the assignment
- Do NOT use LaTeX formatting (no $...$ or frac{}{})
- Write all math in plain readable text
- Be thorough and academically correct
- If a question is unclear, state your assumption clearly before solving
- Always use the student's name in ALL Verilog code comments — never leave it generic`
                            }
                        ]
                    }
                ]
            });
            solution = response.text || "No solution generated.";
        } catch (apiError) {
            console.error("Gemini API Error:", apiError);
            return NextResponse.json({ error: "Failed to generate solution from AI" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                name,
                rollNo,
                batch,
                solution: solution
            }
        });

    } catch (error) {
        console.error("Error processing assignment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
