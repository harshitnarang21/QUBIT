"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { UploadCloud, CheckCircle, ArrowRight, Loader2, QrCode } from "lucide-react";
import { generateAssignmentPDF } from "@/utils/pdfGenerator";
import Script from "next/script";

export default function SolvePage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        rollNo: "",
        batch: "",
        file: null as File | null,
        utr: "",
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [solutionData, setSolutionData] = useState<any>(null);

    const handleNext = () => {
        if (step === 1) {
            if (!formData.name || !formData.rollNo || !formData.batch) {
                setError("Please fill all fields.");
                return;
            }
        } else if (step === 2) {
            if (!formData.file) {
                setError("Please upload a file.");
                return;
            }
        } else if (step === 3) {
            // handleRazorpayPayment(); // COMMENTED OUT FOR TESTING
            processAssignment();
            return;
        }
        setError("");
        setStep(step + 1);
    };

    const handleRazorpayPayment = async () => {
        try {
            const res = await fetch("/api/razorpay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 10 }), // ₹10 fee
            });

            if (!res.ok) throw new Error("Could not initialize Razorpay");

            const { order } = await res.json();

            const options = {
                key: "rzp_live_SMrFP7iMMZCvt5",
                amount: order.amount,
                currency: order.currency,
                name: "Quubit Solver",
                description: "Digital Design Assignment Processing Fee",
                order_id: order.id,
                handler: function (response: any) {
                    processAssignment();
                },
                prefill: {
                    name: formData.name,
                },
                theme: {
                    color: "#3b82f6",
                },
            };

            // @ts-ignore
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                setError("Payment Failed. Please try again.");
            });
            rzp1.open();

        } catch (error) {
            console.error("Razorpay error", error);
            setError("Could not initialize payment Gateway.");
        }
    };

    const processAssignment = async () => {
        setIsProcessing(true);
        setStep(4);

        try {
            const formPayLoad = new FormData();
            formPayLoad.append("name", formData.name);
            formPayLoad.append("rollNo", formData.rollNo);
            formPayLoad.append("batch", formData.batch);
            formPayLoad.append("utr", formData.utr);
            if (formData.file) {
                formPayLoad.append("file", formData.file);
            }

            const response = await fetch("/api/solve", {
                method: "POST",
                body: formPayLoad,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to process assignment");
            }

            setSolutionData(result.data);
            setStep(5);
        } catch (err: any) {
            setError(err.message || "An error occurred during processing.");
            setStep(3);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (solutionData) {
            generateAssignmentPDF(
                solutionData.name,
                solutionData.rollNo,
                solutionData.batch,
                solutionData.solution
            );
        }
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className={styles.container}>
                <div className={`glass ${styles.formCard}`}>
                    <div className={styles.progress}>
                        <div className={styles.progressSteps}>
                            <div className={`${styles.stepIndicator} ${step >= 1 ? styles.active : ""}`}>1</div>
                            <div className={`${styles.stepLine} ${step >= 2 ? styles.activeLine : ""}`} />
                            <div className={`${styles.stepIndicator} ${step >= 2 ? styles.active : ""}`}>2</div>
                            <div className={`${styles.stepLine} ${step >= 3 ? styles.activeLine : ""}`} />
                            <div className={`${styles.stepIndicator} ${step >= 3 ? styles.active : ""}`}>3</div>
                        </div>
                        <h2 className={styles.stepTitle}>
                            {step === 1 && "Student Details"}
                            {step === 2 && "Upload Assignment"}
                            {step === 3 && "Payment"}
                            {step === 4 && "Processing Solution"}
                            {step === 5 && "Ready to Download"}
                        </h2>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.stepContent}>
                        {step === 1 && (
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Paras"
                                    className={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <label>Roll Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 21BCE1234"
                                    className={styles.input}
                                    value={formData.rollNo}
                                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                />
                                <label>Batch / Section</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2021-2025"
                                    className={styles.input}
                                    value={formData.batch}
                                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className={styles.uploadArea}>
                                <UploadCloud size={48} className={styles.uploadIcon} />
                                <p>Drag & drop or click to upload</p>
                                <span className={styles.uploadHint}>PDF, PNG, JPG (Max 5MB)</span>
                                <input
                                    type="file"
                                    className={styles.fileInput}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFormData({ ...formData, file: e.target.files[0] });
                                        }
                                    }}
                                />
                                {formData.file && (
                                    <div className={styles.selectedFile}>
                                        <CheckCircle size={16} /> {formData.file.name}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className={styles.paymentArea}>
                                <div className={styles.qrContainer}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                                </div>
                                <p className={styles.paymentAmount}>Secure Payment of <b>₹10</b> via Razorpay</p>
                                <p className={styles.processingHint} style={{ marginBottom: "1rem" }}>You will be redirected to the secure payment gateway.</p>
                            </div>
                        )}

                        {step === 4 && (
                            <div className={styles.processingArea}>
                                <Loader2 size={48} className={styles.spinner} />
                                <p>Gemini AI is analyzing and solving your assignment...</p>
                                <span className={styles.processingHint}>This usually takes 10-15 seconds</span>
                            </div>
                        )}

                        {step === 5 && (
                            <div className={styles.successArea}>
                                <CheckCircle size={64} className={styles.successIcon} />
                                <h3>Solution Ready!</h3>
                                <p>Your beautifully formatted PDF is generated and ready.</p>
                                <button
                                    className={styles.downloadButton}
                                    onClick={handleDownload}
                                >
                                    Download PDF
                                </button>
                            </div>
                        )}
                    </div>

                    {step < 4 && (
                        <div className={styles.actions}>
                            {step > 1 && (
                                <button className={styles.backButton} onClick={() => setStep(step - 1)}>
                                    Back
                                </button>
                            )}
                            <button className={styles.primaryButton} onClick={handleNext}>
                                {step === 3 ? "Bypass Payment & Solve" : "Continue"} <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
