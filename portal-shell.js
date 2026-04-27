(function () {
  const pageName = window.location.pathname.split("/").pop() || "";
  const pageKey = pageName.toLowerCase();
  const isConsolidatedBundle = Boolean(window.__PORTAL_BUNDLE_EMBEDDED);
  const providerOnlyPages = new Set([
    "operationaleffdashboard.html",
    "claim1.html",
    "claims.html",
    "auth.html",
    "addauth.html",
    "denial.html",
    "paymentandrecon.html",
    "members.html",
    "providermemberdetail.html"
  ]);
  const providerShellPages = new Set([
    "operationaleffdashboard.html",
    "claim1.html",
    "claims.html",
    "auth.html",
    "addauth.html",
    "denial.html",
    "paymentandrecon.html",
    "rxandpharmacy.html",
    "followuplayer.html",
    "appointment.html",
    "members.html",
    "enrollment.html",
    "providermemberdetail.html"
  ]);
  const memberShellPages = new Set([
    "dashborad.html",
    "enrollment.html",
    "memberbillingandhsa.html",
    "appointment.html",
    "rxandpharmacy.html",
    "followuplayer.html",
    "followupconfig.html",
    "dependents.html"
  ]);
  const storedRole = localStorage.getItem("preferredRole") || localStorage.getItem("kycRole");
  const isProviderWorkspace =
    providerShellPages.has(pageKey) &&
    (storedRole === "provider" || providerOnlyPages.has(pageKey));
  const isMemberWorkspace =
    memberShellPages.has(pageKey) &&
    storedRole === "member";
  const role = providerOnlyPages.has(pageKey) ? "provider" : storedRole || "member";
  let assistantOpen = false;
  let voiceRepliesEnabled = false;
  let assistantElements = null;
  let utilityElements = null;
  let attachedFiles = [];

  const providerNavItems = [
    { label: "Provider Dashboard", href: "OperationalEffDashboard.html", icon: "space_dashboard", matches: ["operationaleffdashboard.html"] },
    { label: "Claims & Appeals", href: "Claim1.html", icon: "assignment", matches: ["claim1.html", "claims.html", "denial.html"] },
    { label: "Prior Authorizations", href: "Auth.html", icon: "fact_check", matches: ["auth.html", "addauth.html"] },
    { label: "Payments & Reconciliation", href: "PaymentandRecon.html", icon: "account_balance_wallet", matches: ["paymentandrecon.html"] },
    { label: "Appointments", href: "Appointment.html", icon: "calendar_month", matches: ["appointment.html"] },
    { label: "Pharmacy", href: "RXandPharmacy.html", icon: "medication", matches: ["rxandpharmacy.html"] },
    { label: "Care Journey", href: "Followuplayer.html", icon: "route", matches: ["followuplayer.html"] },
    { label: "Member Management", href: "Members.html", icon: "groups", matches: ["members.html", "enrollment.html", "providermemberdetail.html"] }
  ];
  const providerTopTabs = [
    { label: "Provider Dashboard", href: "OperationalEffDashboard.html", matches: ["operationaleffdashboard.html"] },
    { label: "Appeals & Denials", href: "Denial.html", matches: ["denial.html"] },
    { label: "Appointments", href: "Appointment.html", matches: ["appointment.html"] },
    { label: "Claims", href: "Claim1.html", matches: ["claim1.html", "claims.html"] }
  ];
  const memberNavItems = [
    { label: "Member Dashboard", href: "Dashborad.html", icon: "space_dashboard", matches: ["dashborad.html"] },
    { label: "Billing & HSA", href: "MemberbillingandHSA.html", icon: "receipt_long", matches: ["memberbillingandhsa.html"] },
    { label: "Appointments", href: "Appointment.html", icon: "calendar_month", matches: ["appointment.html"] },
    { label: "Pharmacy", href: "RXandPharmacy.html", icon: "medication", matches: ["rxandpharmacy.html"] },
    { label: "Care Journey", href: "Followuplayer.html", icon: "route", matches: ["followuplayer.html"] },
    { label: "Enrollment", href: "Enrollment.html", icon: "how_to_reg", matches: ["enrollment.html"] },
    { label: "Follow-Up Configuration", href: "FollowupConfig.html", icon: "tune", matches: ["followupconfig.html"] },
    { label: "Dependents", href: "Dependents.html", icon: "group_add", matches: ["dependents.html"] }
  ];

  const promptCatalog = {
    provider: [
      "Submit prior auth with attached files",
      "Check claim status",
      "Review denial risk",
      "Enroll a new member",
      "Start ambient listening intake",
      "Generate an e-form and payment packet",
      "Post ERA exceptions and underpayments",
      "Forecast MLR and star ratings"
    ],
    member: [
      "Explain my EOB",
      "Book my next appointment",
      "Review payment options",
      "Help with enrollment",
      "Add a dependent",
      "Pay at point of service",
      "Schedule my lab test",
      "Switch to multilingual help",
      "Connect me to a live agent"
    ]
  };

  const settingsStorageKey = "nventrSettings";
  const notificationStorageKey = "nventrNotifications";

  const roleSpotlights = {
    provider: [
      {
        eyebrow: "AI Ops",
        title: "Ambient listening + live agent handoff",
        body: "Capture intake context, create structured follow-up actions, and keep a human escalation path visible from every provider screen.",
        prompt: "Start ambient listening intake for today's provider call queue",
        tone: "cyan",
        workflow: "ambient_handoff"
      },
      {
        eyebrow: "Claims",
        title: "CAC, autonomous coding, QA, and revenue integrity",
        body: "Use Nventr to suggest codes, surface missing attachments, score denial risk, and launch pre-claim reviews before submission.",
        prompt: "Review autonomous coding and revenue integrity for today's claims",
        tone: "indigo",
        workflow: "claims_cac"
      },
      {
        eyebrow: "Financials",
        title: "EDI 835, ERAs, payment posting, co-pay, and underpay recovery",
        body: "AI can summarize remits, exceptions, and PITL checkpoints while preserving the legacy payment and reconciliation workflows.",
        prompt: "Summarize ERA exceptions and underpayment recovery actions",
        tone: "emerald",
        workflow: "payment_era"
      },
      {
        eyebrow: "Intelligence",
        title: "Operational intelligence for MLR, MIPS, CMS Stars, and predictive UM",
        body: "Keep high-value quality and utilization signals in the dashboard with recommended next actions, not just passive metrics.",
        prompt: "Show operational intelligence for MLR, MIPS, CMS star ratings, and predictive UM",
        tone: "amber",
        workflow: "operational_intelligence"
      }
    ],
    member: [
      {
        eyebrow: "Coverage",
        title: "Eligibility, benefits, coverage, and status",
        body: "The member portal now keeps benefits context, next coverage actions, and AI explanations visible from every screen.",
        prompt: "Explain my coverage, eligibility, and status in plain language",
        tone: "cyan"
      },
      {
        eyebrow: "Payments",
        title: "Point-of-service payments, HSA, statements, and EOB help",
        body: "Nventr can explain statements, prepare payment guidance, and keep HSA and point-of-service actions connected in one flow.",
        prompt: "Prepare point of service payment guidance and explain my statement",
        tone: "emerald"
      },
      {
        eyebrow: "Care",
        title: "Appointments, test scheduling, and pre/post care management",
        body: "AI supports appointment booking, lab follow-ups, care journey reminders, and patient-friendly next steps across the portal.",
        prompt: "Schedule my appointment and prepare test or lab follow-up guidance",
        tone: "indigo"
      },
      {
        eyebrow: "Support",
        title: "Multilingual, voice-enabled, and human-assisted support",
        body: "Members can start with AI prompts or voice, continue in their preferred language, and hand off to a live specialist when needed.",
        prompt: "Switch to multilingual support and queue a live agent handoff",
        tone: "amber"
      }
    ]
  };

  const pageFeatureMap = {
    "landingpage.html": [
      { eyebrow: "Provider AI", title: "RCM leveraging agentic AI services", body: "Claims, prior auth, payment intelligence, ambient intake, and provider workflows are all available with AI-led actions plus legacy fallbacks.", prompt: "Show me the provider AI service map", tone: "indigo" },
      { eyebrow: "Member AI", title: "Higher member satisfaction with agentic AI services", body: "Members get coverage guidance, appointments, claims help, pharmacy, EOB explanations, and statement support from one portal.", prompt: "Show me the member AI service map", tone: "cyan" }
    ],
    "signin.html": [
      { eyebrow: "AI Access", title: "Choose AI-first or legacy-friendly access", body: "Returning users can sign in and immediately use Nventr, voice prompts, files, and human handoff without losing access to existing forms and workflows.", prompt: "Summarize my AI-first access options after sign in", tone: "emerald" }
    ],
    "operationaleffdashboard.html": [
      { eyebrow: "Metric", title: "Medical coding first pass and clean claim first pass", body: "Provider intelligence now spotlights code quality, clean claim yield, and denial reduction with next-best actions.", prompt: "Show medical coding first pass and clean claim first pass insights", tone: "indigo", workflow: "claims_cac" },
      { eyebrow: "Metric", title: "MLR, CMS star ratings, MIPS, and predictive UM", body: "Operational intelligence extends into plan performance, physician scores, and predictive utilization management impact.", prompt: "Show MLR, CMS star ratings, MIPS, and predictive UM insights", tone: "amber", workflow: "operational_intelligence" },
      { eyebrow: "Metric", title: "Call resolution, payment processed, Rx value, and HSA usage", body: "Bring together contact-center outcomes, financial posting health, pharmacy value, and member spend signals in one dashboard.", prompt: "Summarize call resolution, payment processed, Rx value, and HSA usage", tone: "cyan", workflow: "ambient_handoff" }
    ],
    "claims.html": [
      { eyebrow: "Claims AI", title: "CAC, autonomous coding, QA, and pre-claim revenue integrity", body: "Use AI to suggest CPT/ICD codes, validate attachment readiness, score risk, and capture QA checks before submission.", prompt: "Run autonomous coding QA and pre-claim revenue integrity on this claim", tone: "indigo", workflow: "claims_cac" }
    ],
    "claim1.html": [
      { eyebrow: "Claims AI", title: "Claim triage with appeals and denial prevention", body: "View status, identify appeal candidates, and ask Nventr to package follow-up actions or supporting files without leaving the queue.", prompt: "Review claim triage, appeal candidates, and denial prevention actions", tone: "cyan", workflow: "claim_triage" }
    ],
    "denial.html": [
      { eyebrow: "Appeals AI", title: "Appeals and denials with human-in-the-loop recovery", body: "AI drafts the appeal path, highlights missing evidence, and keeps a handoff option ready for specialist review.", prompt: "Draft an appeal and prepare a human-in-the-loop recovery handoff", tone: "amber", workflow: "appeal_packager" }
    ],
    "auth.html": [
      { eyebrow: "Utilization", title: "Utilization management, clinical orders, and prior auth", body: "Turn clinical documentation, orders, and medical necessity checks into AI-assisted prior authorization packets.", prompt: "Review utilization management, clinical orders, and prior auth readiness", tone: "emerald", workflow: "utilization_prior_auth" }
    ],
    "addauth.html": [
      { eyebrow: "e-Forms", title: "AI-generated e-forms with supporting clinical files", body: "Nventr can gather missing fields, create the packet, and keep the legacy wizard available when your team prefers step-by-step control.", prompt: "Generate the e-form packet for this prior authorization", tone: "indigo", workflow: "eform_packet" }
    ],
    "paymentandrecon.html": [
      { eyebrow: "Financial AI", title: "EDI 835, ERAs, payment posting, co-pay, and underpay recovery", body: "Keep remits, posting exceptions, co-pay gaps, and recovery actions visible in a single AI-assisted financial workflow.", prompt: "Summarize EDI 835, ERA, payment posting, co-pay, and underpay recovery status", tone: "emerald", workflow: "payment_era" },
      { eyebrow: "Integration", title: "PITL integration with popular RCM administrative functions", body: "AI can package recommendations, but the portal still preserves human checkpoints and familiar administrative workflows.", prompt: "Show PITL integration checkpoints for RCM administrative functions", tone: "amber", workflow: "rcm_pitl" }
    ],
    "appointment.html": [
      { eyebrow: "Scheduling", title: "Appointments, test and lab orders, voice intake, and live agents", body: "Appointment workflows support AI search, booking, ambient listening cues, and escalation to a live specialist when the user needs help.", prompt: "Schedule care and summarize any test or lab order follow-up with live agent fallback", tone: "cyan" }
    ],
    "rxandpharmacy.html": [
      { eyebrow: "Pharmacy AI", title: "Rx management, refills, brand vs generic, delivery, and payments", body: "Pharmacy workflows now surface refill actions, network options, delivery updates, medication value, and payment support in one AI flow.", prompt: "Review Rx management, refills, brand versus generic options, delivery, and payment support", tone: "indigo" }
    ],
    "followuplayer.html": [
      { eyebrow: "Care Management", title: "Pre and post patient care management", body: "Care journey orchestration keeps next best actions, reminders, and outreach logic visible for both provider and member experiences.", prompt: "Summarize pre and post care management actions for this member journey", tone: "emerald" }
    ],
    "followupconfig.html": [
      { eyebrow: "Config", title: "Operational follow-up logic with AI and human checkpoints", body: "Configure the orchestration layer so AI handles routine follow-ups and escalates complex cases to live teams when needed.", prompt: "Review follow-up configuration and human escalation checkpoints", tone: "amber" }
    ],
    "members.html": [
      { eyebrow: "Members", title: "Provider member management and enrollment intelligence", body: "Track member enrollment status, drafts, care needs, and next best actions while keeping provider-assisted enrollment one click away.", prompt: "Show member management, enrollment drafts, and next best actions", tone: "cyan", workflow: "member_ops" }
    ],
    "providermemberdetail.html": [
      { eyebrow: "Member Detail", title: "Provider-side member detail, orchestration status, and next actions", body: "Providers can move from member detail into enrollment, claims, billing, and appointments without losing the current operational context.", prompt: "Show provider-side member detail, blockers, and next actions", tone: "indigo", workflow: "member_ops" }
    ],
    "enrollment.html": [
      { eyebrow: "Enrollment", title: "AI-guided registration, KYC, plan mapping, eligibility, and activation", body: "Member enrollment stays guided and reliable while still allowing providers to enroll on someone else's behalf from the same workspace.", prompt: "Review enrollment status, KYC, plan mapping, eligibility, and activation", tone: "emerald", workflow: "member_ops" }
    ],
    "dashborad.html": [
      { eyebrow: "Member Experience", title: "Coverage, care, claims, pharmacy, statements, and AI next steps", body: "The dashboard now acts as a member command center with insights, what's next, and AI-led actions instead of a static summary page.", prompt: "Show my member insights, whats next, and AI actions", tone: "cyan" },
      { eyebrow: "Support", title: "Multilingual agent, EOB agent, statement AI, and live help", body: "Members can move between voice, chat, multilingual help, statements, EOB explanations, and live support without leaving the dashboard.", prompt: "Switch to multilingual member support and explain my statement and EOB", tone: "amber" }
    ],
    "memberbillingandhsa.html": [
      { eyebrow: "Billing AI", title: "Point-of-service payment, HSA usage, EOB agent, and statement AI", body: "Use AI to explain charges, suggest payment routes, generate statements, and keep HSA balances and receipts in one place.", prompt: "Explain point of service payment, HSA usage, my EOB, and my statement", tone: "emerald" }
    ],
    "dependents.html": [
      { eyebrow: "Household", title: "Member and dependent management", body: "Add dependents, keep household coverage visible, and let Nventr book appointments or explain benefits for any covered family member.", prompt: "Add a dependent and summarize household coverage options", tone: "indigo" }
    ],
    "kyc1.html": [
      { eyebrow: "Provider Verification", title: "AI-first provider verification", body: "Providers use a verification flow before entering the portal, while members continue into the detailed enrollment journey.", prompt: "Explain provider verification and what happens next", tone: "amber" }
    ],
    "kyc2.html": [
      { eyebrow: "Role Routing", title: "Role-aware AI onboarding", body: "The onboarding flow keeps provider verification separate from member enrollment so each persona starts in the correct journey.", prompt: "Explain the role-aware onboarding flow", tone: "cyan" }
    ],
    "kyc3.html": [
      { eyebrow: "Checks", title: "Document review with AI assistance", body: "Identity and credential checks can be explained in plain language, with prompt support and human handoff available if the user gets stuck.", prompt: "Explain this verification step in plain language", tone: "emerald" }
    ],
    "kyc4.html": [
      { eyebrow: "Activation", title: "Activation and dashboard readiness", body: "Once verification or enrollment is complete, Nventr can guide the user directly into the right dashboard and next action.", prompt: "What is the next best action after activation", tone: "indigo" }
    ]
  };

  const providerWorkflowBlueprints = {
    ambient_handoff: {
      title: "Ambient Intake Workflow",
      eyebrow: "AI Ops",
      description: "Capture call context, structure the intake, and keep a live-agent escalation path visible from the start.",
      queueType: "ambient_listening",
      queuePrompt: "Start ambient intake and prep live agent handoff",
      nextNotification: "Ambient intake staged",
      nextDetail: "Ambient listening, summarization, and human handoff are now staged for the provider queue.",
      steps: [
        { label: "Capture conversation context", detail: "Voice or typed intake notes are normalized into a structured case summary." },
        { label: "Identify care or revenue-cycle intent", detail: "Nventr separates scheduling, claims, prior auth, and payment issues automatically." },
        { label: "Escalate to live specialist when needed", detail: "If AI confidence is low or the user requests help, the handoff packet is prepared automatically." }
      ],
      highlights: [
        { label: "Call intent detection", value: "92%", detail: "Recent provider support calls classified correctly on first pass." },
        { label: "Live-agent fallback", value: "Ready", detail: "Context package, attachments, and notes stay with the case." }
      ]
    },
    claims_cac: {
      title: "Autonomous Coding and Revenue Integrity",
      eyebrow: "Claims AI",
      description: "Run coding suggestions, QA checks, and pre-claim revenue integrity validation before a claim leaves the queue.",
      queueType: "claim_workflow",
      queuePrompt: "Run autonomous coding QA and pre-claim revenue integrity review",
      nextNotification: "Coding QA queued",
      nextDetail: "Nventr queued an autonomous coding and QA pass for the active claim workflow.",
      steps: [
        { label: "Read clinical note and attachments", detail: "AI summarizes the packet and checks that the supporting file set is complete." },
        { label: "Suggest CPT/ICD with QA checks", detail: "Coding confidence, missing attachments, and denial risk are surfaced before submission." },
        { label: "Package clean-claim recommendation", detail: "Legacy form submission remains available, but the AI packet is ready first." }
      ],
      highlights: [
        { label: "Code confidence", value: "94%", detail: "Best-fit CPT and ICD combinations aligned to recent submission history." },
        { label: "Revenue integrity risk", value: "Low", detail: "Primary leak drivers are attachment completeness and modifier drift." }
      ]
    },
    operational_intelligence: {
      title: "Operational Intelligence Review",
      eyebrow: "Intelligence",
      description: "Turn MLR, MIPS, CMS Star Ratings, quality, and predictive UM into recommended next actions.",
      queueType: "operational_intelligence",
      queuePrompt: "Review MLR, MIPS, CMS Star Ratings, and predictive UM",
      nextNotification: "Operational intelligence refreshed",
      nextDetail: "Nventr prepared an updated intelligence summary with recommended next actions.",
      steps: [
        { label: "Refresh quality and financial metrics", detail: "MLR, quality, coding yield, and payment signals are grouped by plan and provider." },
        { label: "Score predictive UM opportunities", detail: "High-impact episodes and spend-reduction opportunities are prioritized." },
        { label: "Recommend next actions", detail: "Nventr packages the top actions for claims, care, pharmacy, and payment leaders." }
      ],
      highlights: [
        { label: "MLR band", value: "87.2%", detail: "Current plan mix remains inside the preferred range." },
        { label: "Predictive UM impact", value: "-11%", detail: "Spend reduction forecast on the prioritized episode set." }
      ]
    },
    claim_triage: {
      title: "Claim Triage and Appeal Workflow",
      eyebrow: "Claim Queue",
      description: "Package denied or at-risk claims into the right next action: submit, appeal, or recover supporting evidence.",
      queueType: "claim_workflow",
      queuePrompt: "Review claim triage and prepare appeals or recovery actions",
      nextNotification: "Claim triage queued",
      nextDetail: "Nventr prepared the next-action packet for the selected claims.",
      steps: [
        { label: "Cluster the queue by risk", detail: "Denied, pending, and at-risk claims are separated with AI reasoning." },
        { label: "Generate appeal-ready evidence", detail: "Documentation gaps and policy mismatches are highlighted before escalation." },
        { label: "Route to AI or PITL", detail: "Low-risk work stays automated while complex cases route to human review." }
      ],
      highlights: [
        { label: "Auto-appeal candidates", value: "12", detail: "Claims currently match recent appeal-win patterns." },
        { label: "Denial prevention", value: "18%", detail: "Estimated reduction when the current ruleset is applied." }
      ]
    },
    appeal_packager: {
      title: "Appeal Drafting and Evidence Packager",
      eyebrow: "Appeals",
      description: "Build a denial response packet with supporting records, AI reasoning, and specialist handoff notes.",
      queueType: "claim_workflow",
      queuePrompt: "Draft appeal and package supporting evidence",
      nextNotification: "Appeal packet prepared",
      nextDetail: "The appeal workflow now has a structured draft, evidence list, and escalation option.",
      steps: [
        { label: "Analyze denial reason", detail: "AI aligns the payer denial reason to policy and prior approval history." },
        { label: "Assemble supporting evidence", detail: "Nventr identifies the missing documents or strongest counterpoints from the record set." },
        { label: "Prepare submission and handoff", detail: "The packet can be submitted directly or escalated to a specialist reviewer." }
      ],
      highlights: [
        { label: "Evidence match", value: "92%", detail: "Clinical and policy evidence are aligned for the selected appeal." },
        { label: "Similar win patterns", value: "12", detail: "Comparable appeal wins found in the precedent set." }
      ]
    },
    utilization_prior_auth: {
      title: "Utilization Management and Prior Auth",
      eyebrow: "Utilization",
      description: "Review clinical orders, medical necessity, and missing documentation before the prior auth packet is sent.",
      queueType: "prior_auth_workflow",
      queuePrompt: "Review utilization management and prior auth readiness",
      nextNotification: "UM review started",
      nextDetail: "Nventr started a utilization management and prior auth readiness review.",
      steps: [
        { label: "Check medical necessity", detail: "Clinical indicators are compared with payer rules and historical approvals." },
        { label: "Review orders and attachments", detail: "Missing labs, imaging, and referrals are highlighted before submission." },
        { label: "Prepare final prior auth packet", detail: "A complete packet is staged for AI or human review." }
      ],
      highlights: [
        { label: "Evidence match", value: "72%", detail: "Current case needs one more clinical support item to maximize approval odds." },
        { label: "Docs missing", value: "1", detail: "TSH lab result still flagged in the active example queue." }
      ]
    },
    eform_packet: {
      title: "e-Form and Supporting Packet Builder",
      eyebrow: "Packet Builder",
      description: "Create payer-ready e-forms, bundle supporting files, and keep the legacy wizard available when the team prefers it.",
      queueType: "eform_generation",
      queuePrompt: "Generate the prior auth e-form packet",
      nextNotification: "e-Form packet queued",
      nextDetail: "Nventr queued the e-form packet and clinical supporting document flow.",
      steps: [
        { label: "Create required form fields", detail: "Missing structured fields are inferred or explicitly requested." },
        { label: "Attach supporting documents", detail: "Clinical notes, referrals, and imaging are bundled with the packet." },
        { label: "Preserve manual review path", detail: "Teams can still walk the wizard manually before final submission." }
      ],
      highlights: [
        { label: "Packet completeness", value: "86%", detail: "Most required fields are ready for the active example." },
        { label: "Manual review mode", value: "Available", detail: "Legacy-friendly flow stays one click away." }
      ]
    },
    payment_era: {
      title: "EDI 835 and ERA Recovery Workflow",
      eyebrow: "Financial AI",
      description: "Review remits, payment posting exceptions, co-pay gaps, and underpayment opportunities from one workflow.",
      queueType: "payment_posting",
      queuePrompt: "Review ERA exceptions, payment posting, and underpayment recovery",
      nextNotification: "ERA recovery workflow queued",
      nextDetail: "Nventr prepared an ERA exception and payment recovery review.",
      steps: [
        { label: "Read ERA and remit data", detail: "835 segments and payment results are normalized into an exception list." },
        { label: "Identify posting and co-pay gaps", detail: "Co-pay variances, posting misses, and underpayment candidates are scored." },
        { label: "Recommend PITL recovery action", detail: "AI prepares the next action while preserving administrative checkpoints." }
      ],
      highlights: [
        { label: "Processing completion", value: "82%", detail: "Current batch is already through primary normalization." },
        { label: "Recovery opportunity", value: "$142k", detail: "Estimated opportunity across current exceptions and variances." }
      ]
    },
    rcm_pitl: {
      title: "RCM Integration and PITL Review",
      eyebrow: "Integration",
      description: "See where AI recommendations connect into administrative checkpoints so the team retains visibility and control.",
      queueType: "rcm_integration_review",
      queuePrompt: "Review PITL checkpoints and RCM administrative integration",
      nextNotification: "RCM integration review queued",
      nextDetail: "Nventr prepared the PITL and administrative integration review.",
      steps: [
        { label: "Map the administrative workflow", detail: "The current payer or RCM touchpoints are identified before automation begins." },
        { label: "Insert AI recommendations", detail: "High-confidence steps stay automated while exceptions pause for human review." },
        { label: "Preserve PITL governance", detail: "Every high-risk decision retains a visible manual checkpoint." }
      ],
      highlights: [
        { label: "Governance coverage", value: "100%", detail: "Every critical admin checkpoint remains reviewable." },
        { label: "Automation scope", value: "Selective", detail: "High-volume, low-risk work is where AI brings the most value." }
      ]
    },
    member_ops: {
      title: "Provider-Assisted Member Operations",
      eyebrow: "Members",
      description: "Launch member enrollment, resume drafts, and keep status visible for provider-side operations.",
      queueType: "member_enrollment",
      queuePrompt: "Review provider-assisted member enrollment and draft management",
      nextNotification: "Member operations workflow queued",
      nextDetail: "Nventr staged the provider-assisted member enrollment workflow.",
      steps: [
        { label: "Open active member drafts", detail: "Drafts, plan mapping, and enrollment status are summarized in one place." },
        { label: "Collect missing enrollment fields", detail: "Nventr asks for missing KYC, plan, and payment details only when needed." },
        { label: "Activate and route correctly", detail: "Completed members route to the right dashboard without mixing provider and member journeys." }
      ],
      highlights: [
        { label: "Active drafts", value: "Live", detail: "Saved drafts remain visible and resumable from Members." },
        { label: "Activation path", value: "Role-aware", detail: "Member access stays separate from provider verification." }
      ]
    }
  };

  const providerInsightBlueprints = {
    claims_yield: {
      eyebrow: "Record Drill-Down",
      title: "Claims automation yield detail",
      description: "Inspect the individual records behind clean-claim yield, coding confidence, and first-pass readiness.",
      queueType: "claim_workflow",
      queuePrompt: "Review record-level clean claim yield detail",
      nextNotification: "Claims yield review queued",
      nextDetail: "Nventr staged a record-level claims yield review with coding and submission actions.",
      records: [
        { label: "CLM-88314", detail: "Respiratory ambulatory claim - modifier drift corrected, attachments complete, ready for submission.", tone: "ready" },
        { label: "CLM-88362", detail: "Observation claim - QA flagged payer-specific diagnosis ordering before submission.", tone: "review" },
        { label: "CLM-88401", detail: "Cardiology follow-up - coding confidence 97%, clean-claim recommendation available.", tone: "ready" }
      ],
      highlights: [
        { label: "Ready now", value: "18 claims", detail: "Claims passing AI coding QA and attachment checks." },
        { label: "Needs review", value: "4 claims", detail: "Main issues are modifier order and incomplete clinical attachment sets." }
      ]
    },
    appeal_rate: {
      eyebrow: "Record Drill-Down",
      title: "Appeal opportunity detail",
      description: "See which denied or at-risk claims are most likely to recover with AI-packaged appeals.",
      queueType: "claim_workflow",
      queuePrompt: "Review record-level appeal opportunities",
      nextNotification: "Appeal opportunity review queued",
      nextDetail: "Nventr prepared claim-level appeal candidates and likely recovery actions.",
      records: [
        { label: "DEN-20418", detail: "BCBS respiratory denial - policy mismatch and missing imaging note, high appeal confidence.", tone: "review" },
        { label: "DEN-20427", detail: "Authorization linkage issue - likely recoverable with prior auth attachment.", tone: "ready" },
        { label: "DEN-20433", detail: "Timely filing dispute - route to PITL specialist after AI evidence packager completes.", tone: "handoff" }
      ],
      highlights: [
        { label: "Auto-appeal candidates", value: "12", detail: "Cases matching recent successful appeal patterns." },
        { label: "Recovery value", value: "$46k", detail: "Estimated recoverable amount in the current denial subset." }
      ]
    },
    payer_turnaround: {
      eyebrow: "Record Drill-Down",
      title: "Average payer turnaround detail",
      description: "Break payer delays into record-level queues, exception causes, and likely turnaround blockers.",
      queueType: "payment_posting",
      queuePrompt: "Review payer turnaround blockers by record",
      nextNotification: "Payer turnaround review queued",
      nextDetail: "Nventr staged a payer turnaround review with record-level blockers.",
      records: [
        { label: "BCBS - Auth linked late", detail: "7 respiratory claims delayed because the prior auth reference posted after intake.", tone: "review" },
        { label: "Aetna - Clinical mismatch", detail: "4 claims paused while payer requests updated clinical notes.", tone: "review" },
        { label: "UHC - Posting backlog", detail: "3 remits landed but payment posting is still pending reconciliation.", tone: "handoff" }
      ],
      highlights: [
        { label: "Longest payer", value: "BCBS", detail: "Currently driving the highest average turnaround variance." },
        { label: "Fastest fix", value: "Auth relink", detail: "Most delays clear once authorization references are reattached." }
      ]
    },
    recovery_opportunity: {
      eyebrow: "Record Drill-Down",
      title: "Recovery opportunity detail",
      description: "Inspect underpayment, remit, and posting exceptions at the claim and transaction level.",
      queueType: "payment_posting",
      queuePrompt: "Review record-level recovery opportunities",
      nextNotification: "Recovery opportunity review queued",
      nextDetail: "Nventr staged underpayment and posting exception detail for recovery work.",
      records: [
        { label: "ERA-90210 / CLM-88041", detail: "Underpaid by $142.00 against contracted rate - payer variance flagged.", tone: "review" },
        { label: "TRX-884291", detail: "Patient co-pay posted but not reconciled to the encounter ledger.", tone: "handoff" },
        { label: "ERA-90210 / CLM-88058", detail: "Duplicate adjustment code likely suppressing the second line payment.", tone: "review" }
      ],
      highlights: [
        { label: "Top exception", value: "Underpay", detail: "Largest recovery bucket in the current remit set." },
        { label: "Immediate value", value: "$142k", detail: "Current recovery estimate across open batches." }
      ]
    },
    quality_signals: {
      eyebrow: "Record Drill-Down",
      title: "Quality and payer signal detail",
      description: "Review the member, physician, and plan-level records driving CMS Star and MIPS movement.",
      queueType: "operational_intelligence",
      queuePrompt: "Review record-level quality and payer signals",
      nextNotification: "Quality signal review queued",
      nextDetail: "Nventr prepared the quality and payer signal record set for provider review.",
      records: [
        { label: "Plan A - CMS Stars", detail: "Medication adherence and preventive visit closure are sustaining the 4.5 score.", tone: "ready" },
        { label: "Physician panel - MIPS", detail: "Two documentation gaps are pulling one specialty subgroup below target.", tone: "review" },
        { label: "Member engagement cohort", detail: "HSA engagement is strongest in members with appointment reminders turned on.", tone: "ready" }
      ],
      highlights: [
        { label: "CMS Star trend", value: "4.5 / 5", detail: "Stable with upside if preventive closure remains on pace." },
        { label: "MIPS focus", value: "2 gaps", detail: "Documented quality measures can recover the current variance." }
      ]
    },
    pharmacy_utilization: {
      eyebrow: "Record Drill-Down",
      title: "Pharmacy and utilization detail",
      description: "Inspect which fills, exceptions, and utilization records are driving pharmacy performance.",
      queueType: "operational_intelligence",
      queuePrompt: "Review record-level pharmacy and utilization detail",
      nextNotification: "Pharmacy utilization review queued",
      nextDetail: "Nventr prepared a record-level pharmacy and utilization review.",
      records: [
        { label: "Rx cohort - statins", detail: "Generic conversion opportunity on 14 active fills with high adherence probability.", tone: "review" },
        { label: "Specialty queue - Humira", detail: "Prior auth renewal is the main blocker to fill continuity.", tone: "handoff" },
        { label: "Refill exception set", detail: "Vacation override pattern explains 3 early refill requests this week.", tone: "ready" }
      ],
      highlights: [
        { label: "Rx fill rate", value: "98%", detail: "Fill continuity remains strong in the current network set." },
        { label: "AI resolution", value: "4.2:1", detail: "AI closes more routine pharmacy questions than live teams this week." }
      ]
    },
    mlr_plan: {
      eyebrow: "Record Drill-Down",
      title: "MLR plan variance detail",
      description: "Drill from plan-level MLR into the episodes, spend, and quality levers affecting performance.",
      queueType: "operational_intelligence",
      queuePrompt: "Review plan-level MLR variance detail",
      nextNotification: "MLR plan review queued",
      nextDetail: "Nventr prepared plan-level MLR variance detail and recommended actions.",
      records: [
        { label: "Plan A", detail: "Stable inside target band with strong preventive closure and low avoidable spend.", tone: "ready" },
        { label: "Plan B", detail: "Outside optimal range due to respiratory episode spend and delayed appeal recovery.", tone: "review" },
        { label: "Plan D", detail: "Improving after pharmacy substitution and payment recovery actions.", tone: "ready" }
      ],
      highlights: [
        { label: "Highest risk plan", value: "Plan B", detail: "Needs immediate attention on denials and utilization mix." },
        { label: "Predicted impact", value: "-11%", detail: "Potential spend reduction after the recommended actions land." }
      ]
    },
    forecast_action: {
      eyebrow: "Record Drill-Down",
      title: "Forecast and next-best action detail",
      description: "See the underlying assumptions and the exact queue items Nventr wants the provider team to act on next.",
      queueType: "operational_intelligence",
      queuePrompt: "Review forecast assumptions and next-best actions",
      nextNotification: "Forecast review queued",
      nextDetail: "Nventr prepared the forecast assumptions and next-best action queue.",
      records: [
        { label: "Respiratory surge", detail: "14% utilization forecast increase next month based on historical regional trends.", tone: "review" },
        { label: "Coding ruleset", detail: "Apply respiratory ICD mapping ruleset to reduce denial carryover before the surge arrives.", tone: "ready" },
        { label: "Appeal packager", detail: "Queue high-value BCBS appeals now to improve recovery before next month closes.", tone: "ready" }
      ],
      highlights: [
        { label: "Top next action", value: "Apply ruleset", detail: "Fastest operational move with highest claim-quality impact." },
        { label: "Forecast confidence", value: "High", detail: "Model aligns with regional trend and current intake pattern." }
      ]
    },
    operations_map: {
      eyebrow: "Record Drill-Down",
      title: "Live operations map detail",
      description: "Inspect regional intake load, handoff readiness, and queue concentration from the live operations map.",
      queueType: "ambient_listening",
      queuePrompt: "Review operations map detail and live handoff readiness",
      nextNotification: "Operations map review queued",
      nextDetail: "Nventr staged the live operations map detail with regional queue signals.",
      records: [
        { label: "Region A", detail: "Highest current intake volume with respiratory claim variance and elevated appeal demand.", tone: "review" },
        { label: "Region B", detail: "Stable queue mix with low human handoff requirement.", tone: "ready" },
        { label: "Live handoff pool", detail: "3 specialists available for complex claims and payment escalations.", tone: "handoff" }
      ],
      highlights: [
        { label: "Priority region", value: "Region A", detail: "Main source of claim variance and live escalation pressure." },
        { label: "Handoff readiness", value: "3 agents", detail: "Specialists currently available for PITL review." }
      ]
    }
  };

  const styleText = `
    .nventr-shell * { box-sizing: border-box; }
    .nventr-fab {
      position: fixed;
      right: 1.25rem;
      bottom: 5.5rem;
      z-index: 70;
      border: 1px solid rgba(129, 140, 248, 0.35);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(34, 211, 238, 0.9));
      color: #f8fafc;
      box-shadow: 0 24px 48px rgba(15, 23, 42, 0.45);
    }
    .nventr-fab:hover { transform: translateY(-2px); }
    .nventr-panel {
      position: fixed;
      right: 1.25rem;
      bottom: 8.75rem;
      width: min(24rem, calc(100vw - 2rem));
      max-height: min(38rem, calc(100vh - 10rem));
      z-index: 70;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(8, 20, 37, 0.96);
      backdrop-filter: blur(18px);
      box-shadow: 0 28px 80px rgba(15, 23, 42, 0.55);
    }
    .nventr-panel[hidden] { display: none; }
    .nventr-scroll::-webkit-scrollbar { width: 8px; }
    .nventr-scroll::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.22);
      border-radius: 999px;
    }
    .nventr-chip {
      border: 1px solid rgba(129, 140, 248, 0.2);
      background: rgba(30, 41, 59, 0.72);
      color: #dbeafe;
    }
    .nventr-prompt-card {
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.84));
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.28);
    }
    .nventr-prompt-input {
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(71, 85, 105, 0.65);
    }
    .nventr-prompt-input:focus-within {
      border-color: rgba(94, 234, 212, 0.6);
      box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.14);
    }
    .provider-shell-active {
      background: #081425;
    }
    .provider-shell-active body {
      background: #081425;
    }
    .provider-shell-active > header,
    .provider-shell-active > aside,
    .provider-shell-active > nav,
    .provider-shell-active > div > header,
    .provider-shell-active > div > aside,
    .provider-shell-active > div > nav {
      display: none !important;
    }
    .provider-shell-active main {
      margin-left: 17rem !important;
      margin-top: 0 !important;
      padding-top: 8.25rem !important;
      max-width: none !important;
      width: auto !important;
    }
    .provider-shell-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 15rem;
      z-index: 65;
      border-right: 1px solid rgba(70, 69, 84, 0.42);
      background: rgba(3, 9, 20, 0.95);
      backdrop-filter: blur(16px);
      box-shadow: 18px 0 42px rgba(2, 6, 23, 0.35);
    }
    .provider-shell-topbar {
      position: fixed;
      top: 0;
      left: 15rem;
      right: 0;
      z-index: 64;
      min-height: 7rem;
      border-bottom: 1px solid rgba(70, 69, 84, 0.42);
      background: rgba(8, 20, 37, 0.88);
      backdrop-filter: blur(16px);
    }
    .provider-shell-top-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin-top: 0.85rem;
    }
    .provider-shell-tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      border: 1px solid rgba(71, 85, 105, 0.55);
      background: rgba(15, 23, 42, 0.7);
      padding: 0.45rem 0.9rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #cbd5e1;
      text-decoration: none;
      transition: border-color 150ms ease, background 150ms ease, color 150ms ease, transform 150ms ease;
    }
    .provider-shell-tab:hover {
      border-color: rgba(99, 102, 241, 0.45);
      background: rgba(30, 41, 59, 0.92);
      color: #f8fafc;
      transform: translateY(-1px);
    }
    .provider-shell-tab-active {
      border-color: rgba(99, 102, 241, 0.42);
      background: rgba(99, 102, 241, 0.18);
      color: #ffffff;
      box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.16) inset;
    }
    .provider-shell-link-active {
      border-color: rgba(99, 102, 241, 0.32);
      background: rgba(99, 102, 241, 0.14);
      color: #e2e8f0;
    }
    .provider-shell-link {
      border: 1px solid transparent;
    }
    .provider-shell-link:hover {
      border-color: rgba(71, 85, 105, 0.55);
      background: rgba(15, 23, 42, 0.72);
      color: #f8fafc;
    }
    .member-shell-active {
      background: #081425;
    }
    .member-shell-active > header,
    .member-shell-active > aside,
    .member-shell-active > nav,
    .member-shell-active > div > header,
    .member-shell-active > div > aside,
    .member-shell-active > div > nav {
      display: none !important;
    }
    .member-shell-active main {
      margin-left: 17rem !important;
      margin-top: 0 !important;
      padding-top: 6rem !important;
      max-width: none !important;
      width: auto !important;
    }
    .member-shell-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 15rem;
      z-index: 65;
      border-right: 1px solid rgba(70, 69, 84, 0.42);
      background: rgba(3, 9, 20, 0.95);
      backdrop-filter: blur(16px);
      box-shadow: 18px 0 42px rgba(2, 6, 23, 0.35);
    }
    .member-shell-topbar {
      position: fixed;
      top: 0;
      left: 15rem;
      right: 0;
      z-index: 64;
      height: 4.75rem;
      border-bottom: 1px solid rgba(70, 69, 84, 0.42);
      background: rgba(8, 20, 37, 0.88);
      backdrop-filter: blur(16px);
    }
    .member-shell-link-active {
      border-color: rgba(45, 212, 191, 0.3);
      background: rgba(45, 212, 191, 0.12);
      color: #f8fafc;
    }
    .member-shell-link {
      border: 1px solid transparent;
    }
    .member-shell-link:hover {
      border-color: rgba(71, 85, 105, 0.55);
      background: rgba(15, 23, 42, 0.72);
      color: #f8fafc;
    }
    .nventr-assistant-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
    .nventr-spotlight {
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: linear-gradient(135deg, rgba(8, 20, 37, 0.94), rgba(30, 41, 59, 0.88));
      box-shadow: 0 20px 54px rgba(15, 23, 42, 0.3);
    }
    .nventr-feature-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .nventr-feature-card {
      border-radius: 1.5rem;
      border: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(8, 20, 37, 0.68);
      padding: 1.1rem;
    }
    .nventr-feature-card[data-tone="cyan"] {
      box-shadow: inset 0 0 0 1px rgba(45, 212, 191, 0.08);
    }
    .nventr-feature-card[data-tone="indigo"] {
      box-shadow: inset 0 0 0 1px rgba(129, 140, 248, 0.08);
    }
    .nventr-feature-card[data-tone="emerald"] {
      box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.08);
    }
    .nventr-feature-card[data-tone="amber"] {
      box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.08);
    }
    .nventr-feature-eyebrow {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      font-weight: 700;
    }
    .nventr-metric-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    }
    .nventr-metric-card {
      border-radius: 1.5rem;
      border: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(8, 20, 37, 0.72);
      padding: 1rem;
    }
    .nventr-overlay {
      position: fixed;
      inset: 0;
      z-index: 75;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(2, 6, 23, 0.72);
      padding: 1rem;
      backdrop-filter: blur(10px);
    }
    .nventr-overlay[hidden] {
      display: none;
    }
    .nventr-modal {
      width: min(44rem, calc(100vw - 2rem));
      max-height: min(42rem, calc(100vh - 2rem));
      overflow: auto;
      border-radius: 1.75rem;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(8, 20, 37, 0.98);
      box-shadow: 0 28px 80px rgba(15, 23, 42, 0.48);
    }
    .nventr-notification {
      border-radius: 1.2rem;
      border: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(15, 23, 42, 0.76);
      padding: 0.95rem 1rem;
    }
    .nventr-toggle {
      position: relative;
      width: 3rem;
      height: 1.7rem;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      background: rgba(51, 65, 85, 0.9);
      transition: background 0.2s ease;
    }
    .nventr-toggle::after {
      content: "";
      position: absolute;
      top: 0.16rem;
      left: 0.18rem;
      width: 1.2rem;
      height: 1.2rem;
      border-radius: 999px;
      background: #f8fafc;
      transition: transform 0.2s ease;
    }
    .nventr-toggle[aria-pressed="true"] {
      background: rgba(34, 211, 238, 0.4);
    }
    .nventr-toggle[aria-pressed="true"]::after {
      transform: translateX(1.28rem);
    }
    @media (max-width: 1023px) {
      .provider-shell-active main {
        margin-left: 0 !important;
        padding-top: 6.75rem !important;
      }
      .member-shell-active main {
        margin-left: 0 !important;
        padding-top: 6.75rem !important;
      }
      .provider-shell-sidebar {
        display: none;
      }
      .member-shell-sidebar {
        display: none;
      }
      .provider-shell-topbar {
        left: 0;
        min-height: 8.25rem;
      }
      .member-shell-topbar {
        left: 0;
      }
      .nventr-overlay {
        align-items: flex-end;
      }
      .nventr-modal {
        width: 100%;
        max-height: 90vh;
      }
    }
    @media (min-width: 768px) {
      .nventr-fab { bottom: 1.5rem; }
      .nventr-panel { bottom: 6.5rem; }
    }
  `;

  const labelRules = [
    { text: "Overview", next: "Dashboard" },
    { text: "Analytics", next: "Dashboard" },
    { text: "Intelligence", next: "Dashboard" },
    { text: "Back to Intelligence", next: "Back to Dashboard" },
    { text: "Claims tracking", next: "Claims Tracking" },
    { text: "EOB explanation", next: "EOB Explanation" },
    { text: "Benefits & coverage", next: "Benefits & Coverage" },
    { text: "Book appointment", next: "Book Appointment" },
    { text: "Order medication", next: "Order Medication" },
    { text: "Check claim status", next: "Check Claim Status" },
    { text: "Verify eligibility", next: "Verify Eligibility" }
  ];

  const linkRules = [
    { href: "OperationalEffDashboard.html", matches: ["Overview", "Analytics", "Intelligence"], next: "Provider Dashboard" },
    { href: "Dashborad.html", matches: ["Settings", "Overview", "Analytics", "Intelligence"], next: "Member Dashboard" },
    { href: "Claim1.html", matches: ["Predictive", "Claims"], next: "Claims" },
    { href: "Claims.html", matches: ["Claims"], next: "Claims Queue" },
    { href: "Appointment.html", matches: ["Regional", "Appointment"], next: "Appointments" },
    { href: "Auth.html", matches: ["Authorizations", "Orchestration"], next: "Prior Authorizations" },
    { href: "AddAuth.html", matches: ["Authorizations", "Prior authorization"], next: "New Prior Authorization" },
    { href: "Denial.html", matches: ["Insights", "Appeals"], next: "Appeals & Denials" },
    { href: "PaymentandRecon.html", matches: ["Billing", "Payments", "Billing & Payments"], next: "Payments & Reconciliation" },
    { href: "MemberbillingandHSA.html", matches: ["Billing", "Payments", "Billing & Payments"], next: "Billing & HSA" }
  ];

  function init() {
    injectStyles();
    buildProviderShell();
    buildMemberShell();
    normalizeLabels();
    buildAssistant();
    buildUtilityPanels();
    bindTopbarActions();
    enhanceDashboards();
    refineIntelligenceView();
    decoratePortalExperience();
    wireFeaturePromptButtons(document);
    wireGlobalPromptDelegation();
    bindProviderPageActions();
  }

  function injectStyles() {
    if (document.getElementById("nventr-shell-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "nventr-shell-styles";
    style.textContent = styleText;
    document.head.appendChild(style);
  }

  function readPortalJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed === null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function writePortalJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSettings() {
    return Object.assign(
      {
        voiceReplies: false,
        preferredLanguage: "English",
        legacyMode: true
      },
      readPortalJson(settingsStorageKey, {})
    );
  }

  function persistSettings(next) {
    const settings = Object.assign({}, getSettings(), next || {});
    writePortalJson(settingsStorageKey, settings);
    voiceRepliesEnabled = Boolean(settings.voiceReplies);
    if (assistantElements && assistantElements.voiceReply) {
      assistantElements.voiceReply.textContent = voiceRepliesEnabled ? "Voice On" : "Voice Off";
    }
    renderSettingsPanel();
  }

  function pushPortalNotification(title, detail, tone) {
    const queue = readPortalJson(notificationStorageKey, []);
    queue.unshift({
      id: `note-${Date.now()}`,
      title,
      detail,
      tone: tone || "info",
      page: pageName,
      role,
      createdAt: new Date().toISOString()
    });
    writePortalJson(notificationStorageKey, queue.slice(0, 40));
    renderNotifications();
  }

  function buildUtilityPanels() {
    if (!document.body || document.getElementById("nventrUtilityRoot")) {
      voiceRepliesEnabled = Boolean(getSettings().voiceReplies);
      return;
    }

    const utilityRoot = document.createElement("div");
    utilityRoot.id = "nventrUtilityRoot";
    utilityRoot.innerHTML = `
      <section class="nventr-overlay" hidden id="nventrNotificationsPanel" aria-label="Portal notifications">
        <div class="nventr-modal p-5 text-slate-100">
          <div class="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Notifications</p>
              <h2 class="mt-2 text-xl font-bold text-white">AI activity, queue status, and live handoff updates</h2>
              <p class="mt-2 text-sm text-slate-400">Track AI-generated actions, files, and escalations across provider and member workflows.</p>
            </div>
            <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-cyan-400 hover:text-white" type="button" data-nventr-close="notifications">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div class="mt-5 space-y-3" id="nventrNotificationsList"></div>
        </div>
      </section>
      <section class="nventr-overlay" hidden id="nventrSettingsPanel" aria-label="Portal settings">
        <div class="nventr-modal p-5 text-slate-100">
          <div class="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Settings</p>
              <h2 class="mt-2 text-xl font-bold text-white">AI-first preferences with legacy-safe fallbacks</h2>
              <p class="mt-2 text-sm text-slate-400">Tune voice replies, language, and whether the portal keeps legacy form flows visible alongside AI actions.</p>
            </div>
            <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-cyan-400 hover:text-white" type="button" data-nventr-close="settings">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div class="mt-5 space-y-5" id="nventrSettingsList"></div>
        </div>
      </section>
      <section class="nventr-overlay" hidden id="nventrWorkflowPanel" aria-label="Provider AI workflow">
        <div class="nventr-modal p-5 text-slate-100">
          <div class="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300" id="nventrWorkflowEyebrow">AI Workflow</p>
              <h2 class="mt-2 text-xl font-bold text-white" id="nventrWorkflowTitle">Workflow</h2>
              <p class="mt-2 text-sm text-slate-400" id="nventrWorkflowDescription">Workflow details</p>
            </div>
            <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-cyan-400 hover:text-white" type="button" data-nventr-close="workflow">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div class="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div class="space-y-4" id="nventrWorkflowSteps"></div>
              <div class="mt-5 rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">AI prompt</p>
                <p class="mt-3 text-sm text-white" id="nventrWorkflowPrompt"></p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Signals</p>
                <div class="mt-4 space-y-3" id="nventrWorkflowHighlights"></div>
              </div>
              <div class="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">File context</p>
                <p class="mt-3 text-sm text-slate-300" id="nventrWorkflowFiles">No files attached. Attach records in Nventr for a richer workflow handoff.</p>
              </div>
              <div class="flex flex-wrap gap-3" id="nventrWorkflowActions"></div>
            </div>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(utilityRoot);

    utilityElements = {
      notificationsPanel: utilityRoot.querySelector("#nventrNotificationsPanel"),
      settingsPanel: utilityRoot.querySelector("#nventrSettingsPanel"),
      workflowPanel: utilityRoot.querySelector("#nventrWorkflowPanel"),
      notificationsList: utilityRoot.querySelector("#nventrNotificationsList"),
      settingsList: utilityRoot.querySelector("#nventrSettingsList"),
      workflowEyebrow: utilityRoot.querySelector("#nventrWorkflowEyebrow"),
      workflowTitle: utilityRoot.querySelector("#nventrWorkflowTitle"),
      workflowDescription: utilityRoot.querySelector("#nventrWorkflowDescription"),
      workflowSteps: utilityRoot.querySelector("#nventrWorkflowSteps"),
      workflowPrompt: utilityRoot.querySelector("#nventrWorkflowPrompt"),
      workflowHighlights: utilityRoot.querySelector("#nventrWorkflowHighlights"),
      workflowFiles: utilityRoot.querySelector("#nventrWorkflowFiles"),
      workflowActions: utilityRoot.querySelector("#nventrWorkflowActions")
    };

    voiceRepliesEnabled = Boolean(getSettings().voiceReplies);

    utilityRoot.querySelectorAll("[data-nventr-close]").forEach((button) => {
      button.addEventListener("click", function () {
        closeUtilityPanel(button.getAttribute("data-nventr-close"));
      });
    });

    utilityRoot.querySelectorAll(".nventr-overlay").forEach((panel) => {
      panel.addEventListener("click", function (event) {
        if (event.target === panel) {
          panel.hidden = true;
        }
      });
    });

    renderNotifications();
    renderSettingsPanel();
  }

  function bindTopbarActions() {
    document.querySelectorAll("[data-nventr-panel]").forEach((button) => {
      if (button.dataset.nventrBound === "true") {
        return;
      }

      button.dataset.nventrBound = "true";
      button.addEventListener("click", function () {
        openUtilityPanel(button.getAttribute("data-nventr-panel"));
      });
    });
  }

  function openUtilityPanel(kind) {
    if (!utilityElements) {
      return;
    }

    if (kind === "notifications") {
      renderNotifications();
      utilityElements.notificationsPanel.hidden = false;
    }

    if (kind === "settings") {
      renderSettingsPanel();
      utilityElements.settingsPanel.hidden = false;
    }
  }

  function closeUtilityPanel(kind) {
    if (!utilityElements) {
      return;
    }

    if (kind === "notifications") {
      utilityElements.notificationsPanel.hidden = true;
    }

    if (kind === "settings") {
      utilityElements.settingsPanel.hidden = true;
    }

    if (kind === "workflow") {
      utilityElements.workflowPanel.hidden = true;
    }
  }

  function renderNotifications() {
    if (!utilityElements || !utilityElements.notificationsList) {
      return;
    }

    const notifications = readPortalJson(notificationStorageKey, []);
    const actions = readPortalJson("nventrActionQueue", []);
    const handoff = readPortalJson("nventrHumanHandoff", null);
    const combined = notifications.slice(0, 12).map((item) => ({
      title: item.title,
      detail: item.detail,
      meta: `${item.role || role} - ${new Date(item.createdAt).toLocaleString()}`,
      tone: item.tone || "info"
    }));

    actions.slice(0, 4).forEach((action) => {
      combined.unshift({
        title: `Queued AI action: ${action.type.replace(/_/g, " ")}`,
        detail: action.prompt,
        meta: `${action.role} - ${new Date(action.createdAt).toLocaleString()}`,
        tone: "queue"
      });
    });

    if (handoff && handoff.requestedAt) {
      combined.unshift({
        title: "Human handoff requested",
        detail: handoff.pendingPrompt || "A live specialist has the latest workflow context and attachments.",
        meta: `${handoff.role} - ${new Date(handoff.requestedAt).toLocaleString()}`,
        tone: "handoff"
      });
    }

    if (!combined.length) {
      utilityElements.notificationsList.innerHTML = `
        <div class="nventr-notification">
          <p class="text-sm font-semibold text-white">No notifications yet</p>
          <p class="mt-2 text-sm text-slate-400">As you use Nventr, queued AI actions, files, and human handoff updates will appear here.</p>
        </div>
      `;
      return;
    }

    utilityElements.notificationsList.innerHTML = combined.map((item) => `
      <article class="nventr-notification">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-white">${escapeHtml(item.title)}</p>
            <p class="mt-2 text-sm leading-7 text-slate-300">${escapeHtml(item.detail)}</p>
            <p class="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">${escapeHtml(item.meta)}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${item.tone === "handoff" ? "bg-amber-400/10 text-amber-200" : item.tone === "queue" ? "bg-cyan-400/10 text-cyan-200" : "bg-emerald-400/10 text-emerald-200"}">${item.tone}</span>
        </div>
      </article>
    `).join("");
  }

  function renderSettingsPanel() {
    if (!utilityElements || !utilityElements.settingsList) {
      return;
    }

    const settings = getSettings();
    utilityElements.settingsList.innerHTML = `
      <div class="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-white">Voice replies</p>
            <p class="mt-1 text-sm text-slate-400">Let Nventr speak confirmations and summaries back to the user.</p>
          </div>
          <button class="nventr-toggle" type="button" id="nventrVoiceSetting" aria-pressed="${settings.voiceReplies ? "true" : "false"}"></button>
        </div>
      </div>
      <div class="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
        <label class="text-sm font-semibold text-white" for="nventrLanguageSetting">Preferred language</label>
        <p class="mt-1 text-sm text-slate-400">Use multilingual support for chat guidance, call scripts, and member-friendly explanations.</p>
        <select class="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" id="nventrLanguageSetting">
          ${["English", "Spanish", "Hindi", "French"].map((language) => `<option value="${language}" ${settings.preferredLanguage === language ? "selected" : ""}>${language}</option>`).join("")}
        </select>
      </div>
      <div class="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-white">Keep legacy flows visible</p>
            <p class="mt-1 text-sm text-slate-400">Recommended for teams who still want forms and wizard paths available beside AI actions.</p>
          </div>
          <button class="nventr-toggle" type="button" id="nventrLegacySetting" aria-pressed="${settings.legacyMode ? "true" : "false"}"></button>
        </div>
      </div>
    `;

    const voiceSetting = utilityElements.settingsList.querySelector("#nventrVoiceSetting");
    const languageSetting = utilityElements.settingsList.querySelector("#nventrLanguageSetting");
    const legacySetting = utilityElements.settingsList.querySelector("#nventrLegacySetting");

    voiceSetting.addEventListener("click", function () {
      const next = voiceSetting.getAttribute("aria-pressed") !== "true";
      persistSettings({ voiceReplies: next });
      pushPortalNotification("Voice setting updated", next ? "Voice replies are now enabled for Nventr." : "Voice replies were turned off.", "info");
    });

    languageSetting.addEventListener("change", function () {
      persistSettings({ preferredLanguage: languageSetting.value });
      pushPortalNotification("Language updated", `Nventr will prefer ${languageSetting.value} for prompts and explanations when available.`, "info");
    });

    legacySetting.addEventListener("click", function () {
      const next = legacySetting.getAttribute("aria-pressed") !== "true";
      persistSettings({ legacyMode: next });
      pushPortalNotification("Legacy flow preference updated", next ? "Legacy forms remain visible beside AI actions." : "The experience will emphasize AI-first flows.", "info");
    });
  }

  function openWorkflowModal(workflowKey, featureCard) {
    if (!utilityElements || !utilityElements.workflowPanel) {
      return;
    }

    const workflow = providerWorkflowBlueprints[workflowKey];
    if (!workflow) {
      return;
    }

    utilityElements.workflowEyebrow.textContent = workflow.eyebrow || "AI Workflow";
    utilityElements.workflowTitle.textContent = workflow.title;
    utilityElements.workflowDescription.textContent = featureCard && featureCard.body ? featureCard.body : workflow.description;
    utilityElements.workflowPrompt.textContent = featureCard && featureCard.prompt ? featureCard.prompt : workflow.queuePrompt;
    utilityElements.workflowFiles.textContent = attachedFiles.length
      ? `${attachedFiles.length} attached file${attachedFiles.length === 1 ? "" : "s"} will stay with this workflow: ${attachedFiles.map((file) => file.name).join(", ")}`
      : "No files attached. Attach records in Nventr for a richer workflow handoff.";

    utilityElements.workflowSteps.innerHTML = workflow.steps.map((step, index) => `
      <article class="rounded-[24px] border border-slate-800 bg-slate-950/60 p-4">
        <div class="flex items-start gap-3">
          <span class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-200">${index + 1}</span>
          <div>
            <p class="text-sm font-semibold text-white">${escapeHtml(step.label)}</p>
            <p class="mt-2 text-sm leading-7 text-slate-400">${escapeHtml(step.detail)}</p>
          </div>
        </div>
      </article>
    `).join("");

    utilityElements.workflowHighlights.innerHTML = workflow.highlights.map((item) => `
      <div class="rounded-[20px] border border-slate-800 bg-slate-950/70 p-4">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">${escapeHtml(item.label)}</p>
            <p class="mt-3 text-xl font-bold text-white">${escapeHtml(item.value)}</p>
          </div>
        </div>
        <p class="mt-2 text-sm text-slate-400">${escapeHtml(item.detail)}</p>
      </div>
    `).join("");

    utilityElements.workflowActions.innerHTML = "";

    const launchButton = document.createElement("button");
    launchButton.type = "button";
    launchButton.className = "rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-px";
    launchButton.textContent = "Queue AI Workflow";
    launchButton.addEventListener("click", function () {
      queueAgentAction(workflow.queueType, workflow.queuePrompt);
      pushPortalNotification(workflow.nextNotification, workflow.nextDetail, "queue");
      utilityElements.workflowPanel.hidden = true;
      openAssistant();
      appendAssistantMessage("assistant", `${workflow.title} is queued. ${workflow.nextDetail}`);
    });

    const askButton = document.createElement("button");
    askButton.type = "button";
    askButton.className = "rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400 hover:text-cyan-100";
    askButton.textContent = "Ask Nventr";
    askButton.addEventListener("click", function () {
      utilityElements.workflowPanel.hidden = true;
      submitPrompt(featureCard && featureCard.prompt ? featureCard.prompt : workflow.queuePrompt, { source: "assistant", statusElement: assistantElements ? assistantElements.status : null });
    });

    const legacyButton = document.createElement("button");
    legacyButton.type = "button";
    legacyButton.className = "rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white";
    legacyButton.textContent = "Keep Legacy Flow";
    legacyButton.addEventListener("click", function () {
      utilityElements.workflowPanel.hidden = true;
      pushPortalNotification("Legacy flow preserved", `${workflow.title} stayed in the existing manual path while AI insights remain available.`, "info");
    });

    utilityElements.workflowActions.appendChild(launchButton);
    utilityElements.workflowActions.appendChild(askButton);
    utilityElements.workflowActions.appendChild(legacyButton);
    utilityElements.workflowPanel.hidden = false;
  }

  function openInsightDrilldown(insightKey, override) {
    if (!utilityElements || !utilityElements.workflowPanel) {
      return;
    }

    const insight = providerInsightBlueprints[insightKey];
    if (!insight) {
      return;
    }

    const title = override && override.title ? override.title : insight.title;
    const description = override && override.description ? override.description : insight.description;
    const prompt = override && override.prompt ? override.prompt : insight.queuePrompt;

    utilityElements.workflowEyebrow.textContent = insight.eyebrow || "Record Drill-Down";
    utilityElements.workflowTitle.textContent = title;
    utilityElements.workflowDescription.textContent = description;
    utilityElements.workflowPrompt.textContent = prompt;
    utilityElements.workflowFiles.textContent = attachedFiles.length
      ? `${attachedFiles.length} attached file${attachedFiles.length === 1 ? "" : "s"} will stay with this review: ${attachedFiles.map((file) => file.name).join(", ")}`
      : "No files attached. Attach records in Nventr if you want the drill-down handoff to include supporting documents.";

    utilityElements.workflowSteps.innerHTML = insight.records.map((record, index) => `
      <article class="rounded-[24px] border border-slate-800 bg-slate-950/60 p-4">
        <div class="flex items-start gap-3">
          <span class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${record.tone === "ready" ? "bg-emerald-400/10 text-emerald-200" : record.tone === "handoff" ? "bg-amber-400/10 text-amber-200" : "bg-cyan-400/10 text-cyan-200"} text-sm font-bold">${index + 1}</span>
          <div>
            <p class="text-sm font-semibold text-white">${escapeHtml(record.label)}</p>
            <p class="mt-2 text-sm leading-7 text-slate-400">${escapeHtml(record.detail)}</p>
          </div>
        </div>
      </article>
    `).join("");

    utilityElements.workflowHighlights.innerHTML = insight.highlights.map((item) => `
      <div class="rounded-[20px] border border-slate-800 bg-slate-950/70 p-4">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">${escapeHtml(item.label)}</p>
            <p class="mt-3 text-xl font-bold text-white">${escapeHtml(item.value)}</p>
          </div>
        </div>
        <p class="mt-2 text-sm text-slate-400">${escapeHtml(item.detail)}</p>
      </div>
    `).join("");

    utilityElements.workflowActions.innerHTML = "";

    const queueButton = document.createElement("button");
    queueButton.type = "button";
    queueButton.className = "rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-px";
    queueButton.textContent = "Queue Next Action";
    queueButton.addEventListener("click", function () {
      queueAgentAction(insight.queueType, prompt);
      pushPortalNotification(insight.nextNotification, insight.nextDetail, "queue");
      utilityElements.workflowPanel.hidden = true;
      openAssistant();
      appendAssistantMessage("assistant", `${title} is queued. ${insight.nextDetail}`);
    });

    const askButton = document.createElement("button");
    askButton.type = "button";
    askButton.className = "rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400 hover:text-cyan-100";
    askButton.textContent = "Ask Nventr";
    askButton.addEventListener("click", function () {
      utilityElements.workflowPanel.hidden = true;
      submitPrompt(prompt, { source: "assistant", statusElement: assistantElements ? assistantElements.status : null });
    });

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white";
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", function () {
      utilityElements.workflowPanel.hidden = true;
    });

    utilityElements.workflowActions.appendChild(queueButton);
    utilityElements.workflowActions.appendChild(askButton);
    utilityElements.workflowActions.appendChild(closeButton);
    utilityElements.workflowPanel.hidden = false;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPrimaryInsertTarget() {
    if (pageKey === "dashborad.html") {
      return document.querySelector("main > div.flex-1") || document.querySelector("main");
    }

    return document.querySelector("main > div") || document.querySelector("main");
  }

  function buildFeatureCardsMarkup(cards) {
    return cards.map((card) => `
      <article class="nventr-feature-card" data-tone="${escapeHtml(card.tone || "cyan")}">
        <p class="nventr-feature-eyebrow ${card.tone === "amber" ? "text-amber-200" : card.tone === "emerald" ? "text-emerald-200" : card.tone === "indigo" ? "text-indigo-200" : "text-cyan-200"}">${escapeHtml(card.eyebrow)}</p>
        <h3 class="mt-3 text-lg font-bold text-white">${escapeHtml(card.title)}</h3>
        <p class="mt-3 text-sm leading-7 text-slate-300">${escapeHtml(card.body)}</p>
        <div class="mt-4 flex items-center justify-between gap-3">
          <span class="rounded-full bg-slate-900/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">AI ready</span>
          <div class="flex flex-wrap items-center justify-end gap-2">
            ${role === "provider" && card.workflow ? `<button class="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-transform hover:-translate-y-px" type="button" data-nventr-workflow="${escapeHtml(card.workflow)}" data-nventr-title="${escapeHtml(card.title)}" data-nventr-body="${escapeHtml(card.body)}" data-nventr-prompt="${escapeHtml(card.prompt)}">Launch Workflow</button>` : ""}
            <button class="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-cyan-400 hover:text-cyan-100" type="button" data-nventr-prompt="${escapeHtml(card.prompt)}">Ask Nventr</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  function decoratePortalExperience() {
    if (document.getElementById("nventrFeatureSpotlight")) {
      return;
    }

    const target = getPrimaryInsertTarget();
    if (!target) {
      return;
    }

    const pageCards = pageFeatureMap[pageKey] || [];
    const roleCards = roleSpotlights[role] || [];

    if (!pageCards.length && !roleCards.length) {
      return;
    }

    const spotlight = document.createElement("section");
    spotlight.id = "nventrFeatureSpotlight";
    spotlight.className = "nventr-spotlight mb-6 rounded-[28px] p-5 text-slate-100";

    const introCopy = role === "provider"
      ? "AI-led RCM, utilization, payment, and intelligence workflows stay available on every provider page while preserving legacy-friendly paths."
      : "AI-guided coverage, care, claims, pharmacy, and billing workflows stay available on every member page with voice, multilingual support, and human handoff.";

    spotlight.innerHTML = `
      <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AI Capability Coverage</p>
          <h2 class="mt-2 text-2xl font-bold text-white">${role === "provider" ? "Provider portal capabilities" : "Member portal capabilities"}</h2>
          <p class="mt-2 max-w-3xl text-sm text-slate-400">${escapeHtml(introCopy)}</p>
        </div>
        <div class="rounded-[22px] border border-slate-800 bg-slate-950/60 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current language</p>
          <p class="mt-2 text-sm font-semibold text-white">${escapeHtml(getSettings().preferredLanguage)}</p>
          <p class="mt-1 text-xs text-slate-400">${getSettings().legacyMode ? "Legacy flows stay visible beside AI actions." : "AI-first emphasis enabled."}</p>
        </div>
      </div>
      <div class="mt-5 nventr-feature-grid">${buildFeatureCardsMarkup(pageCards.length ? pageCards : roleCards.slice(0, 3))}</div>
      ${roleCards.length && pageCards.length ? `<div class="mt-5 nventr-feature-grid">${buildFeatureCardsMarkup(roleCards.slice(0, 2))}</div>` : ""}
    `;

    target.prepend(spotlight);
    wireFeaturePromptButtons(spotlight);

    if (pageKey === "operationaleffdashboard.html") {
      injectProviderMetrics(target);
    }

    if (pageKey === "dashborad.html") {
      injectMemberMetrics(target);
    }
  }

  function injectProviderMetrics(target) {
    if (document.getElementById("nventrProviderMetrics")) {
      return;
    }

    const metricSection = document.createElement("section");
    metricSection.id = "nventrProviderMetrics";
    metricSection.className = "nventr-spotlight mb-6 rounded-[28px] p-5 text-slate-100";
    metricSection.innerHTML = `
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Provider Dashboard</p>
          <h2 class="mt-2 text-2xl font-bold text-white">Metrics aligned to clean claims, quality, and growth</h2>
          <p class="mt-2 max-w-3xl text-sm text-slate-400">These tiles keep the provider dashboard action-oriented with first-pass quality, financial processing, quality scores, predictive utilization management, and AI-led next actions.</p>
        </div>
        <button class="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-cyan-400 hover:text-cyan-100" type="button" data-nventr-prompt="Summarize operational intelligence and recommend the top next actions">Ask Nventr</button>
      </div>
      <div class="mt-5 nventr-metric-grid">
        ${[
          ["Medical Coding First Pass", "96.1%", "+1.3% vs last week"],
          ["Clean Claim First Pass", "94.8%", "AI-coded queue in range"],
          ["Reduction in Denials", "18%", "Top denial families contained"],
          ["Call Resolution First Pass", "91%", "Live agent fallback covered"],
          ["Payment Processed", "$12.4M", "Posting + ERA automation"],
          ["MLR by Plan", "87.2%", "Target band maintained"],
          ["Rx Filled, $ Value", "18.6k / $2.8M", "Brand/generic mix visible"],
          ["HSA Usage", "64%", "Member adoption trending up"],
          ["First Pass Quality", "93%", "Clinical QA healthy"],
          ["CMS Star Ratings", "4.5 / 5", "Across active plans"],
          ["MIPS Score", "88 / 100", "Physician performance tracked"],
          ["Predictive UM", "22 episodes", "Spend down 11%, MLR impact favorable"]
        ].map(([label, value, note]) => `
          <article class="nventr-metric-card">
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">${label}</p>
            <p class="mt-3 text-2xl font-bold text-white">${value}</p>
            <p class="mt-2 text-sm text-slate-400">${note}</p>
          </article>
        `).join("")}
      </div>
    `;

    target.prepend(metricSection);
    wireFeaturePromptButtons(metricSection);
  }

  function injectMemberMetrics(target) {
    if (document.getElementById("nventrMemberMetrics")) {
      return;
    }

    const metricSection = document.createElement("section");
    metricSection.id = "nventrMemberMetrics";
    metricSection.className = "nventr-spotlight mb-6 rounded-[28px] p-5 text-slate-100";
    metricSection.innerHTML = `
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Member Insights</p>
          <h2 class="mt-2 text-2xl font-bold text-white">What is covered, what is next, and where AI can help</h2>
          <p class="mt-2 max-w-3xl text-sm text-slate-400">The member dashboard now carries the missing services from the brief: benefits, point-of-service payment, ad hoc claim help, multilingual support, EOB and statement AI, and pre/post care guidance.</p>
        </div>
        <button class="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-cyan-400 hover:text-cyan-100" type="button" data-nventr-prompt="Summarize my benefits, billing, pharmacy, appointments, and what is next">Ask Nventr</button>
      </div>
      <div class="mt-5 nventr-feature-grid">
        ${[
          ["Eligibility, Benefits, Coverage, Status", "AI keeps plan readiness, member status, and next-step explanations visible."],
          ["Payment at Point of Service", "Members can ask for payment guidance, statement support, and HSA-aware options."],
          ["Adhoc Claims, Appeals, Denials", "Claim questions and status explanations remain available without provider language clutter."],
          ["Pre and Post Care Management", "Care journey reminders and follow-up orchestration stay connected to the dashboard."],
          ["Appointments and Lab Scheduling", "Appointment booking can extend into test or lab follow-up scheduling."],
          ["Multilingual Agent", "Language preference flows into guidance, call scripts, and member-friendly support."],
          ["Rx Management and Delivery", "Refills, delivery options, and pharmacy payments stay in one view."],
          ["EOB Agent and Statement AI", "Members can ask for plain-language explanations before downloading files or contacting support."]
        ].map(([title, body], index) => `
          <article class="nventr-feature-card" data-tone="${index % 2 === 0 ? "cyan" : "emerald"}">
            <p class="nventr-feature-eyebrow ${index % 2 === 0 ? "text-cyan-200" : "text-emerald-200"}">Member AI</p>
            <h3 class="mt-3 text-lg font-bold text-white">${title}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-300">${body}</p>
          </article>
        `).join("")}
      </div>
    `;

    target.prepend(metricSection);
    wireFeaturePromptButtons(metricSection);
  }

  function wireFeaturePromptButtons(root) {
    root.querySelectorAll("[data-nventr-prompt]").forEach((button) => {
      if (button.dataset.nventrBound === "true") {
        return;
      }

      button.dataset.nventrBound = "true";
      button.addEventListener("click", function () {
        const prompt = button.getAttribute("data-nventr-prompt") || "";
        submitPrompt(prompt, { source: "assistant", statusElement: assistantElements ? assistantElements.status : null });
      });
    });

    root.querySelectorAll("[data-nventr-workflow]").forEach((button) => {
      if (button.dataset.nventrWorkflowBound === "true") {
        return;
      }

      button.dataset.nventrWorkflowBound = "true";
      button.addEventListener("click", function () {
        openWorkflowModal(button.getAttribute("data-nventr-workflow"), {
          title: button.getAttribute("data-nventr-title") || "",
          body: button.getAttribute("data-nventr-body") || "",
          prompt: button.getAttribute("data-nventr-prompt") || ""
        });
      });
    });
  }

  function wireGlobalPromptDelegation() {
    if (document.body.dataset.nventrDelegationBound === "true") {
      return;
    }

    document.body.dataset.nventrDelegationBound = "true";
    document.addEventListener("click", function (event) {
      const promptButton = event.target.closest("[data-nventr-prompt]");
      if (promptButton) {
        event.preventDefault();
        const prompt = promptButton.getAttribute("data-nventr-prompt") || "";
        submitPrompt(prompt, { source: "assistant", statusElement: assistantElements ? assistantElements.status : null });
        return;
      }

      const workflowButton = event.target.closest("[data-nventr-workflow]");
      if (workflowButton) {
        event.preventDefault();
        openWorkflowModal(workflowButton.getAttribute("data-nventr-workflow"), {
          title: workflowButton.getAttribute("data-nventr-title") || "",
          body: workflowButton.getAttribute("data-nventr-body") || "",
          prompt: workflowButton.getAttribute("data-nventr-prompt") || ""
        });
      }
    });
  }

  function bindProviderPageActions() {
    if (role !== "provider") {
      return;
    }

    if (pageKey === "operationaleffdashboard.html") {
      const applyRulesetButton = Array.from(document.querySelectorAll("button")).find((button) =>
        button.textContent.replace(/\s+/g, " ").trim().includes("Apply Ruleset")
      );
      if (applyRulesetButton && applyRulesetButton.dataset.nventrBound !== "true") {
        applyRulesetButton.dataset.nventrBound = "true";
        applyRulesetButton.addEventListener("click", function () {
          openWorkflowModal("operational_intelligence", {
            title: "Apply Recommended Action",
            body: "Launch the intelligence workflow to apply the recommended ruleset with AI guidance and PITL control.",
            prompt: "Apply the recommended ruleset and summarize expected impact"
          });
        });
      }

      [
        ["claimsYieldCard", "claims_yield", { title: "Claims automation yield detail", description: "Inspect the specific claims and QA exceptions driving the current clean-claim yield." }],
        ["denialRateCard", "appeal_rate", { title: "Appeal opportunity detail", description: "Inspect the denied and at-risk claims contributing to the current denial trend." }],
        ["payerTurnaroundCard", "payer_turnaround", { title: "Average payer turnaround detail", description: "Inspect the record-level delays creating current payer turnaround variance." }],
        ["recoveryOpportunityCard", "recovery_opportunity", { title: "Recovery opportunity detail", description: "Inspect the transaction and remit records behind the current recovery estimate." }],
        ["qualitySignalsCard", "quality_signals", { title: "Quality and payer signal detail", description: "Inspect the plans, physician measures, and engagement records behind quality movement." }],
        ["pharmacyUtilizationCard", "pharmacy_utilization", { title: "Pharmacy and utilization detail", description: "Inspect fill continuity, specialty escalations, and utilization records driving performance." }],
        ["mlrChartSection", "mlr_plan", { title: "MLR plan variance detail", description: "Inspect the plans and spend drivers behind MLR performance." }],
        ["predictiveAnalyticsSection", "forecast_action", { title: "Forecast and next-best action detail", description: "Inspect forecast assumptions and the exact actions Nventr recommends next." }],
        ["operationsMapSection", "operations_map", { title: "Live operations map detail", description: "Inspect region-level intake volume, handoff readiness, and queue concentration." }],
        ["planABar", "mlr_plan", { title: "Plan A detail", description: "Inspect why Plan A is staying inside the preferred MLR band.", prompt: "Review Plan A MLR detail and sustaining actions" }],
        ["planBBar", "mlr_plan", { title: "Plan B detail", description: "Inspect the spend, denial, and recovery drivers pushing Plan B outside the preferred band.", prompt: "Review Plan B MLR variance and highest-impact corrective actions" }],
        ["planCBar", "mlr_plan", { title: "Plan C detail", description: "Inspect the current utilization and recovery profile for Plan C.", prompt: "Review Plan C MLR detail and recommended actions" }],
        ["planDBar", "mlr_plan", { title: "Plan D detail", description: "Inspect the pharmacy and payment actions improving Plan D performance.", prompt: "Review Plan D improvement detail and recovery actions" }],
        ["planEBar", "mlr_plan", { title: "Plan E detail", description: "Inspect the balance of preventive closure and utilization in Plan E.", prompt: "Review Plan E MLR detail and next actions" }]
      ].forEach(function ([id, drilldownKey, override]) {
        const element = document.getElementById(id);
        if (!element || element.dataset.nventrBound === "true") {
          return;
        }
        element.dataset.nventrBound = "true";
        element.style.cursor = "pointer";
        element.addEventListener("click", function (event) {
          if (event.target.closest("button, a")) {
            return;
          }
          openInsightDrilldown(drilldownKey, override);
        });
      });

      bindRegionContainingText("Claims Automation Yield", function () {
        openInsightDrilldown("claims_yield", {
          title: "Claims automation yield detail",
          description: "Inspect the specific claims and QA exceptions driving the current clean-claim yield.",
          prompt: "Show the detail behind claims automation yield and coding quality"
        });
      });
      bindRegionContainingText("Appeal Opportunity Rate", function () {
        openInsightDrilldown("appeal_rate", {
          title: "Appeal opportunity detail",
          description: "Review the denial drivers, appeal candidates, and recovery actions behind the current appeal opportunity rate.",
          prompt: "Explain the current appeal opportunity rate and top recovery actions"
        });
      });
      bindRegionContainingText("Average Payer Turnaround", function () {
        openInsightDrilldown("payer_turnaround", {
          title: "Payer turnaround detail",
          description: "Break down turnaround delays by payer, posting exception, and authorization dependency.",
          prompt: "Analyze average payer turnaround and the main blockers"
        });
      });
      bindRegionContainingText("Recovery Opportunity", function () {
        openInsightDrilldown("recovery_opportunity", {
          title: "Recovery opportunity detail",
          description: "Inspect the underpayment, posting, and variance drivers behind the current recovery opportunity estimate.",
          prompt: "Explain the current recovery opportunity and top exception categories"
        });
      });
      bindRegionContainingText("Payer & Quality Signals", function () {
        openInsightDrilldown("quality_signals", {
          title: "Quality signal drill-down",
          description: "Open the intelligence workflow for CMS Stars, MIPS, member engagement, and quality signal review.",
          prompt: "Drill into payer and quality signals for the dashboard"
        });
      });
      bindRegionContainingText("Pharmacy & Utilization", function () {
        openInsightDrilldown("pharmacy_utilization", {
          title: "Pharmacy and utilization drill-down",
          description: "Review Rx fill trends, utilization patterns, and AI resolution drivers for provider operations.",
          prompt: "Drill into pharmacy and utilization intelligence"
        });
      });
      bindRegionContainingText("Intelligence Trends & Recovery Risk", function () {
        openInsightDrilldown("mlr_plan", {
          title: "Financial and MLR intelligence drill-down",
          description: "Review MLR variance by plan, recovery risk, and recommended actions behind the chart.",
          prompt: "Analyze financial performance, MLR risk, and recommended next actions"
        });
      });
      bindRegionContainingText("Priority Signal", function () {
        openWorkflowModal("claims_cac", {
          title: "Root cause drill-down",
          body: "Review the coding variance, attachment gaps, and payer-policy mismatch behind this signal.",
          prompt: "Drill into the root cause analysis and coding variance behind the current dashboard signal"
        });
      });
      bindRegionContainingText("Forecast & Next Best Action", function () {
        openInsightDrilldown("forecast_action", {
          title: "Forecast drill-down",
          description: "Explore the forecast assumptions and the AI next-best actions attached to the current signal.",
          prompt: "Explain the predictive forecast and next-best actions"
        });
      });
      bindRegionContainingText("Live Operations Map", function () {
        openInsightDrilldown("operations_map", {
          title: "Operations map drill-down",
          description: "Use the operations map to connect regional activity, intake volume, and handoff readiness.",
          prompt: "Show regional operations map detail and live handoff readiness"
        });
      });
    }

    if (pageKey === "claim1.html") {
      bindButtonByText("Approve All", function () {
        openWorkflowModal("claim_triage", {
          title: "Approve all AI-ready claim actions",
          body: "Queue the AI-ready claim and appeal actions with evidence packaging and human review where needed.",
          prompt: "Approve all AI-ready claim and appeal actions"
        });
      });
      bindButtonByText("Review", function () {
        openWorkflowModal("claim_triage", {
          title: "Review claim triage output",
          body: "Inspect denied or at-risk claims before AI or PITL routing continues.",
          prompt: "Review the current claim triage output"
        });
      });
      bindButtonByText("View all transactions", function () {
        navigatePortal("PaymentandRecon.html");
      });
      const recentClaimsBody = document.getElementById("recentClaimsBody");
      if (recentClaimsBody) {
        Array.from(recentClaimsBody.querySelectorAll("tr")).forEach((row, index) => {
          if (row.dataset.nventrBound === "true") {
            return;
          }

          row.dataset.nventrBound = "true";
          row.style.cursor = "pointer";
          row.addEventListener("click", function (event) {
            if (event.target.closest("button, a")) {
              return;
            }
            const claimId = row.children[0] ? row.children[0].textContent.replace(/\s+/g, " ").trim() : `Recent Claim ${index + 1}`;
            openWorkflowModal("claim_triage", {
              title: `${claimId} activity detail`,
              body: "Inspect the claim activity trail, likely next action, and whether the case belongs in clean-claim follow-up, payment review, or appeal preparation.",
              prompt: `Review activity and next action for ${claimId}`
            });
          });
        });
      }
    }

    if (pageKey === "denial.html") {
      bindButtonByText("Edit Appeal", function () {
        openWorkflowModal("appeal_packager", {
          title: "Edit AI appeal draft",
          body: "Keep the AI draft and evidence summary visible while you refine the final appeal packet.",
          prompt: "Edit the current appeal draft and show missing evidence"
        });
      });
      bindButtonByText("Attach Additional Records", function () {
        openAssistant();
        if (assistantElements && assistantElements.fileInput) {
          assistantElements.fileInput.click();
        }
      });
      bindButtonByText("Submit Appeal", function () {
        queueAgentAction("claim_workflow", "Submit the prepared appeal packet");
        pushPortalNotification("Appeal submitted", "The appeal packet was staged for submission and specialist review.", "queue");
        showPageBanner("Appeal submitted", "The appeal workflow was queued and the packet is ready for follow-through.", true);
      });
      bindIconOnlyButton("history", function () {
        pushPortalNotification("Appeal history ready", "Version history for the current appeal is now available in notifications.", "info");
        openUtilityPanel("notifications");
      });
      bindIconOnlyButton("print", function () {
        downloadTextFile("appeal-draft.txt", "Axis Core AI Appeal Draft\n\nThis export includes the current denial reasoning, AI counter-argument, and supporting evidence summary.");
        pushPortalNotification("Appeal draft exported", "The current appeal draft was exported for offline review.", "info");
      });
      bindRegionContainingText("Root Cause", function () {
        openWorkflowModal("appeal_packager", {
          title: "Denial root cause detail",
          body: "Drill into payer reasoning, policy mismatch, and AI counter-argument evidence for this appeal.",
          prompt: "Explain the denial root cause and strongest counter-arguments"
        });
      });
      bindRegionContainingText("Policy Alignment", function () {
        openWorkflowModal("appeal_packager", {
          title: "Evidence and precedent detail",
          body: "Review policy alignment, record validation, and precedent strength before the appeal is finalized.",
          prompt: "Review policy alignment, record validation, and precedent strength for this appeal"
        });
      });
    }

    if (pageKey === "auth.html") {
      bindButtonByText("Filters", function () {
        pushPortalNotification("Filters opened", "Prior authorization queue filters are ready for AI-guided refinement.", "info");
        showPageBanner("Filters ready", "Use Nventr prompts to narrow the authorization queue by payer, status, or document gaps.", true);
      });
      document.querySelectorAll(".group.cursor-pointer").forEach((card, index) => {
        if (card.dataset.nventrBound === "true") {
          return;
        }
        card.dataset.nventrBound = "true";
        card.addEventListener("click", function () {
          openWorkflowModal("utilization_prior_auth", {
            title: index === 0 ? "Approved prior auth review" : "Awaiting docs review",
            body: index === 0
              ? "Review the completed prior auth trail, AI checks, and payer pipeline details."
              : "Inspect missing clinical documentation and continue the prior auth workflow with AI guidance.",
            prompt: index === 0
              ? "Summarize the approved prior authorization workflow"
              : "Review missing clinical documentation for this prior authorization"
          });
        });
      });
      bindRegionContainingText("Clinical Necessity Check", function () {
        openWorkflowModal("utilization_prior_auth", {
          title: "Clinical necessity drill-down",
          body: "Inspect evidence match, conservative treatment proof, diagnosis alignment, and missing clinical support.",
          prompt: "Drill into the clinical necessity review and missing documentation"
        });
      });
      bindRegionContainingText("Payer Pipeline Status", function () {
        openWorkflowModal("utilization_prior_auth", {
          title: "Payer pipeline drill-down",
          body: "Review exactly where the current authorization sits in the payer pipeline and what happens next.",
          prompt: "Explain the payer pipeline status for the active authorization"
        });
      });
      bindRegionContainingText("Payer Intelligence", function () {
        openWorkflowModal("utilization_prior_auth", {
          title: "Payer intelligence drill-down",
          body: "Compare payer approval patterns and see where AI expects documentation or policy issues to change the outcome.",
          prompt: "Review payer intelligence and approval pattern detail for prior auth"
        });
      });
    }

    if (pageKey === "paymentandrecon.html") {
      bindButtonByText("Pending", function () {
        showPageBanner("Pending view selected", "Provider payment focus stays on open exceptions and unreconciled items.", true);
      });
      bindButtonByText("History", function () {
        showPageBanner("History view selected", "Provider payment history remains available while AI reconciliation suggestions stay visible.", true);
      });
      bindButtonByText("Generate Batch Report", function () {
        downloadTextFile("provider-batch-report.txt", "Axis Core AI Batch Report\n\nEDI 835 and ERA summary\nProcessed amount: $12.4M\nRecovery opportunity: $142k\nPosting completion: 82%\nTop exception: BCBS respiratory variance");
        pushPortalNotification("Batch report generated", "The provider batch report was generated for reconciliation review.", "info");
      });
      bindButtonByText("Resolve Now", function () {
        openWorkflowModal("payment_era", {
          title: "Resolve payment exception now",
          body: "Launch the ERA and underpayment workflow for the active financial exception.",
          prompt: "Resolve the active payment exception now"
        });
      });
      bindRepeatedButtonsByText("Receipt", function (_, index) {
        downloadTextFile(`provider-receipt-${index + 1}.txt`, `Axis Core AI Provider Receipt\n\nReceipt ${index + 1}\nGenerated: ${new Date().toLocaleString()}\nStatus: Paid\nChannel: Stored provider payment history`);
        pushPortalNotification("Receipt downloaded", `Provider receipt ${index + 1} was downloaded.`, "info");
      });
      bindButtonByText("Download Digital Receipt", function () {
        downloadTextFile("provider-digital-receipt.txt", "Axis Core AI Digital Receipt\n\nTransaction ID: TRX-98442109X\nRecipient: Dr. Aris Thorne, MD\nAmount: $350.00\nStatus: Confirmed");
        pushPortalNotification("Digital receipt downloaded", "The current payment receipt was generated for the provider workspace.", "info");
      });
      bindButtonByText("Email to Administrator", function () {
        navigatePortal("mailto:rcm-admin@axiscore.example?subject=Provider%20payment%20support%20request&body=Hello,%20please%20review%20the%20current%20payment%20exception%20and%20batch%20reconciliation%20status.");
        pushPortalNotification("Administrator draft opened", "A provider payment support email draft was opened with the prefilled administrator recipient.", "info");
      });
      bindRegionContainingText("ERA_BATCH_#90210", function () {
        openWorkflowModal("payment_era", {
          title: "ERA batch detail",
          body: "Inspect the processed ERA batch, line-item volume, completed status, and exception carry-forward.",
          prompt: "Review ERA batch 90210 detail and remaining exceptions"
        });
      });
      bindRegionContainingText("Mismatch Detection", function () {
        openWorkflowModal("payment_era", {
          title: "Mismatch detection detail",
          body: "Review the expected versus received payment difference, adjudication code mismatch, and recovery action.",
          prompt: "Drill into the current mismatch detection case and recommended recovery action"
        });
      });
      bindRegionContainingText("AI-Predicted Ledger Path", function () {
        openWorkflowModal("rcm_pitl", {
          title: "Ledger path drill-down",
          body: "See how AI predicts the ledger path from intake through adjudication, settlement, and PITL checkpoints.",
          prompt: "Explain the predicted ledger path and PITL checkpoints"
        });
      });
      bindRegionContainingText(["City General Medical", "$142.00"], function () {
        openWorkflowModal("payment_era", {
          title: "Transaction detail - City General Medical",
          body: "Review transaction source, payment method, receipt, and any reconciliation notes for this payment line.",
          prompt: "Review the City General Medical transaction detail"
        });
      });
      bindRegionContainingText(["CVS Pharmacy #492", "$24.50"], function () {
        openWorkflowModal("payment_era", {
          title: "Transaction detail - CVS Pharmacy",
          body: "Review the payment line, posting channel, and reconciliation status for the pharmacy transaction.",
          prompt: "Review the CVS Pharmacy transaction detail"
        });
      });
    }

    if (pageKey === "members.html") {
      bindButtonByText("Back to Intelligence", function () {
        navigatePortal("OperationalEffDashboard.html");
      });
      const memberDirectoryBody = document.getElementById("memberDirectoryBody");
      if (memberDirectoryBody) {
        Array.from(memberDirectoryBody.querySelectorAll("tr")).forEach((row) => {
          if (row.dataset.nventrBound === "true") {
            return;
          }

          row.dataset.nventrBound = "true";
          row.style.cursor = "pointer";
          row.addEventListener("click", function (event) {
            if (event.target.closest("button, a")) {
              return;
            }
            const memberName = row.querySelector("p.font-semibold") ? row.querySelector("p.font-semibold").textContent.trim() : "Member";
            openWorkflowModal("member_ops", {
              title: `${memberName} member detail`,
              body: "Open the provider-side member detail view for status, plan, enrollment blockers, and next best actions.",
              prompt: `Review provider-side member detail and next actions for ${memberName}`
            });
          });
        });
      }
      const draftQueue = document.getElementById("draftQueue");
      if (draftQueue) {
        Array.from(draftQueue.children).forEach((card) => {
          if (card.dataset.nventrBound === "true") {
            return;
          }

          card.dataset.nventrBound = "true";
          card.style.cursor = "pointer";
          card.addEventListener("click", function (event) {
            if (event.target.closest("button, a")) {
              return;
            }
            const draftName = card.querySelector("p.font-semibold") ? card.querySelector("p.font-semibold").textContent.trim() : "Enrollment Draft";
            openWorkflowModal("member_ops", {
              title: `${draftName} draft detail`,
              body: "Review saved enrollment progress, missing fields, and whether to resume the provider-assisted flow.",
              prompt: `Review the enrollment draft detail for ${draftName}`
            });
          });
        });
      }
    }
  }

  function bindButtonByText(label, handler) {
    const button = Array.from(document.querySelectorAll("button")).find((entry) =>
      entry.textContent.replace(/\s+/g, " ").trim() === label
    );

    if (!button || button.dataset.nventrBound === "true") {
      return;
    }

    button.dataset.nventrBound = "true";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      handler(button);
    });
  }

  function bindRegionContainingText(textNeedles, handler, bindAll) {
    const needles = Array.isArray(textNeedles) ? textNeedles : [textNeedles];
    const candidates = Array.from(document.querySelectorAll("section, article, div.glass-panel, div.group.cursor-pointer, tr, a.glass-panel, div.rounded-xl, div.rounded-2xl, div.rounded-3xl"))
      .filter((node) => node.children.length)
      .filter((node) => {
        const compact = node.textContent.replace(/\s+/g, " ").trim();
        return needles.every((needle) => compact.includes(needle));
      });

    const targets = bindAll ? candidates : candidates.slice(0, 1);
    targets.forEach((target, index) => {
      if (target.dataset.nventrBound === "true") {
        return;
      }

      target.dataset.nventrBound = "true";
      target.style.cursor = "pointer";
      target.addEventListener("click", function (event) {
        if (event.target.closest("button, a, input, select, textarea")) {
          return;
        }
        handler(target, index);
      });
    });
  }

  function bindRepeatedButtonsByText(label, handler) {
    Array.from(document.querySelectorAll("button")).forEach((button, index) => {
      if (button.textContent.replace(/\s+/g, " ").trim() !== label || button.dataset.nventrBound === "true") {
        return;
      }

      button.dataset.nventrBound = "true";
      button.addEventListener("click", function (event) {
        event.preventDefault();
        handler(button, index);
      });
    });
  }

  function bindIconOnlyButton(iconText, handler) {
    const button = Array.from(document.querySelectorAll("button")).find((entry) => {
      const compact = entry.textContent.replace(/\s+/g, " ").trim();
      return compact === iconText;
    });

    if (!button || button.dataset.nventrBound === "true") {
      return;
    }

    button.dataset.nventrBound = "true";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      handler(button);
    });
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function navigatePortal(target) {
    if (typeof window.__bundleRedirect === "function") {
      return window.__bundleRedirect(target);
    }
    window.location.href = target;
    return target;
  }

  function showPageBanner(title, detail, success) {
    let banner = document.getElementById("nventrPageBanner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "nventrPageBanner";
      banner.className = "fixed right-6 top-24 z-[90] max-w-md rounded-2xl border px-5 py-4 text-sm shadow-2xl";
      document.body.appendChild(banner);
    }

    banner.className = success
      ? "fixed right-6 top-24 z-[90] max-w-md rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-50 shadow-2xl"
      : "fixed right-6 top-24 z-[90] max-w-md rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-50 shadow-2xl";
    banner.innerHTML = `<p class="font-bold">${escapeHtml(title)}</p><p class="mt-1 opacity-90">${escapeHtml(detail)}</p>`;
    window.clearTimeout(window.__nventrPageBannerTimeout);
    window.__nventrPageBannerTimeout = window.setTimeout(function () {
      banner.remove();
    }, 3200);
  }

  function buildProviderShell() {
    if (isConsolidatedBundle || !isProviderWorkspace || !document.body || document.getElementById("providerWorkspaceShell")) {
      return;
    }

    document.body.classList.add("provider-shell-active");
    localStorage.setItem("preferredRole", "provider");

    const shell = document.createElement("div");
    shell.id = "providerWorkspaceShell";
    shell.innerHTML = `
      <aside class="provider-shell-sidebar flex flex-col px-4 py-5 text-slate-300">
        <a class="flex items-center gap-3 rounded-2xl px-3 py-3 text-white" href="OperationalEffDashboard.html">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">neurology</span>
          </span>
          <div>
            <p class="text-sm font-bold">Axis Core AI</p>
            <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">Provider Workspace</p>
          </div>
        </a>
        <div class="mt-8 flex-1 space-y-2" id="providerShellNav"></div>
      </aside>
      <header class="provider-shell-topbar">
        <div class="px-6 py-4">
          <div class="flex items-start justify-between gap-4">
            <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Provider Workspace</p>
              <p class="mt-1 text-lg font-bold text-white">${getProviderPageLabel()}</p>
              <nav class="provider-shell-top-tabs" id="providerShellTopTabs" aria-label="Provider top navigation"></nav>
            </div>
            <div class="flex items-center gap-3">
              <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-indigo-400 hover:text-white" type="button" title="Notifications" data-nventr-panel="notifications">
                <span class="material-symbols-outlined">notifications</span>
              </button>
              <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-indigo-400 hover:text-white" type="button" title="Settings" data-nventr-panel="settings">
                <span class="material-symbols-outlined">settings</span>
              </button>
              <a class="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 transition-colors hover:border-indigo-400" href="SignIn.html" title="Profile">
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                  <span class="material-symbols-outlined">account_circle</span>
                </span>
                <span class="hidden text-sm font-medium md:inline">Provider Profile</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    `;

    document.body.appendChild(shell);

    const navRoot = shell.querySelector("#providerShellNav");
    providerNavItems.forEach((item) => {
      const active = item.matches.includes(pageKey);
      const link = document.createElement("a");
      link.href = item.href;
      link.className = `provider-shell-link flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${active ? "provider-shell-link-active" : ""}`;
      link.innerHTML = `
        <span class="material-symbols-outlined ${active ? "text-indigo-300" : "text-slate-500"}">${item.icon}</span>
        <span>${item.label}</span>
      `;
      navRoot.appendChild(link);
    });

    const topTabsRoot = shell.querySelector("#providerShellTopTabs");
    providerTopTabs.forEach((item) => {
      const active = item.matches.includes(pageKey);
      const link = document.createElement("a");
      link.href = item.href;
      link.className = `provider-shell-tab ${active ? "provider-shell-tab-active" : ""}`;
      link.textContent = item.label;
      topTabsRoot.appendChild(link);
    });
  }

  function buildMemberShell() {
    if (isConsolidatedBundle || !isMemberWorkspace || !document.body || document.getElementById("memberWorkspaceShell")) {
      return;
    }

    document.body.classList.add("member-shell-active");
    localStorage.setItem("preferredRole", "member");

    const enrollment = JSON.parse(localStorage.getItem("latestMemberEnrollment") || "null");
    const memberName = enrollment?.registration?.fullName || "Member";
    const memberPlan = enrollment?.plan?.details?.name || "Benefits & support";

    const shell = document.createElement("div");
    shell.id = "memberWorkspaceShell";
    shell.innerHTML = `
      <aside class="member-shell-sidebar flex flex-col px-4 py-5 text-slate-300">
        <a class="flex items-center gap-3 rounded-2xl px-3 py-3 text-white" href="Dashborad.html">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">favorite</span>
          </span>
          <div>
            <p class="text-sm font-bold">Axis Core AI</p>
            <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">Member Portal</p>
          </div>
        </a>
        <div class="mt-8 flex-1 space-y-2" id="memberShellNav"></div>
        <div class="mt-8 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Member View</p>
          <p class="mt-2 text-sm font-semibold text-white">${memberName}</p>
          <p class="mt-1 text-xs text-slate-400">${memberPlan}</p>
        </div>
      </aside>
      <header class="member-shell-topbar">
        <div class="flex h-full items-center justify-between px-6">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Member Workspace</p>
            <p class="mt-1 text-lg font-bold text-white">${getMemberPageLabel()}</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-cyan-400 hover:text-white" type="button" title="Notifications" data-nventr-panel="notifications">
              <span class="material-symbols-outlined">notifications</span>
            </button>
            <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-cyan-400 hover:text-white" type="button" title="Settings" data-nventr-panel="settings">
              <span class="material-symbols-outlined">settings</span>
            </button>
            <a class="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 transition-colors hover:border-cyan-400" href="SignIn.html" title="Profile">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200">
                <span class="material-symbols-outlined">account_circle</span>
              </span>
              <span class="hidden text-sm font-medium md:inline">Profile</span>
            </a>
          </div>
        </div>
      </header>
    `;

    document.body.appendChild(shell);

    const navRoot = shell.querySelector("#memberShellNav");
    memberNavItems.forEach((item) => {
      const active = item.matches.includes(pageKey);
      const link = document.createElement("a");
      link.href = item.href;
      link.className = `member-shell-link flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${active ? "member-shell-link-active" : ""}`;
      link.innerHTML = `
        <span class="material-symbols-outlined ${active ? "text-cyan-200" : "text-slate-500"}">${item.icon}</span>
        <span>${item.label}</span>
      `;
      navRoot.appendChild(link);
    });
  }

  function getProviderPageLabel() {
    const item = providerNavItems.find((entry) => entry.matches.includes(pageKey));
    return item ? item.label : "Provider Workspace";
  }

  function getMemberPageLabel() {
    const item = memberNavItems.find((entry) => entry.matches.includes(pageKey));
    return item ? item.label : "Member Workspace";
  }

  function normalizeLabels() {
    const candidates = document.querySelectorAll("a, button, span, h1, h2, h3, h4, h5");

    candidates.forEach((element) => {
      const compactText = element.textContent.replace(/\s+/g, " ").trim();
      if (!compactText || compactText.length > 40) {
        return;
      }

      const exactRule = labelRules.find((rule) => rule.text === compactText);
      if (exactRule) {
        replaceStandaloneText(element, exactRule.next);
      }
    });

    linkRules.forEach((rule) => {
      document.querySelectorAll(`a[href="${rule.href}"]`).forEach((anchor) => {
        if (anchor.closest("#providerShellTopTabs")) {
          return;
        }
        const compactText = anchor.textContent.replace(/\s+/g, " ").trim();
        const matched = rule.matches.find((text) => compactText === text || compactText.endsWith(` ${text}`));
        if (matched) {
          replaceAnchorLabel(anchor, matched, rule.next);
        }
      });
    });

    const requestDemoLink = document.getElementById("requestDemoLink");
    if (requestDemoLink && requestDemoLink.getAttribute("href") === "SignIn.html") {
      requestDemoLink.textContent = "Sign In";
    }
  }

  function replaceStandaloneText(element, next) {
    const iconChild = Array.from(element.children).find((child) =>
      child.classList && child.classList.contains("material-symbols-outlined")
    );

    if (!iconChild && element.children.length === 0) {
      element.textContent = next;
      return;
    }

    const labelChild = Array.from(element.children).find((child) => {
      const text = child.textContent.replace(/\s+/g, " ").trim();
      return text && !child.classList.contains("material-symbols-outlined");
    });

    if (labelChild) {
      labelChild.textContent = next;
      return;
    }

    const textNodes = Array.from(element.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
    const candidate = textNodes.find((node) => node.textContent.replace(/\s+/g, " ").trim());
    if (candidate) {
      candidate.textContent = ` ${next}`;
    }
  }

  function replaceAnchorLabel(anchor, current, next) {
    const descendants = anchor.querySelectorAll("span, h4, p");
    let replaced = false;

    descendants.forEach((node) => {
      if (replaced) {
        return;
      }

      const compactText = node.textContent.replace(/\s+/g, " ").trim();
      if (compactText === current) {
        node.textContent = next;
        replaced = true;
      }
    });

    if (replaced) {
      return;
    }

    const directNodes = Array.from(anchor.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
    const directMatch = directNodes.find((node) => node.textContent.replace(/\s+/g, " ").trim() === current);
    if (directMatch) {
      directMatch.textContent = ` ${next}`;
    }
  }

  function buildAssistant() {
    if (!document.body || document.getElementById("nventr-shell-root")) {
      return;
    }

    const shellRoot = document.createElement("div");
    shellRoot.className = "nventr-shell";
    shellRoot.id = "nventr-shell-root";

    shellRoot.innerHTML = `
      <button class="nventr-fab inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-transform" type="button" id="nventrFab">
        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
        <span>Nventr</span>
      </button>
      <section class="nventr-panel rounded-[28px] p-4 text-slate-100" hidden id="nventrPanel" aria-label="Nventr assistant">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AI Assistant</p>
            <h2 class="mt-2 text-lg font-bold text-white">Nventr is here on every screen.</h2>
            <p class="mt-1 text-sm text-slate-400">${role === "provider" ? "Claims, prior auth, billing, and provider onboarding support are ready." : "Enrollment, benefits, billing, appointments, and pharmacy support are ready."}</p>
          </div>
          <button class="rounded-full border border-slate-700 p-2 text-slate-400 transition-colors hover:text-white" type="button" id="nventrClose">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div class="mb-4 flex flex-wrap gap-2" id="nventrChips"></div>
        <div class="nventr-scroll flex max-h-[20rem] flex-col gap-3 overflow-y-auto rounded-[24px] border border-slate-800 bg-slate-950/60 p-3" id="nventrMessages"></div>
        <div class="nventr-assistant-actions mt-4">
          <button class="rounded-[18px] border border-slate-700 bg-slate-950/60 px-3 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-100" type="button" id="nventrAttachButton">
            <span class="material-symbols-outlined mr-2 align-middle text-[18px]">attach_file</span>
            Attach Files
          </button>
          <button class="rounded-[18px] border border-slate-700 bg-slate-950/60 px-3 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:border-amber-400 hover:text-amber-100" type="button" id="nventrHandoffButton">
            <span class="material-symbols-outlined mr-2 align-middle text-[18px]">support_agent</span>
            Human Handoff
          </button>
        </div>
        <input hidden id="nventrFileInput" multiple type="file" />
        <p class="mt-3 text-xs text-slate-500" id="nventrFileStatus">You can attach records, referral packets, EOBs, or claim documents for Nventr to act on.</p>
        <div class="mt-4 rounded-[24px] border border-slate-800 bg-slate-950/70 p-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-medium text-slate-400" id="nventrStatus">Ready for your next question.</p>
            <button class="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 transition-colors hover:border-cyan-400 hover:text-cyan-200" type="button" id="nventrVoiceReply">
              Voice Off
            </button>
          </div>
          <div class="nventr-prompt-input flex items-center gap-2 rounded-[22px] px-3 py-2">
            <input class="min-w-0 flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500" id="nventrInput" placeholder="Ask Nventr anything..." type="text" />
            <button class="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:border-cyan-400 hover:text-cyan-200" type="button" id="nventrMic">
              <span class="material-symbols-outlined text-[18px]">mic</span>
            </button>
            <button class="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-px" type="button" id="nventrSend">
              Send
            </button>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(shellRoot);

    assistantElements = {
      fab: shellRoot.querySelector("#nventrFab"),
      panel: shellRoot.querySelector("#nventrPanel"),
      close: shellRoot.querySelector("#nventrClose"),
      chips: shellRoot.querySelector("#nventrChips"),
      messages: shellRoot.querySelector("#nventrMessages"),
      input: shellRoot.querySelector("#nventrInput"),
      send: shellRoot.querySelector("#nventrSend"),
      mic: shellRoot.querySelector("#nventrMic"),
      status: shellRoot.querySelector("#nventrStatus"),
      voiceReply: shellRoot.querySelector("#nventrVoiceReply"),
      attachButton: shellRoot.querySelector("#nventrAttachButton"),
      handoffButton: shellRoot.querySelector("#nventrHandoffButton"),
      fileInput: shellRoot.querySelector("#nventrFileInput"),
      fileStatus: shellRoot.querySelector("#nventrFileStatus")
    };

    voiceRepliesEnabled = Boolean(getSettings().voiceReplies);
    assistantElements.voiceReply.textContent = voiceRepliesEnabled ? "Voice On" : "Voice Off";

    renderAssistantChips();
    seedAssistant();

    assistantElements.fab.addEventListener("click", toggleAssistant);
    assistantElements.close.addEventListener("click", closeAssistant);
    assistantElements.send.addEventListener("click", function () {
      submitPrompt(assistantElements.input.value, { source: "assistant", statusElement: assistantElements.status });
    });
    assistantElements.input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitPrompt(assistantElements.input.value, { source: "assistant", statusElement: assistantElements.status });
      }
    });
    assistantElements.mic.addEventListener("click", function () {
      startVoiceCapture(assistantElements.input, assistantElements.status, function (transcript) {
        submitPrompt(transcript, { source: "assistant", statusElement: assistantElements.status });
      });
    });
    assistantElements.voiceReply.addEventListener("click", function () {
      persistSettings({ voiceReplies: !voiceRepliesEnabled });
      assistantElements.status.textContent = voiceRepliesEnabled
        ? "Voice replies enabled."
        : "Voice replies disabled.";
      pushPortalNotification("Voice replies updated", voiceRepliesEnabled ? "Nventr will speak confirmations back." : "Nventr will keep responses text-only.", "info");
    });
    assistantElements.attachButton.addEventListener("click", function () {
      assistantElements.fileInput.click();
    });
    assistantElements.fileInput.addEventListener("change", handleFileAttachment);
    assistantElements.handoffButton.addEventListener("click", requestHumanHandoff);
  }

  function renderAssistantChips() {
    if (!assistantElements) {
      return;
    }

    const prompts = promptCatalog[role] || promptCatalog.member;
    assistantElements.chips.innerHTML = "";

    prompts.forEach((prompt) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nventr-chip rounded-full px-3 py-2 text-xs font-semibold transition-colors hover:border-cyan-400 hover:text-cyan-100";
      button.textContent = prompt;
      button.addEventListener("click", function () {
        submitPrompt(prompt, { source: "assistant", statusElement: assistantElements.status });
      });
      assistantElements.chips.appendChild(button);
    });
  }

  function seedAssistant() {
    appendAssistantMessage(
      "assistant",
      role === "provider"
        ? "Hi, I am Nventr. I can help you move from claims to prior auth, payments, and provider verification without leaving the screen."
        : "Hi, I am Nventr. I can guide enrollment, benefits, appointments, billing, pharmacy, and claims from anywhere in the portal."
    );
  }

  function appendAssistantMessage(type, text) {
    if (!assistantElements || !assistantElements.messages) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = type === "assistant" ? "flex justify-start" : "flex justify-end";

    const bubble = document.createElement("div");
    bubble.className =
      type === "assistant"
        ? "max-w-[85%] rounded-[22px] rounded-tl-md bg-slate-800 px-4 py-3 text-sm text-slate-100"
        : "max-w-[85%] rounded-[22px] rounded-tr-md bg-cyan-400 px-4 py-3 text-sm font-medium text-slate-950";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    assistantElements.messages.appendChild(wrapper);
    assistantElements.messages.scrollTop = assistantElements.messages.scrollHeight;
  }

  function toggleAssistant() {
    assistantOpen = !assistantOpen;
    if (!assistantElements) {
      return;
    }
    assistantElements.panel.hidden = !assistantOpen;
    if (assistantOpen) {
      assistantElements.input.focus();
    }
  }

  function closeAssistant() {
    assistantOpen = false;
    if (assistantElements) {
      assistantElements.panel.hidden = true;
    }
  }

  function openAssistant() {
    if (!assistantOpen) {
      toggleAssistant();
    }
  }

  function handleFileAttachment(event) {
    attachedFiles = Array.from(event.target.files || []).map((file) => ({
      name: file.name,
      size: file.size
    }));

    if (!attachedFiles.length) {
      assistantElements.fileStatus.textContent = "No files attached.";
      return;
    }

    const names = attachedFiles.map((file) => file.name).join(", ");
    assistantElements.fileStatus.textContent = `${attachedFiles.length} file${attachedFiles.length === 1 ? "" : "s"} attached: ${names}`;
    appendAssistantMessage("assistant", `I have the file set: ${names}. You can now ask me to submit a claim, prior auth, appeal, or other workflow action.`);
    pushPortalNotification("Files attached to Nventr", `${attachedFiles.length} file${attachedFiles.length === 1 ? "" : "s"} ready for AI action: ${names}`, "queue");
  }

  function requestHumanHandoff() {
    const handoff = {
      requestedAt: new Date().toISOString(),
      role,
      page: pageName,
      pendingPrompt: assistantElements ? assistantElements.input.value.trim() : "",
      attachedFiles
    };

    localStorage.setItem("nventrHumanHandoff", JSON.stringify(handoff));
    openAssistant();
    appendAssistantMessage("assistant", "I have created a human handoff request with your latest context and attached files. A support specialist can pick it up if AI does not fully resolve this workflow.");
    if (assistantElements) {
      assistantElements.status.textContent = "Human handoff requested.";
    }
    pushPortalNotification("Human handoff requested", "A live specialist can now review the latest AI context and attached files.", "handoff");
  }

  function enhanceDashboards() {
    addDashboardPromptBar();
    wireExistingDashboardPrompts();
  }

  function refineIntelligenceView() {
    if (pageKey !== "operationaleffdashboard.html") {
      return;
    }

    document.title = "Axis Core AI - Provider Dashboard";

    const textReplacements = [
      ["Clean Claim First Pass", "Claims Automation Yield"],
      ["Denial Rate", "Appeal Opportunity Rate"],
      ["Avg Processing Time", "Average Payer Turnaround"],
      ["Revenue Leakage", "Recovery Opportunity"],
      ["Clinical & Quality", "Payer & Quality Signals"],
      ["Pharmacy & Ops", "Pharmacy & Utilization"],
      ["Financial Performance & MLR Ratio", "Intelligence Trends & Recovery Risk"],
      ["AI Intelligence", "Nventr Command Center"],
      ["Root Cause Analysis", "Priority Signal"],
      ["Recommendation", "Recommended Action"],
      ["Predictive Analytics", "Forecast & Next Best Action"],
      ["Live Region A Hub", "Live Operations Map"],
      ["Provider Satisfaction", "Provider Confidence"],
      ["Apply Ruleset", "Apply Recommended Action"]
    ];

    textReplacements.forEach(([from, to]) => {
      Array.from(document.querySelectorAll("span, h1, h2, h3, h4, p, button")).forEach((node) => {
        if (node.children.length) {
          return;
        }

        const compactText = node.textContent.replace(/\s+/g, " ").trim();
        if (compactText === from) {
          node.textContent = to;
        }
      });
    });

    const mainIntro = Array.from(document.querySelectorAll("div.h-8.w-full.mt-2.text-sm.text-slate-400")).find(Boolean);
    if (mainIntro) {
      mainIntro.textContent = "Launch provider-assisted member enrollment and keep status visible in Members.";
    }

    const intelligenceCopy = Array.from(document.querySelectorAll("div.p-4.rounded-xl.bg-surface-container-high\\/50.border.border-outline-variant\\/20.text-sm.leading-relaxed.text-slate-300")).find(Boolean);
    if (intelligenceCopy) {
      intelligenceCopy.innerHTML = 'Payer variance for <strong class="text-indigo-400">BCBS respiratory claims</strong> is trending above baseline. Nventr traced the issue to coding variance, missing attachments, and late prior auth linkage.';
    }
  }

  function addDashboardPromptBar() {
    if (pageKey !== "dashborad.html" && pageKey !== "operationaleffdashboard.html") {
      return;
    }

    if (document.getElementById("nventrDashboardPrompt")) {
      return;
    }

    const promptCard = document.createElement("section");
    promptCard.id = "nventrDashboardPrompt";
    promptCard.className = "nventr-prompt-card mb-6 rounded-[28px] p-5 text-slate-100";
    promptCard.innerHTML = `
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Guided Prompting</p>
          <h2 class="mt-2 text-2xl font-bold text-white">Ask Nventr from the dashboard.</h2>
          <p class="mt-2 max-w-2xl text-sm text-slate-400">${role === "provider" ? "Use typed or voice prompts to move straight into claims, prior auth, billing, and enrollment support." : "Use typed or voice prompts to review claims, appointments, enrollment, billing, and pharmacy tasks from one place."}</p>
        </div>
        <div class="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200">
          <span class="material-symbols-outlined text-[18px]">graphic_eq</span>
          Voice Prompt Ready
        </div>
      </div>
      <div class="mt-5 flex flex-wrap gap-2" id="nventrDashboardChips"></div>
      <div class="mt-4 nventr-prompt-input rounded-[24px] px-4 py-3">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input class="min-w-0 flex-1 border-none bg-transparent text-base text-white outline-none placeholder:text-slate-500" id="nventrDashboardInput" placeholder="${role === "provider" ? "Try: show claim status for April respiratory cases" : "Try: explain my latest EOB and next payment step"}" type="text" />
          <div class="flex items-center gap-2">
            <button class="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-100" id="nventrDashboardMic" type="button">
              <span class="material-symbols-outlined mr-2 align-middle text-[18px]">mic</span>Voice
            </button>
            <button class="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-px" id="nventrDashboardSend" type="button">
              Send Prompt
            </button>
          </div>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-400" id="nventrDashboardStatus">Ready for typed or voice prompts.</p>
    `;

    if (pageKey === "dashborad.html") {
      const memberDashboardCanvas = document.querySelector("main > div.flex-1");
      if (memberDashboardCanvas) {
        memberDashboardCanvas.prepend(promptCard);
      }
    } else {
      const dashboardCanvas = document.querySelector("main > div");
      if (dashboardCanvas) {
        dashboardCanvas.prepend(promptCard);
      }
    }

    const dashboardInput = document.getElementById("nventrDashboardInput");
    const dashboardStatus = document.getElementById("nventrDashboardStatus");
    const dashboardSend = document.getElementById("nventrDashboardSend");
    const dashboardMic = document.getElementById("nventrDashboardMic");
    const dashboardChips = document.getElementById("nventrDashboardChips");

    (promptCatalog[role] || promptCatalog.member).forEach((prompt) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "nventr-chip rounded-full px-3 py-2 text-xs font-semibold transition-colors hover:border-cyan-400 hover:text-cyan-100";
      chip.textContent = prompt;
      chip.addEventListener("click", function () {
        dashboardInput.value = prompt;
        submitPrompt(prompt, { source: "dashboard", statusElement: dashboardStatus });
      });
      dashboardChips.appendChild(chip);
    });

    dashboardSend.addEventListener("click", function () {
      submitPrompt(dashboardInput.value, { source: "dashboard", statusElement: dashboardStatus });
    });

    dashboardInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitPrompt(dashboardInput.value, { source: "dashboard", statusElement: dashboardStatus });
      }
    });

    dashboardMic.addEventListener("click", function () {
      startVoiceCapture(dashboardInput, dashboardStatus, function (transcript) {
        submitPrompt(transcript, { source: "dashboard", statusElement: dashboardStatus });
      });
    });
  }

  function wireExistingDashboardPrompts() {
    const heroInput = Array.from(document.querySelectorAll('input[type="text"]')).find((input) => {
      const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
      return placeholder.includes("ask anything");
    });

    if (!heroInput) {
      return;
    }

    const wrapper = heroInput.closest("div");
    if (!wrapper) {
      return;
    }

    const buttons = wrapper.querySelectorAll("button");
    const statusElement = Array.from(document.querySelectorAll("span, p")).find((element) =>
      element.textContent.includes("Listening for")
    );

    const micButton = Array.from(buttons).find((button) => button.textContent.toLowerCase().includes("mic"));
    const sendButton = Array.from(buttons).find((button) => button.textContent.toLowerCase().includes("send"));
    const chips = Array.from(document.querySelectorAll("button")).filter((button) => {
      const text = button.textContent.replace(/\s+/g, " ").trim();
      return (promptCatalog[role] || []).includes(text);
    });

    if (sendButton) {
      sendButton.addEventListener("click", function () {
        submitPrompt(heroInput.value, { source: "dashboard", statusElement: statusElement || assistantElements.status });
      });
    }

    if (micButton) {
      micButton.addEventListener("click", function () {
        startVoiceCapture(heroInput, statusElement || assistantElements.status, function (transcript) {
          submitPrompt(transcript, { source: "dashboard", statusElement: statusElement || assistantElements.status });
        });
      });
    }

    heroInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        submitPrompt(heroInput.value, { source: "dashboard", statusElement: statusElement || assistantElements.status });
      }
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", function () {
        submitPrompt(chip.textContent.trim(), { source: "dashboard", statusElement: statusElement || assistantElements.status });
      });
    });
  }

  function submitPrompt(prompt, options) {
    const trimmedPrompt = (prompt || "").trim();
    if (!trimmedPrompt) {
      if (options.statusElement) {
        options.statusElement.textContent = "Please enter or speak a prompt first.";
      }
      return;
    }

    appendAssistantMessage("user", trimmedPrompt);
    if (assistantElements && options.source === "assistant") {
      assistantElements.input.value = "";
    }

    const response = createResponse(trimmedPrompt);

    if (options.statusElement) {
      options.statusElement.textContent = response;
    }

    openAssistant();
    appendAssistantMessage("assistant", response);

    if (voiceRepliesEnabled) {
      speakResponse(response);
    }
  }

  function queueAgentAction(type, prompt) {
    const queue = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem("nventrActionQueue") || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    })();

    queue.unshift({
      id: `action-${Date.now()}`,
      type,
      role,
      page: pageName,
      prompt,
      attachedFiles,
      createdAt: new Date().toISOString()
    });

    localStorage.setItem("nventrActionQueue", JSON.stringify(queue.slice(0, 50)));
    pushPortalNotification("AI action queued", `${type.replace(/_/g, " ")} is ready to continue from ${pageName}.`, "queue");
  }

  function createResponse(prompt) {
    const text = prompt.toLowerCase();
    const settings = getSettings();

    if ((text.includes("language") || text.includes("multilingual") || text.includes("spanish") || text.includes("hindi") || text.includes("french")) && (text.includes("switch") || text.includes("support") || text.includes("translate") || text.includes("help"))) {
      const nextLanguage = text.includes("spanish")
        ? "Spanish"
        : text.includes("hindi")
          ? "Hindi"
          : text.includes("french")
            ? "French"
            : settings.preferredLanguage;
      persistSettings({ preferredLanguage: nextLanguage });
      queueAgentAction("multilingual_support", prompt);
      return `I switched the preferred AI support language to ${nextLanguage}. Nventr can now keep guidance, call scripts, and member-friendly explanations aligned to that language while preserving the same workflows.`;
    }

    if ((text.includes("ambient") || text.includes("listen") || text.includes("listening")) && (text.includes("call") || text.includes("intake") || text.includes("visit") || text.includes("queue"))) {
      queueAgentAction("ambient_listening", prompt);
      return "I queued an ambient listening intake workflow. Nventr can capture structured notes, summarize the conversation, and keep live agent handoff ready if the call becomes complex.";
    }

    if ((text.includes("submit") || text.includes("create") || text.includes("file")) && (text.includes("claim") || text.includes("appeal"))) {
      queueAgentAction("claim_workflow", prompt);
      return attachedFiles.length
        ? `I have enough context to start the claim workflow with ${attachedFiles.length} attached file${attachedFiles.length === 1 ? "" : "s"}. I queued the action directly so Nventr can work without routing you away. If you want a person to take over, use Human Handoff.`
        : "I queued a claim workflow action. Attach records if you want Nventr to submit with supporting documents instead of routing you to a legacy form.";
    }

    if ((text.includes("submit") || text.includes("start") || text.includes("create")) && (text.includes("prior auth") || text.includes("authorization") || text.includes("auth"))) {
      queueAgentAction("prior_auth_workflow", prompt);
      return attachedFiles.length
        ? `I queued a prior authorization action with ${attachedFiles.length} supporting file${attachedFiles.length === 1 ? "" : "s"}. Nventr can now ask for missing clinical details, package the files, and proceed in the AI workflow.`
        : "I queued a prior authorization action. Attach clinical notes, referrals, or imaging if you want Nventr to prepare the packet directly.";
    }

    if ((text.includes("utilization") || text.includes("clinical order") || text.includes("medical necessity")) && (text.includes("review") || text.includes("check") || text.includes("start") || text.includes("summarize"))) {
      queueAgentAction("utilization_management", prompt);
      return "I queued a utilization management review. Nventr can inspect clinical orders, medical necessity, and prior auth readiness while preserving the legacy review path for manual sign-off.";
    }

    if ((text.includes("form") || text.includes("e-form") || text.includes("packet")) && (text.includes("generate") || text.includes("prepare") || text.includes("create"))) {
      queueAgentAction("eform_generation", prompt);
      return attachedFiles.length
        ? `I queued an AI e-form workflow with ${attachedFiles.length} attached file${attachedFiles.length === 1 ? "" : "s"}. Nventr can package the form, supporting documents, and a payment information summary together.`
        : "I queued an AI e-form workflow. Attach documents if you want Nventr to build the packet with supporting records instead of using the form alone.";
    }

    if ((text.includes("enroll") || text.includes("member")) && (text.includes("new") || text.includes("start") || text.includes("add"))) {
      queueAgentAction("member_enrollment", prompt);
      return "I queued a provider-assisted member enrollment action. Nventr can collect missing details, continue the wizard, and keep the status visible in Members.";
    }

    if ((text.includes("book") || text.includes("schedule")) && text.includes("appointment")) {
      queueAgentAction("appointment_booking", prompt);
      return role === "member"
        ? "I queued an appointment booking request. Nventr can use your in-network preferences, selected slot, and care needs to book or suggest the best provider."
        : "I queued an appointment coordination request and can continue with provider-aware scheduling steps.";
    }

    if ((text.includes("lab") || text.includes("test")) && (text.includes("schedule") || text.includes("book") || text.includes("follow up"))) {
      queueAgentAction("lab_scheduling", prompt);
      return "I queued a test or lab scheduling request. Nventr can coordinate the follow-up, attach preparation instructions, and keep the calendar and care journey in sync.";
    }

    if (text.includes("dependent") || text.includes("family member")) {
      queueAgentAction("dependent_management", prompt);
      return "I queued a dependent management request. You can add or update dependents from Members, and I can help guide the relationship, DOB, and coverage details.";
    }

    if ((text.includes("payment") || text.includes("billing") || text.includes("invoice")) && (text.includes("era") || text.includes("835") || text.includes("underpay") || text.includes("posting") || text.includes("copay") || text.includes("co-pay"))) {
      queueAgentAction("payment_posting", prompt);
      return "I queued a payment intelligence action. Nventr can summarize EDI 835 files, ERAs, payment posting exceptions, co-pay gaps, and underpayment recovery opportunities from the same workflow.";
    }

    if ((text.includes("pitl") || text.includes("integration") || text.includes("rcm")) && (text.includes("show") || text.includes("review") || text.includes("summarize") || text.includes("check"))) {
      queueAgentAction("rcm_integration_review", prompt);
      return "I queued an RCM integration review. Nventr can show where AI recommendations connect into PITL checkpoints so the team keeps visibility and control over administrative functions.";
    }

    if ((text.includes("eob") || text.includes("statement")) && (text.includes("explain") || text.includes("review") || text.includes("summarize") || text.includes("help"))) {
      queueAgentAction("statement_support", prompt);
      return "I queued an EOB and statement support action. Nventr can explain charges in plain language, point to receipts and reports, and hand off to a live specialist if anything still looks unclear.";
    }

    if ((text.includes("point of service") || text.includes("pos")) && (text.includes("payment") || text.includes("pay"))) {
      queueAgentAction("point_of_service_payment", prompt);
      return "I queued a point-of-service payment guidance action. Nventr can review member responsibility, HSA options, and the cleanest next step before the payment is finalized.";
    }

    if ((text.includes("star rating") || text.includes("mips") || text.includes("mlr") || text.includes("predictive um")) && (text.includes("show") || text.includes("summary") || text.includes("forecast") || text.includes("insight"))) {
      queueAgentAction("operational_intelligence", prompt);
      return "I queued an operational intelligence action. Nventr can summarize CMS Star ratings, MIPS, MLR, predictive UM, and the top actions most likely to improve quality and financial outcomes.";
    }

    if ((text.includes("voice") || text.includes("call center") || text.includes("call centre") || text.includes("live agent")) && (text.includes("start") || text.includes("show") || text.includes("help") || text.includes("connect"))) {
      queueAgentAction("voice_agent_support", prompt);
      return "I queued a voice and live-agent support action. Nventr can start with AI assistance, keep the call context structured, and move the conversation to a live specialist when needed.";
    }

    if (text.includes("human") || text.includes("agent") || text.includes("support")) {
      requestHumanHandoff();
      return "I have the handoff flow ready, and I can also keep working while a human reviewer is notified.";
    }

    if (text.includes("claim")) {
      return role === "provider"
        ? "I can pull claim status, highlight denial risk, submit claim work with attached files, and only fall back to legacy routing when you prefer it."
        : "I can summarize your claim timeline, explain the latest status, and point you to billing or follow-up details.";
    }

    if (text.includes("auth") || text.includes("authorization")) {
      return "I can gather files, ask follow-up questions, surface required documents, and prepare prior authorization work directly from chat.";
    }

    if (text.includes("payment") || text.includes("billing") || text.includes("invoice")) {
      return role === "provider"
        ? "I can summarize remits, payment exceptions, underpayments, and reconciliation actions, then keep the legacy billing and payment workflow visible if your team wants it."
        : "I can explain charges, point-of-service options, HSA usage, statements, EOBs, and the next billing action for your account.";
    }

    if (text.includes("enroll") || text.includes("kyc") || text.includes("verify")) {
      return role === "provider"
        ? "Providers start with verification and credentials first, while member enrollment remains a separate flow when you enroll on someone else's behalf."
        : "Member enrollment covers registration, KYC, plan mapping, eligibility, profile, payments, and activation in one guided flow.";
    }

    if (text.includes("appointment") || text.includes("schedule")) {
      return "I can help schedule appointments, prep lab follow-ups, capture ambient intake notes, and surface the next step for the care journey.";
    }

    if (text.includes("pharmacy") || text.includes("rx") || text.includes("refill")) {
      return "I can review Rx management, refill status, brand-versus-generic options, delivery, pharmacy payments, and the next action for this medication workflow.";
    }

    if (text.includes("dashboard") || text.includes("summary")) {
      return role === "provider"
        ? "The dashboard prompt bar is ready. Ask for claim trends, prior auth blockers, payment exceptions, star ratings, MIPS, MLR, predictive UM, or direct AI actions with file support."
        : "The dashboard prompt bar is ready. Ask for benefits, EOB explanations, statements, appointments, pharmacy updates, lab scheduling, multilingual support, or enrollment progress.";
    }

    return role === "provider"
      ? "I can help with ambient listening, claims, autonomous coding, prior auth, utilization management, payments, RCM integrations, provider verification, member enrollment, file intake, and human handoff from this screen."
      : "I can help with benefits, enrollment, claims, EOB explanations, statements, appointments, lab scheduling, point-of-service payments, pharmacy support, multilingual guidance, and human handoff from this screen.";
  }

  function startVoiceCapture(targetInput, statusElement, onComplete) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const settings = getSettings();
    const languageMap = {
      English: "en-US",
      Spanish: "es-ES",
      Hindi: "hi-IN",
      French: "fr-FR"
    };

    if (!Recognition) {
      statusElement.textContent = "Voice prompts are not supported in this browser yet.";
      return;
    }

    const recognition = new Recognition();
    recognition.lang = languageMap[settings.preferredLanguage] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    statusElement.textContent = "Listening...";

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript.trim();
      targetInput.value = transcript;
      statusElement.textContent = `Captured: "${transcript}"`;
      if (typeof onComplete === "function") {
        onComplete(transcript);
      }
    };

    recognition.onerror = function () {
      statusElement.textContent = "Voice capture could not complete. Please try again.";
    };

    recognition.onend = function () {
      if (statusElement.textContent === "Listening...") {
        statusElement.textContent = "Voice prompt ended.";
      }
    };

    recognition.start();
  }

  function speakResponse(text) {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  window.NventrPortal = {
    submitPrompt: function (prompt, source) {
      submitPrompt(prompt, { source: source || "assistant", statusElement: assistantElements ? assistantElements.status : null });
    },
    openWorkflow: function (workflowKey, featureCard) {
      openWorkflowModal(workflowKey, featureCard || {});
    },
    startVoiceCapture: function (targetInput, onComplete) {
      const statusElement = assistantElements ? assistantElements.status : null;
      if (!statusElement) {
        return;
      }
      startVoiceCapture(targetInput, statusElement, onComplete);
    },
    requestHumanHandoff: requestHumanHandoff,
    openAssistant: openAssistant
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
