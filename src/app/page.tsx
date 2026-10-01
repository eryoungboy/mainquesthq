"use client";
import { useEffect, useState, FormEvent } from "react";
import { submitRegistration } from "./actions";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormSuccess, setIsFormSuccess] = useState(false);
  const [successName, setSuccessName] = useState("Explorer");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Reveal animations
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = document.querySelectorAll(".reveal");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealItems.forEach((item) => observer.observe(item));
      return () => observer.disconnect();
    }
  }, []);

  const handleNavClick = () => setIsMenuOpen(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setFormError("");

    // In React, we can handle the validity state manually or let the browser do it. 
    // Here we preserve the custom logic.
    let isValid = true;
    const fields = Array.from(form.querySelectorAll('input:not([type="checkbox"]), select, textarea')) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    fields.forEach((field) => {
      const fieldIsValid = field.checkValidity();
      field.classList.toggle("invalid", !fieldIsValid);
      field.setAttribute("aria-invalid", String(!fieldIsValid));

      const error = field.closest(".field")?.querySelector(".error");
      if (error) {
        if (fieldIsValid) {
          error.textContent = "";
        } else if (field.validity.typeMismatch) {
          error.textContent = "Please enter a valid email address.";
        } else if (field.validity.patternMismatch) {
          error.textContent = "Use a US number beginning with +1.";
        } else {
          error.textContent = "Please complete this field.";
        }
      }
      if (!fieldIsValid) isValid = false;
    });

    const consent = form.elements.namedItem("consent") as HTMLInputElement;
    const consentError = form.querySelector(".consent-error");
    if (consentError) consentError.textContent = consent.checked ? "" : "Please confirm before submitting.";
    consent.setAttribute("aria-invalid", String(!consent.checked));
    if (!consent.checked) isValid = false;

    const updateChoice = form.querySelector('input[name="updates"]:checked');
    const choiceError = form.querySelector(".choice-error");
    if (choiceError) choiceError.textContent = updateChoice ? "" : "Please choose Yes or No.";
    if (!updateChoice) isValid = false;

    if (!isValid || !form.checkValidity()) {
      (form.querySelector(":invalid") as HTMLElement)?.focus();
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(form);
    const result = await submitRegistration(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessName(result.firstName || "Explorer");
      setIsFormSuccess(true);
    } else {
      setFormError(result.error || "An unexpected error occurred.");
    }
  };

  const handleReset = () => {
    setIsFormSuccess(false);
    setCharCount(0);
    // Timeout to allow the form to render before focusing
    setTimeout(() => {
      document.querySelector("form")?.reset();
      document.querySelector<HTMLInputElement>("form input")?.focus();
    }, 0);
  };

  const year = new Date().getFullYear();

  return (
    <>
      <header className="site-header" id="top">
        <a className="logo" href="#top" aria-label="MainQuest home">
          <span>Main</span>
          <span className="logo-accent">Quest</span>
          <i aria-hidden="true"></i>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="site-nav"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span className="sr-only">Open menu</span>
        </button>
        <nav
          className={`site-nav ${isMenuOpen ? "is-open" : ""}`}
          id="site-nav"
          aria-label="Primary navigation"
        >
          <a href="#experience" onClick={handleNavClick}>The experience</a>
          <a href="#journey" onClick={handleNavClick} style={{ display: "none" }}>Your journey</a>
          <a href="#faq" onClick={handleNavClick}>FAQs</a>
          <a className="nav-cta" href="#register" onClick={handleNavClick}>
            Join MainQuest <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span></span> A programme for your next chapter
            </p>
            <h1 id="hero-title">
              Find your direction.<br />
              <em>Make your move.</em>
            </h1>
            <p className="hero-intro">
              MainQuest is a practical growth programme for people ready to turn potential into a plan—and a plan into progress.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#register">
                Start your quest <span aria-hidden="true">→</span>
              </a>
              <a className="text-link" href="#experience">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-meta" aria-label="Event details">
              <div>
                <strong>31</strong>
                <span>October<br />2026</span>
              </div>
              <div>
                <strong>11</strong>
                <span>AM<br />start</span>
              </div>
              <div>
                <strong>MA</strong>
                <span>The Foundry<br />Cambridge</span>
              </div>
            </div>
          </div>

          <div className="hero-art" aria-label="Your next move starts here">
            <div className="shape shape-red"></div>
            {/* <div className="shape shape-blue"></div> */}
            <div className="shape shape-yellow"></div>
            {/* <div className="shape shape-cyan"></div> */}
            <div className="hero-card">
              <span className="card-kicker">MainQuest / 01</span>
              <p>
                YOUR NEXT<br />
                MOVE STARTS<br />
                <strong>HERE.</strong>
              </p>
              <svg viewBox="0 0 100 50" aria-hidden="true">
                <path d="M2 26c23-7 44-8 80 0M68 13l18 13-20 11" />
              </svg>
            </div>
            <a href="#register" className="stamp" style={{ textDecoration: "none", color: "inherit" }}>
              READY?<br />
              <span>LET'S GO</span>
            </a>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div>
            CLARITY <b>✦</b> COURAGE <b>✦</b> COMMUNITY <b>✦</b> ACTION <b>✦</b>{" "}
            CLARITY <b>✦</b> COURAGE <b>✦</b> COMMUNITY <b>✦</b> ACTION <b>✦</b>
          </div>
        </div>

        <section className="manifesto section-pad reveal" id="experience" aria-labelledby="experience-title">
          <div className="section-label">
            <span>01</span> The experience
          </div>
          <div className="manifesto-content">
            <p className="manifesto-lead" id="experience-title">
              You don’t need to have it all figured out. <mark>You need a place to begin.</mark>
            </p>
            <p>
              MainQuest helps you make sense of what matters, build practical skills, and move forward with people who want to see you win.
            </p>
          </div>
        </section>

        <section className="pillars section-pad" aria-label="What you will gain">
          <article className="pillar pillar-red reveal">
            <span className="pillar-number">01</span>
            <div className="pillar-icon" aria-hidden="true">◎</div>
            <h2>Find your<br />signal.</h2>
            <p>Cut through the noise. Understand your strengths, values, and the direction that fits you.</p>
            <span className="tag">Clarity</span>
          </article>
          <article className="pillar pillar-blue reveal">
            <span className="pillar-number">02</span>
            <div className="pillar-icon" aria-hidden="true">↗</div>
            <h2>Build what<br />matters.</h2>
            <p>Learn practical tools for communication, problem-solving, confidence, and getting things done.</p>
            <span className="tag">Capability</span>
          </article>
          <article className="pillar pillar-green reveal">
            <span className="pillar-number">03</span>
            <div className="pillar-icon" aria-hidden="true">✦</div>
            <h2>Move with<br />people.</h2>
            <p>Meet mentors and peers who challenge your thinking, celebrate progress, and stay in your corner.</p>
            <span className="tag">Community</span>
          </article>
        </section>

        <section className="journey section-pad" id="journey" aria-labelledby="journey-title" style={{ display: "none" }}>
          <div className="journey-heading reveal">
            <div className="section-label light">
              <span>02</span> Your journey
            </div>
            <h2 id="journey-title">
              Six weeks.<br />
              <em>One real shift.</em>
            </h2>
            <p>
              Every week mixes live sessions, hands-on challenges, reflection, and honest conversations. No long lectures. No busywork.
            </p>
          </div>
          <ol className="timeline reveal">
            <li>
              <span>Week 01</span>
              <strong>Know your story</strong>
              <p>Understand where you are and what shaped you.</p>
            </li>
            <li>
              <span>Week 02</span>
              <strong>Name your north</strong>
              <p>Turn your values and strengths into direction.</p>
            </li>
            <li>
              <span>Week 03</span>
              <strong>Build your toolkit</strong>
              <p>Practise skills that transfer to the real world.</p>
            </li>
            <li>
              <span>Week 04</span>
              <strong>Test your ideas</strong>
              <p>Move from “what if?” to a small, smart experiment.</p>
            </li>
            <li>
              <span>Week 05</span>
              <strong>Find your people</strong>
              <p>Build relationships that help you go further.</p>
            </li>
            <li>
              <span>Week 06</span>
              <strong>Make your move</strong>
              <p>Leave with a 90-day action plan you believe in.</p>
            </li>
          </ol>
        </section>

        <section className="quote-band" aria-label="Participant perspective">
          <span className="quote-mark" aria-hidden="true">“</span>
          <blockquote>
            MainQuest didn’t hand me a map. It helped me realise I could <em>make my own.</em>
            <footer>— A MainQuest participant</footer>
          </blockquote>
          <div className="quote-shape" aria-hidden="true"></div>
        </section>

        <section className="registration section-pad" id="register" aria-labelledby="register-title">
          <div className="registration-intro reveal">
            <div className="section-label">
              <span>03</span> Registration
            </div>
            <h2 id="register-title">
              Your quest starts <em>right here.</em>
            </h2>
            <p>Tell us a little about yourself. This takes about two minutes, and there are no trick questions.</p>
            <div className="event-card" aria-label="Event information">
              <p><span>Date</span><strong>October 31, 2026</strong></p>
              <p><span>Time</span><strong>11:00 AM EST</strong></p>
              <p><span>Venue</span><strong>The Foundry<br />101 Rogers St<br />Cambridge, MA 02142</strong></p>
            </div>
            {!showForm && (
              <div className="mobile-begin-quest" style={{ marginTop: "2.5rem", marginBottom: "1.5rem" }}>
                <button type="button" className="button button-primary" style={{ width: "100%", maxWidth: "300px", fontSize: "1.2rem", padding: "1rem" }} onClick={() => setShowForm(true)}>Begin Quest</button>
              </div>
            )}
            <div className="registration-note">
              <span aria-hidden="true">✓</span>
              <p>
                <strong>No application fee.</strong><br />
                We’ll follow up with next steps after reviewing your registration.
              </p>
            </div>
            {showForm && (
              <div style={{ marginTop: "2.5rem", padding: "1rem", background: "var(--yellow)", border: "2px solid var(--black)", fontWeight: 900 }}>
                Please fill the form to secure your spot!
              </div>
            )}
          </div>

          {!showForm && (
            <div className="desktop-begin-quest form-shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", padding: "3rem", textAlign: "center", background: "transparent", border: "none", boxShadow: "none" }}>
              <p style={{ marginBottom: "2rem", fontSize: "1.2rem", fontWeight: 700 }}>Ready to join us? Fill out the form to secure your spot.</p>
              <button type="button" className="button button-primary" style={{ width: "100%", maxWidth: "300px", fontSize: "1.2rem", padding: "1rem" }} onClick={() => setShowForm(true)}>Begin Quest</button>
            </div>
          )}

          {showForm && (
            <div className="form-shell">
              {!isFormSuccess ? (
              <form id="registration-form" noValidate onSubmit={handleSubmit}>
                <div className="form-progress">
                  <span>Registration form</span>
                  <span>All fields are required</span>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="first-name">First name</label>
                    <input id="first-name" name="firstName" type="text" autoComplete="given-name" placeholder="e.g. John" required />
                    <small className="error" aria-live="polite"></small>
                  </div>
                  <div className="field">
                    <label htmlFor="last-name">Last name</label>
                    <input id="last-name" name="lastName" type="text" autoComplete="family-name" placeholder="e.g. Doe" required />
                    <small className="error" aria-live="polite"></small>
                  </div>
                  <div className="field field-wide">
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
                    <small className="error" aria-live="polite"></small>
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+1 (617) 555-0123"
                      pattern="^\+1[\s.-]?(?:\([2-9][0-9]{2}\)|[2-9][0-9]{2})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$"
                      required
                    />
                    <small className="error" aria-live="polite"></small>
                  </div>
                  <div className="field">
                    <label htmlFor="age">Age range</label>
                    <select id="age" name="age" required>
                      <option value="">Choose one</option>
                      <option>16–18</option>
                      <option>19–21</option>
                      <option>22–25</option>
                      <option>26–30</option>
                      <option>31+</option>
                    </select>
                    <small className="error" aria-live="polite"></small>
                  </div>
                  <div className="field">
                    <label htmlFor="state">State</label>
                    <select id="state" name="state" autoComplete="address-level1" required>
                      <option value="">Choose state</option>
                      <option>Alabama</option><option>Alaska</option><option>Arizona</option><option>Arkansas</option><option>California</option><option>Colorado</option><option>Connecticut</option><option>Delaware</option><option>Florida</option><option>Georgia</option><option>Hawaii</option><option>Idaho</option><option>Illinois</option><option>Indiana</option><option>Iowa</option><option>Kansas</option><option>Kentucky</option><option>Louisiana</option><option>Maine</option><option>Maryland</option><option>Massachusetts</option><option>Michigan</option><option>Minnesota</option><option>Mississippi</option><option>Missouri</option><option>Montana</option><option>Nebraska</option><option>Nevada</option><option>New Hampshire</option><option>New Jersey</option><option>New Mexico</option><option>New York</option><option>North Carolina</option><option>North Dakota</option><option>Ohio</option><option>Oklahoma</option><option>Oregon</option><option>Pennsylvania</option><option>Rhode Island</option><option>South Carolina</option><option>South Dakota</option><option>Tennessee</option><option>Texas</option><option>Utah</option><option>Vermont</option><option>Virginia</option><option>Washington</option><option>West Virginia</option><option>Wisconsin</option><option>Wyoming</option><option>District of Columbia</option>
                    </select>
                    <small className="error" aria-live="polite"></small>
                  </div>
                  <div className="field">
                    <label htmlFor="city">City</label>
                    <input id="city" name="city" type="text" autoComplete="address-level2" placeholder="e.g. Cambridge" required />
                    <small className="error" aria-live="polite"></small>
                  </div>

                  <fieldset className="field field-wide choice-field">
                    <legend>Would you like to receive future marketing updates from MainQuest?</legend>
                    <div className="choice-row">
                      <label>
                        <input type="radio" name="updates" value="Yes" required />
                        <span>Yes</span>
                      </label>
                      <label>
                        <input type="radio" name="updates" value="No" required />
                        <span>No</span>
                      </label>
                    </div>
                    <small className="error choice-error" aria-live="polite"></small>
                  </fieldset>
                  <div className="field field-wide">
                    <label htmlFor="source">How did you hear about the event?</label>
                    <select id="source" name="source" required>
                      <option value="">Choose one</option>
                      <option>Friend or family</option>
                      <option>School or university</option>
                      <option>Community organization</option>
                      <option>Instagram</option>
                      <option>LinkedIn</option>
                      <option>Other social media</option>
                      <option>Search engine</option>
                      <option>Other</option>
                    </select>
                    <small className="error" aria-live="polite"></small>
                  </div>
                </div>
                <label className="consent">
                  <input type="checkbox" name="consent" required />
                  <span>
                    I agree to receive important reminders and updates regarding this specific event.
                  </span>
                </label>
                <small className="error consent-error" aria-live="polite"></small>
                {formError && (
                  <div className="form-error-banner" style={{ color: "var(--red)", marginBottom: "1rem", fontWeight: "bold" }}>
                    {formError}
                  </div>
                )}
                <button className="button button-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send my registration"} <span aria-hidden="true">↗</span>
                </button>
                <p className="form-privacy">Your details stay private. No spam, ever.</p>
              </form>
            ) : (
              <div className="form-success" id="form-success" tabIndex={-1}>
                <div className="success-badge" aria-hidden="true">✓</div>
                <p className="eyebrow">Registration received</p>
                <h3>
                  You made<br />
                  your first move.
                </h3>
                <p>
                  Thanks, <span id="success-name">{successName}</span>. We’ve sent your ticket and next steps to your email.
                </p>
              </div>
            )}
          </div>
          )}
        </section>

        <section className="faq section-pad" id="faq" aria-labelledby="faq-title">
          <div className="faq-heading reveal">
            <div className="section-label">
              <span>04</span> Good to know
            </div>
            <h2 id="faq-title">
              Questions?<br />
              <em>Let’s clear them up.</em>
            </h2>
          </div>
          <div className="accordion reveal">
            <details>
              <summary>
                Who is MainQuest for?<span>+</span>
              </summary>
              <p>
                MainQuest is for curious, motivated people who want more clarity, stronger life skills, and a supportive community for their next step.
              </p>
            </details>
            <details>
              <summary>
                Do I need to know my career path already?<span>+</span>
              </summary>
              <p>
                Not at all. You can arrive with a clear ambition, three competing ideas, or no idea yet. The programme helps you work from where you are.
              </p>
            </details>
            <details>
              <summary>
                What happens after I register?<span>+</span>
              </summary>
              <p>
                The MainQuest team will review your details and contact you with programme dates, participation information, and your next step.
              </p>
            </details>
            <details>
              <summary>
                How much time should I set aside?<span>+</span>
              </summary>
              <p>
                Plan for one live session and a small practical challenge each week. The work is designed to fit alongside school, work, and life.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="logo logo-light" href="#top">
            <span>Main</span>
            <span className="logo-accent">Quest</span>
            <i></i>
          </a>
          <p style={{ textAlign: "center" }}>
            Direction is not something you find.<br />
            <strong>It’s something you build.</strong>
          </p>
          <a className="button button-primary" href="#register">
            Join the next cohort →
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            © <span id="year">{year}</span> MainQuest
          </span>
          <span>Made for the boldly curious.</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
