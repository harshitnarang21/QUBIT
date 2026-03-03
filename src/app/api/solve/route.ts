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
                                text: "You are an expert Digital Design and Computer Science Tutor. Please solve all the questions presented in this assignment document. Provide step-by-step, clear, and perfectly formatted text explanations. If there are boolean equations, k-maps, or logic circuit designs, explain them clearly in text format suitable for a PDF report without markdown formatting (do not use * or # or \`\`). Your output will go directly into a student's generated assignment PDF."
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
