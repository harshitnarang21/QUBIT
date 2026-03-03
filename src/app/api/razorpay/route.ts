import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: "rzp_live_SMrFP7iMMZCvt5",
    key_secret: "bGUtWH6DugBfvnqIuOEeIK74",
});

export async function POST(req: NextRequest) {
    try {
        const { amount } = await req.json();

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
