import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.badge}>✨ Powered by Gemini AI</div>
        <h1 className={styles.title}>
          Ace Your <span className="gradient-text">Digital Design</span><br /> Assignments Instantly
        </h1>
        <p className={styles.subtitle}>
          Upload your assignment questions and get perfectly formatted,
          step-by-step PDF solutions in seconds for just ₹10.
        </p>

        <div className={styles.ctaContainer}>
          <Link href="/solve" className={styles.primaryButton}>
            Start Solving Now
          </Link>
          <a href="#how-it-works" className={styles.secondaryButton}>
            How it works
          </a>
        </div>
      </div>

      <div id="how-it-works" className={styles.features}>
        <div className={`glass ${styles.featureCard}`}>
          <h3>1. Upload</h3>
          <p>Provide your details and upload your assignment PDF or image.</p>
        </div>
        <div className={`glass ${styles.featureCard}`}>
          <h3>2. Pay ₹10</h3>
          <p>Scan the UPI QR code to complete the ultra-low cost payment.</p>
        </div>
        <div className={`glass ${styles.featureCard}`}>
          <h3>3. Get Solution</h3>
          <p>Our AI solves the problems and generates a personalized PDF for you.</p>
        </div>
      </div>
    </div>
  );
}
