import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar";
import Footer from "../../components/Layout/Footer";
import Container from "../../components/Layout/Container";
import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";
import "./LandingPage.css";

/**
 * Landing Page Component
 * Hero section with features and CTA
 */
function LandingPage() {
  const features = [
    {
      icon: "📊",
      title: "Equal Principal EMI",
      description:
        "Calculate loans with equal principal repayment structure for clear and transparent schedules.",
    },
    {
      icon: "📈",
      title: "Visual Charts",
      description:
        "Easy-to-understand charts showing remaining balance and monthly interest over time.",
    },
    {
      icon: "📋",
      title: "Detailed Schedule",
      description:
        "Month-by-month repayment breakdown with principal, interest, and remaining balance.",
    },
    {
      icon: "📄",
      title: "PDF Export",
      description:
        "Download a clean PDF report with summary, chart, and the full repayment table.",
    },
    {
      icon: "🇮🇳",
      title: "INR Formatting",
      description:
        "Indian Rupee formatting with proper comma placement for easy reading.",
    },
    {
      icon: "📱",
      title: "Easy to Use",
      description:
        "Simple interface designed for non-technical users—works on mobile and desktop.",
    },
  ];

  return (
    <div className="landing">
      <Navbar />

      <main className="landing__main">
        {/* Hero Section */}
        <section className="landing__hero">
          <Container>
            <div className="hero__content">
              <span className="hero__badge">
                Made for Mohila Samiti & Cooperative Loans
              </span>
              <h1 className="hero__title">
                SamitiHisab
                <span className="hero__title-highlight">
                  Clear Repayment Schedule
                </span>
              </h1>
              <p className="hero__description">
                A simple and transparent loan repayment calculator built for
                Mohila Samiti and women-led cooperative loan groups. Generate
                monthly schedules with principal, interest, and remaining
                balance—plus clear charts and downloadable PDF reports.
                <br />
                <br />
                <span>
                  SamitiHisab বিশেষভাবে মহিলাদের পরিচালিত সমিতি (Mohila Samiti)
                  এবং কো-অপারেটিভ ঋণ গ্রুপের জন্য তৈরি একটি সহজ ও স্বচ্ছ ঋণ
                  হিসাব করার অ্যাপ।
                </span>
              </p>
              <div className="hero__actions">
                <Link to="/dashboard">
                  <Button variant="primary" size="lg">
                    Open Calculator →
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </a>
              </div>

              <div className="hero__stats">
                <div className="hero__stat">
                  <span className="hero__stat-value">100%</span>
                  <span className="hero__stat-label">Free to Use</span>
                </div>
                <div className="hero__stat">
                  <span className="hero__stat-value">∞</span>
                  <span className="hero__stat-label">Calculations</span>
                </div>
                <div className="hero__stat">
                  <span className="hero__stat-value">0</span>
                  <span className="hero__stat-label">Sign-up Required</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="landing__features">
          <Container>
            <div className="features__header">
              <h2 className="features__title">Everything You Need</h2>
              <p className="features__subtitle">
                A clear and professional repayment schedule—without manual
                charts
              </p>
            </div>

            <div className="features__grid">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  variant="bordered"
                  padding="lg"
                  className="feature-card"
                >
                  <span className="feature-card__icon">{feature.icon}</span>
                  <h3 className="feature-card__title">{feature.title}</h3>
                  <p className="feature-card__description">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* How It Works Section */}
        <section className="landing__how-it-works">
          <Container>
            <div className="how-it-works__header">
              <h2 className="how-it-works__title">How It Works</h2>
              <p className="how-it-works__subtitle">
                Three simple steps to get the full repayment schedule
              </p>
            </div>

            <div className="how-it-works__steps">
              <div className="step">
                <div className="step__number">1</div>
                <h3 className="step__title">Enter Details</h3>
                <p className="step__description">
                  Enter member name, loan amount, start date, monthly interest
                  rate, and repayment time (months).
                </p>
              </div>

              <div className="step__arrow">→</div>

              <div className="step">
                <div className="step__number">2</div>
                <h3 className="step__title">Calculate</h3>
                <p className="step__description">
                  Generate the full schedule instantly with principal, interest,
                  and remaining balance.
                </p>
              </div>

              <div className="step__arrow">→</div>

              <div className="step">
                <div className="step__number">3</div>
                <h3 className="step__title">Download PDF</h3>
                <p className="step__description">
                  Export a clean PDF report to print or share with the group.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="landing__cta">
          <Container>
            <div className="cta__content">
              <h2 className="cta__title">Ready to Calculate?</h2>
              <p className="cta__description">
                Start using SamitiHisab now. No registration required.
              </p>
              <Link to="/dashboard">
                <Button variant="primary" size="lg">
                  Go to Dashboard →
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
