import csv
from pathlib import Path


OUTPUT = Path("portal_jira_import.csv")
ROWS = []

COLUMNS = [
    "Issue Id",
    "Issue Type",
    "Summary",
    "Epic Name",
    "Epic Link",
    "Description",
    "Acceptance Criteria",
    "Priority",
    "Labels",
    "Components",
    "Story Points",
]


def ac(*items):
    return "\n".join(f"- {item}" for item in items)


def add_epic(issue_id, summary, epic_name, description, acceptance, priority, labels, component):
    ROWS.append(
        {
            "Issue Id": issue_id,
            "Issue Type": "Epic",
            "Summary": summary,
            "Epic Name": epic_name,
            "Epic Link": "",
            "Description": description,
            "Acceptance Criteria": acceptance,
            "Priority": priority,
            "Labels": labels,
            "Components": component,
            "Story Points": "",
        }
    )


def add_story(issue_id, summary, epic_name, description, acceptance, priority, labels, component, story_points):
    ROWS.append(
        {
            "Issue Id": issue_id,
            "Issue Type": "Story",
            "Summary": summary,
            "Epic Name": "",
            "Epic Link": epic_name,
            "Description": description,
            "Acceptance Criteria": acceptance,
            "Priority": priority,
            "Labels": labels,
            "Components": component,
            "Story Points": story_points,
        }
    )


add_epic(
    "EPIC-001",
    "Portal Access, Sign In, and Role Routing",
    "PORTAL-ACCESS",
    "Build a reliable identity and entry experience for provider and member personas so the portal always routes users into the correct onboarding or dashboard path.",
    ac(
        "Member and provider users can enter through the same landing experience without getting routed into the wrong flow.",
        "Returning users can sign in and land on the correct dashboard based on role and activation status.",
        "First-time users are guided into provider verification or member enrollment with clear state management.",
    ),
    "Highest",
    "portal,access,identity,role-routing",
    "Platform",
)
add_story(
    "STORY-001",
    "As a returning provider, I want sign in to route me directly to the provider dashboard so that I do not re-enter onboarding.",
    "PORTAL-ACCESS",
    "Implement provider sign-in logic that validates stored role state and routes authenticated provider users to the provider dashboard and shell.",
    ac(
        "Provider sign-in lands on the provider dashboard.",
        "Provider role is persisted and reused across pages.",
        "Provider users are not redirected into member enrollment.",
    ),
    "Highest",
    "provider,signin,access",
    "Provider Portal",
    "5",
)
add_story(
    "STORY-002",
    "As a returning member, I want sign in to route me to the correct member destination based on enrollment status so that incomplete enrollments can be resumed.",
    "PORTAL-ACCESS",
    "Implement member sign-in routing that sends fully enrolled users to the member dashboard and incomplete users back into the enrollment flow.",
    ac(
        "Enrolled members land on the member dashboard.",
        "Incomplete members resume enrollment at the proper step or draft.",
        "Role state remains member across navigation.",
    ),
    "Highest",
    "member,signin,enrollment",
    "Member Portal",
    "5",
)
add_story(
    "STORY-003",
    "As a first-time provider, I want get-started entry to send me into provider verification rather than member enrollment so that onboarding matches my persona.",
    "PORTAL-ACCESS",
    "Separate provider onboarding from member enrollment and route providers into credential and verification steps before workspace access.",
    ac(
        "Provider get-started selects provider verification flow.",
        "Provider verification state is stored and resumed if interrupted.",
        "Provider users never see member-only activation copy during onboarding.",
    ),
    "High",
    "provider,onboarding,kyc",
    "Provider Portal",
    "5",
)
add_story(
    "STORY-004",
    "As a first-time member, I want get-started entry to send me into the member enrollment wizard so that coverage activation happens in the right sequence.",
    "PORTAL-ACCESS",
    "Route first-time members into the multi-step enrollment wizard with registration, KYC, plan selection, eligibility, profile, payment, and activation.",
    ac(
        "Member get-started enters enrollment wizard.",
        "Enrollment progress persists between sessions.",
        "Successful completion routes the member into the member dashboard.",
    ),
    "High",
    "member,onboarding,enrollment",
    "Member Portal",
    "8",
)
add_story(
    "STORY-005",
    "As a user switching between roles in a demo environment, I want role state to reset predictably so that provider and member screens do not bleed into each other.",
    "PORTAL-ACCESS",
    "Create role reset and role-switch controls for demo and QA use so that role-linked navigation and saved state can be cleared safely.",
    ac(
        "Role toggle updates shell navigation and prompt suggestions.",
        "Demo reset clears role-specific draft state without breaking the app shell.",
        "Switching roles does not leave users stranded on inaccessible pages.",
    ),
    "Medium",
    "demo,role-state,qa",
    "Platform",
    "3",
)

add_epic(
    "EPIC-002",
    "Shared AI Shell, Voice, File Intake, and Human Handoff",
    "AI-SHELL",
    "Deliver a persistent AI-first interaction layer that is available on every relevant provider and member screen with support for text, voice, file uploads, and human escalation.",
    ac(
        "Nventr is available consistently across supported screens.",
        "Users can trigger workflows from typed prompts, voice prompts, or attached files.",
        "If AI confidence is low or the user requests help, a human handoff packet can be created.",
    ),
    "Highest",
    "ai-shell,nventr,voice,handoff",
    "AI Platform",
)
add_story(
    "STORY-006",
    "As a portal user, I want a persistent Nventr assistant on all core screens so that I can ask for help without leaving my current workflow.",
    "AI-SHELL",
    "Implement a shared shell component that injects the assistant into provider and member workflows and keeps prompt context aligned to the current page.",
    ac(
        "Assistant is visible on all designated screens.",
        "Assistant prompt chips reflect page and role context.",
        "Assistant state does not break existing page interactions.",
    ),
    "Highest",
    "assistant,shell,ux",
    "AI Platform",
    "8",
)
add_story(
    "STORY-007",
    "As a user, I want to use voice prompts so that I can trigger actions hands-free when I am multitasking or on a call.",
    "AI-SHELL",
    "Add browser-based voice capture for dashboard prompts and assistant prompts with proper status messaging and language preference support.",
    ac(
        "Voice capture starts from dashboard and assistant surfaces.",
        "The captured transcript is visible before or during AI execution.",
        "Unsupported browsers show a graceful fallback message.",
    ),
    "High",
    "voice,accessibility,assistant",
    "AI Platform",
    "5",
)
add_story(
    "STORY-008",
    "As a user, I want to attach files to Nventr so that the AI can act on claim, prior auth, appeal, and billing workflows using supporting records.",
    "AI-SHELL",
    "Support file intake metadata in the assistant and preserve attachment context when workflows are queued or handed off.",
    ac(
        "Users can attach one or more files from the assistant.",
        "Attached files are reflected in queued workflow context.",
        "Human handoff requests include attachment metadata.",
    ),
    "High",
    "attachments,files,assistant",
    "AI Platform",
    "5",
)
add_story(
    "STORY-009",
    "As a user, I want the assistant to queue actions instead of only routing me to forms so that the portal feels AI-first rather than menu-first.",
    "AI-SHELL",
    "Create a shared workflow queue pattern for common intents like claims, prior auth, appointments, enrollment, payment review, and multilingual support.",
    ac(
        "Recognized prompts create a queued action with timestamp and role context.",
        "Queued actions appear in notifications or workflow status surfaces.",
        "Legacy navigation remains available when users prefer manual flows.",
    ),
    "High",
    "workflow-queue,ai-first,legacy",
    "AI Platform",
    "8",
)
add_story(
    "STORY-010",
    "As a user, I want a human handoff option so that unresolved AI interactions can be escalated with full context.",
    "AI-SHELL",
    "Implement a handoff request flow that captures the active page, prompt, role, and attachments for handover to a live specialist.",
    ac(
        "Handoff requests can be triggered from the assistant.",
        "The handoff payload stores prompt and file context.",
        "Users receive confirmation that a human specialist can continue the case.",
    ),
    "High",
    "handoff,live-agent,support",
    "AI Platform",
    "5",
)
add_story(
    "STORY-011",
    "As an operations team member, I want settings for voice replies, preferred language, and legacy-mode visibility so that the AI experience can be tuned per environment.",
    "AI-SHELL",
    "Add a shared settings surface that stores voice reply, preferred language, and whether legacy workflows remain prominently visible.",
    ac(
        "Settings persist in local storage or equivalent profile storage.",
        "Language choice affects voice recognition locale and AI copy cues.",
        "Legacy-mode setting changes page messaging without breaking workflow access.",
    ),
    "Medium",
    "settings,multilingual,legacy-mode",
    "AI Platform",
    "3",
)

add_epic(
    "EPIC-003",
    "Provider Dashboard and Operational Intelligence",
    "PROVIDER-DASHBOARD",
    "Create an AI-first provider command center that combines operational metrics, next-best actions, and workflow launch points for revenue cycle, quality, and member operations.",
    ac(
        "Provider dashboard shows intelligence, workflow launch points, and recommendations.",
        "Metrics map to claims quality, denials, payments, utilization, and member outcomes.",
        "Dashboard prompts and CTAs launch richer AI workflows rather than static cards.",
    ),
    "Highest",
    "provider,dashboard,intelligence,analytics",
    "Provider Portal",
)
add_story(
    "STORY-012",
    "As a provider operations lead, I want a dashboard prompt bar so that I can ask for claim, auth, payment, and member insights directly from the landing screen.",
    "PROVIDER-DASHBOARD",
    "Add a provider dashboard prompt surface with text, voice, suggested prompts, and action status messaging.",
    ac(
        "Prompt bar is available at the top of the dashboard.",
        "Suggested prompts cover core provider use cases.",
        "Voice and text prompts both create actionable AI responses.",
    ),
    "High",
    "provider,dashboard,prompt-bar",
    "Provider Portal",
    "5",
)
add_story(
    "STORY-013",
    "As a provider executive, I want operational intelligence metrics for coding yield, denials, MLR, MIPS, star ratings, and predictive UM so that I can prioritize action.",
    "PROVIDER-DASHBOARD",
    "Build an intelligence section with production-ready metric tiles, narrative summaries, and recommended actions tied to provider goals.",
    ac(
        "Dashboard shows first-pass quality and denial-related metrics.",
        "Dashboard includes MLR, MIPS, CMS Stars, and predictive UM views.",
        "Each metric cluster offers a drill-in or workflow launch path.",
    ),
    "High",
    "provider,analytics,quality",
    "Provider Portal",
    "8",
)
add_story(
    "STORY-014",
    "As a provider analyst, I want AI-generated next-best actions from the dashboard so that metrics become operational work instead of passive reporting.",
    "PROVIDER-DASHBOARD",
    "Convert dashboard insights into AI actions that can open workflow modals for coding, payment recovery, appeals, utilization review, and member operations.",
    ac(
        "Dashboard cards can open workflow modals.",
        "Each modal includes steps, signals, and a queue action.",
        "Users can keep legacy flow or queue AI work from the modal.",
    ),
    "High",
    "dashboard,actions,workflows",
    "Provider Portal",
    "8",
)
add_story(
    "STORY-015",
    "As a provider user, I want notifications and settings in the top bar across provider screens so that shell behavior is consistent.",
    "PROVIDER-DASHBOARD",
    "Standardize provider top-bar controls for notifications, settings, and profile with working shared panels.",
    ac(
        "Notifications open a shared provider-aware panel.",
        "Settings open a shared configuration panel.",
        "Top-bar controls are visually consistent across provider pages.",
    ),
    "Medium",
    "provider,shell,consistency",
    "Provider Portal",
    "3",
)
add_story(
    "STORY-016",
    "As a provider operations team, I want ambient intake and live-agent readiness surfaced from the dashboard so that call-center and workflow support can start from one place.",
    "PROVIDER-DASHBOARD",
    "Expose ambient listening, intake summarization, and live-agent handoff as dashboard-level provider actions.",
    ac(
        "Ambient intake workflow can be launched from the dashboard.",
        "The workflow describes capture, classification, and handoff steps.",
        "Notification state reflects queued intake work.",
    ),
    "Medium",
    "provider,ambient,call-center",
    "Provider Portal",
    "5",
)

add_epic(
    "EPIC-004",
    "Provider Claims, Coding, Appeals, and Denials",
    "PROVIDER-CLAIMS",
    "Support AI-assisted claim submission, coding suggestions, claim triage, denial prevention, and appeal preparation within a unified provider workflow.",
    ac(
        "Providers can prepare and submit claims with visible coding context.",
        "Denied or at-risk claims can be triaged and routed into appeals.",
        "AI and legacy flows can coexist without confusing the user.",
    ),
    "Highest",
    "provider,claims,appeals,denials,coding",
    "Provider Portal",
)
add_story(
    "STORY-017",
    "As a biller, I want claim submission to show selected CPT and ICD codes on the same screen so that I can verify the packet before submitting.",
    "PROVIDER-CLAIMS",
    "Keep suggested and manually added codes visible in a selected-code panel with validation before submit.",
    ac(
        "Selected CPT and ICD codes remain visible after add.",
        "Manual code entry validates required fields.",
        "Submit is blocked until at least one valid code exists.",
    ),
    "High",
    "claims,coding,provider",
    "Claims",
    "5",
)
add_story(
    "STORY-018",
    "As a coder, I want AI-assisted autonomous coding and QA review so that missing documentation and denial risk can be detected before claim submission.",
    "PROVIDER-CLAIMS",
    "Introduce a pre-claim AI workflow that reads clinical narrative, evaluates coding confidence, and highlights revenue integrity gaps.",
    ac(
        "A workflow modal explains coding and QA steps.",
        "The workflow can be queued from claims and dashboard contexts.",
        "Risk and confidence signals are visible before submit.",
    ),
    "High",
    "coding,qa,revenue-integrity",
    "Claims",
    "8",
)
add_story(
    "STORY-019",
    "As a claims specialist, I want denied claims to route directly into the appeal page with selected claim context so that appeal preparation starts immediately.",
    "PROVIDER-CLAIMS",
    "Store claim context when appeal is triggered and hydrate the denial analysis page with claim, patient, and denial reason details.",
    ac(
        "Appeal buttons route to the appeal page.",
        "Selected claim details appear on the appeal page.",
        "Appeal context persists through a page reload or direct revisit.",
    ),
    "High",
    "appeals,claims-routing,provider",
    "Claims",
    "5",
)
add_story(
    "STORY-020",
    "As a claims lead, I want an AI triage experience for pending, denied, and appeal-ready claims so that the queue can be prioritized faster.",
    "PROVIDER-CLAIMS",
    "Build a claim triage workflow that groups queue items by risk, suggested action, and automation confidence.",
    ac(
        "Triage can be opened from provider queue surfaces.",
        "The workflow shows recommended next action for each cluster.",
        "Users can queue AI actions or retain manual review.",
    ),
    "High",
    "triage,claims,ai",
    "Claims",
    "8",
)
add_story(
    "STORY-021",
    "As an appeals specialist, I want AI appeal packaging with evidence and specialist handoff so that denial responses are faster and more defensible.",
    "PROVIDER-CLAIMS",
    "Create an appeal workflow that packages denial reasoning, clinical counterpoints, supporting files, and human escalation into one review surface.",
    ac(
        "Appeal modal includes reason, steps, and evidence signals.",
        "Files can be attached from the assistant for appeal context.",
        "Submitting an appeal creates visible notification or banner feedback.",
    ),
    "High",
    "appeals,evidence,handoff",
    "Claims",
    "8",
)
add_story(
    "STORY-022",
    "As a provider user, I want claim success and draft-save feedback so that I know whether my work has been preserved or sent.",
    "PROVIDER-CLAIMS",
    "Show clear confirmation on save draft and submit actions for claims with persisted local or server-side state.",
    ac(
        "Save draft confirms persistence.",
        "Submit confirms success with claim identifier.",
        "Submitted claims appear in recent activity or queue surfaces.",
    ),
    "Medium",
    "drafts,success-messages,claims",
    "Claims",
    "3",
)

add_epic(
    "EPIC-005",
    "Provider Prior Authorization and Utilization Management",
    "PROVIDER-AUTH",
    "Deliver AI-assisted prior authorization, utilization management, medical necessity review, and e-form packet generation for providers.",
    ac(
        "Prior auth requests can be created, saved, resumed, and submitted.",
        "Clinical orders and utilization logic can be reviewed before submission.",
        "The provider can launch AI packaging workflows from auth-related screens.",
    ),
    "Highest",
    "provider,prior-auth,utilization,eforms",
    "Provider Portal",
)
add_story(
    "STORY-023",
    "As a provider user, I want the prior authorization wizard to move through all steps reliably so that requests can be completed without dead ends.",
    "PROVIDER-AUTH",
    "Complete the multi-step prior authorization flow with back, next, save draft, validation, and final submit behavior.",
    ac(
        "Back and next work through all configured steps.",
        "Save draft persists the current state.",
        "Final submit redirects into the prior authorization queue with confirmation.",
    ),
    "High",
    "prior-auth,wizard,provider",
    "Prior Authorization",
    "5",
)
add_story(
    "STORY-024",
    "As a utilization reviewer, I want AI review of clinical orders and medical necessity so that the request packet is complete before payer submission.",
    "PROVIDER-AUTH",
    "Build a utilization management workflow that checks clinical necessity, orders, labs, imaging, and payer criteria before final auth submission.",
    ac(
        "Workflow explains medical necessity review stages.",
        "Missing documentation is clearly surfaced.",
        "AI review can be queued without removing manual control.",
    ),
    "High",
    "utilization,clinical-orders,prior-auth",
    "Prior Authorization",
    "8",
)
add_story(
    "STORY-025",
    "As a coordinator, I want AI-generated e-forms and supporting packet creation so that structured fields and documents can be prepared faster.",
    "PROVIDER-AUTH",
    "Generate e-form packets from provider input and attached documents while preserving the wizard for manual edits.",
    ac(
        "Workflow modal explains how e-forms are assembled.",
        "Users can launch packet generation from auth screens.",
        "Legacy wizard remains available after AI packet generation.",
    ),
    "Medium",
    "eforms,packet-builder,documents",
    "Prior Authorization",
    "5",
)
add_story(
    "STORY-026",
    "As a provider user, I want queue-level interaction from the auth list so that I can review approved, pending, and missing-document requests faster.",
    "PROVIDER-AUTH",
    "Make the authorization queue cards and filter actions interactive and AI-aware.",
    ac(
        "Queue items can open a deeper review state.",
        "Filters provide feedback or AI-guided narrowing.",
        "Statuses are visually clear and actionable.",
    ),
    "Medium",
    "auth-queue,filters,provider",
    "Prior Authorization",
    "5",
)
add_story(
    "STORY-027",
    "As an operations team, I want attached clinical files to feed directly into prior auth workflows so that Nventr can package evidence with fewer manual steps.",
    "PROVIDER-AUTH",
    "Carry assistant file metadata into prior authorization workflows and packet review surfaces.",
    ac(
        "Attached files appear in the auth AI workflow context.",
        "Queued prior auth actions keep supporting file metadata.",
        "Human handoff retains auth-related file context.",
    ),
    "Medium",
    "files,prior-auth,assistant",
    "Prior Authorization",
    "3",
)

add_epic(
    "EPIC-006",
    "Provider Billing, EDI 835, ERA, Reconciliation, and PITL",
    "PROVIDER-PAYMENTS",
    "Create a provider billing and reconciliation workspace that combines payment exceptions, batch reporting, EDI/ERA review, underpayment recovery, and PITL checkpoints.",
    ac(
        "Provider payment CTAs trigger meaningful actions or artifacts.",
        "AI workflows exist for ERA, underpay, co-pay, and reconciliation review.",
        "Teams can keep human checkpoints for financially sensitive workflows.",
    ),
    "Highest",
    "provider,billing,era,edi,reconciliation,pitl",
    "Provider Portal",
)
add_story(
    "STORY-028",
    "As a provider finance user, I want Generate Batch Report to produce a usable report so that I can review reconciliation work outside the portal if needed.",
    "PROVIDER-PAYMENTS",
    "Create a downloadable provider batch report artifact summarizing EDI 835, ERA, processed amounts, and recovery opportunity.",
    ac(
        "Generate Batch Report downloads a file.",
        "The report includes current batch summary fields.",
        "A notification confirms report generation.",
    ),
    "High",
    "batch-report,billing,provider",
    "Payments",
    "3",
)
add_story(
    "STORY-029",
    "As a reconciliation analyst, I want Resolve Now to launch a deeper AI recovery workflow so that payment exceptions are not dead-end buttons.",
    "PROVIDER-PAYMENTS",
    "Bind payment exception CTAs into a dedicated workflow that covers ERA exceptions, posting gaps, co-pay mismatches, and underpayments.",
    ac(
        "Resolve Now opens an AI workflow modal.",
        "The workflow includes steps, metrics, and queue actions.",
        "Queued work is reflected in notifications.",
    ),
    "High",
    "reconciliation,exceptions,ai",
    "Payments",
    "5",
)
add_story(
    "STORY-030",
    "As a provider finance lead, I want EDI 835 and ERA intelligence surfaced with recovery opportunity so that financial leakage can be prioritized.",
    "PROVIDER-PAYMENTS",
    "Add an AI workflow and metric view for remit normalization, posting completion, underpay detection, and next-best recovery action.",
    ac(
        "ERA workflow can be launched from provider surfaces.",
        "Recovery opportunity and posting completion are visible.",
        "The workflow preserves PITL control for high-risk decisions.",
    ),
    "High",
    "edi835,era,underpay",
    "Payments",
    "8",
)
add_story(
    "STORY-031",
    "As an administrator, I want receipt downloads and email drafts to work so that provider finance communication is not blocked.",
    "PROVIDER-PAYMENTS",
    "Bind provider receipt, download, and email actions to downloadable artifacts and mail drafts with relevant context.",
    ac(
        "Receipt buttons download provider receipt artifacts.",
        "Email to Administrator opens a prefilled mail draft.",
        "Download Digital Receipt produces a usable file.",
    ),
    "Medium",
    "receipts,email,billing",
    "Payments",
    "3",
)
add_story(
    "STORY-032",
    "As an operations architect, I want PITL workflow visibility so that AI automation still respects human governance in payment administration.",
    "PROVIDER-PAYMENTS",
    "Create a PITL integration workflow showing where AI recommendations connect into administrative review checkpoints.",
    ac(
        "PITL workflow explains AI vs human review boundaries.",
        "The workflow can be launched from payment surfaces.",
        "The user can keep legacy flow without losing AI insights.",
    ),
    "Medium",
    "pitl,governance,ai",
    "Payments",
    "5",
)

add_epic(
    "EPIC-007",
    "Provider Member Management and Assisted Enrollment",
    "PROVIDER-MEMBERS",
    "Give providers a workspace for viewing members, tracking enrollment status, resuming drafts, and enrolling members on their behalf.",
    ac(
        "Providers can see enrolled members and enrollment drafts in one place.",
        "Provider-assisted enrollment routes members into the correct activation state.",
        "Member status and drafts are visible after save and completion.",
    ),
    "High",
    "provider,members,enrollment,drafts",
    "Provider Portal",
)
add_story(
    "STORY-033",
    "As a provider user, I want a member directory with status and plan context so that I can understand the current state of the members I manage.",
    "PROVIDER-MEMBERS",
    "Build a provider member directory showing enrollment state, plan, contact, and last-updated information.",
    ac(
        "Directory lists enrolled and in-progress members.",
        "Plan and status information are visible.",
        "Directory reflects latest enrollment completion state.",
    ),
    "High",
    "members,directory,provider",
    "Members",
    "5",
)
add_story(
    "STORY-034",
    "As a provider user, I want enrollment drafts to appear in the members workspace so that I can resume incomplete onboarding.",
    "PROVIDER-MEMBERS",
    "Persist member enrollment drafts and expose a resume queue in the provider members page.",
    ac(
        "Saved drafts appear in the members page.",
        "Resume restores wizard state.",
        "Draft count and status update automatically.",
    ),
    "High",
    "drafts,enrollment,provider",
    "Members",
    "5",
)
add_story(
    "STORY-035",
    "As a provider user, I want to launch provider-assisted member enrollment from multiple provider entry points so that enrollment is accessible where work happens.",
    "PROVIDER-MEMBERS",
    "Allow new member enrollment to be started from dashboard, members page, and AI workflow entry points.",
    ac(
        "New enrollment can be launched from dashboard and members page.",
        "Role state remains provider during assisted enrollment.",
        "Successful completion routes back to the correct dashboard or member workspace.",
    ),
    "Medium",
    "enrollment,launchpoints,provider",
    "Members",
    "5",
)
add_story(
    "STORY-036",
    "As a provider operator, I want AI workflow support around member operations so that I can collect missing enrollment data with less manual follow-up.",
    "PROVIDER-MEMBERS",
    "Create a provider-side member operations workflow that summarizes missing steps, plan mapping, and activation blockers.",
    ac(
        "Workflow can be launched from provider cards or prompts.",
        "The workflow shows missing data and next actions.",
        "Queued member ops work appears in notifications.",
    ),
    "Medium",
    "members,ai,enrollment-ops",
    "Members",
    "5",
)

add_epic(
    "EPIC-008",
    "Member Dashboard, Coverage, and Benefits",
    "MEMBER-DASHBOARD",
    "Deliver a member-first dashboard focused on coverage, benefits, activity, next steps, and intelligent guidance instead of provider operations content.",
    ac(
        "The member dashboard is role-correct and free from provider-only terminology.",
        "Members can see coverage, status, next steps, and activity from one place.",
        "The dashboard supports prompts, insights, and what-is-next guidance.",
    ),
    "Highest",
    "member,dashboard,benefits,coverage",
    "Member Portal",
)
add_story(
    "STORY-037",
    "As a member, I want the dashboard to show member-focused insights and next steps so that I know what to do without deciphering provider language.",
    "MEMBER-DASHBOARD",
    "Refine the member dashboard to show coverage, care, billing, claims, enrollment, and next recommended actions.",
    ac(
        "Dashboard contains member-facing summaries only.",
        "What-is-next guidance is visible and actionable.",
        "Dashboard copy avoids provider revenue-cycle terms.",
    ),
    "High",
    "member,dashboard,ux",
    "Member Portal",
    "5",
)
add_story(
    "STORY-038",
    "As a member, I want eligibility, benefits, coverage, and status visible on the dashboard so that I can quickly understand my plan standing.",
    "MEMBER-DASHBOARD",
    "Show plan details, member ID, coverage start, eligibility state, and activation messaging in a structured dashboard section.",
    ac(
        "Coverage and member status are visible after enrollment.",
        "Incomplete enrollment states show clear next action.",
        "Plan details persist between sessions.",
    ),
    "High",
    "benefits,coverage,eligibility",
    "Member Portal",
    "5",
)
add_story(
    "STORY-039",
    "As a member, I want dashboard prompts for EOB, appointments, pharmacy, billing, and enrollment so that Nventr can guide me from the main landing page.",
    "MEMBER-DASHBOARD",
    "Provide a member dashboard prompt bar with role-specific chips and text/voice input.",
    ac(
        "Prompt chips reflect member use cases.",
        "Prompt submissions update the assistant and dashboard status.",
        "Voice and text both work with member language settings.",
    ),
    "Medium",
    "member,prompts,voice",
    "Member Portal",
    "5",
)
add_story(
    "STORY-040",
    "As a member, I want multilingual support cues and live-help options visible on the dashboard so that I know I can get help in a way that works for me.",
    "MEMBER-DASHBOARD",
    "Surface language preference, multilingual support, and live-agent escalation options in member-facing dashboard and assistant flows.",
    ac(
        "Language preference is visible or available from settings.",
        "Member prompts can request multilingual help.",
        "Human handoff remains available from dashboard context.",
    ),
    "Medium",
    "multilingual,member,handoff",
    "Member Portal",
    "3",
)

add_epic(
    "EPIC-009",
    "Member Billing, HSA, EOB, Statements, and Point-of-Service Payment",
    "MEMBER-BILLING",
    "Support AI-guided billing, HSA account management, EOB explanation, statement support, receipts, administrator communication, and point-of-service payment guidance for members.",
    ac(
        "Billing CTAs and downloads work for members.",
        "Members can understand EOBs and statements in plain language.",
        "Point-of-service and HSA-related next steps are visible and actionable.",
    ),
    "Highest",
    "member,billing,hsa,eob,statements,pos-payment",
    "Member Portal",
)
add_story(
    "STORY-041",
    "As a member, I want billing CTAs like pay with HSA, payment plan, concierge help, report download, and receipt download to work so that I can complete financial tasks from one screen.",
    "MEMBER-BILLING",
    "Ensure all member billing actions create meaningful outcomes such as notifications, downloads, modals, or state changes.",
    ac(
        "Billing CTAs trigger visible feedback.",
        "Report and receipt downloads generate files.",
        "Billing notifications reflect recent actions.",
    ),
    "High",
    "billing,hsa,downloads,member",
    "Billing",
    "5",
)
add_story(
    "STORY-042",
    "As a member, I want Email to Administrator to open a draft with the admin recipient hidden and prefilled so that I can escalate billing questions quickly.",
    "MEMBER-BILLING",
    "Build a member-friendly administrator email draft flow with optional CC and editable message content.",
    ac(
        "Admin recipient is prefilled and not user-editable.",
        "Members can add CC recipients.",
        "The email draft opens with the expected subject and body template.",
    ),
    "Medium",
    "email,admin,billing",
    "Billing",
    "3",
)
add_story(
    "STORY-043",
    "As a member, I want EOB explanations in plain language so that I can understand what was paid, denied, or still owed.",
    "MEMBER-BILLING",
    "Add EOB explanation behavior through Nventr and the billing experience with simple, member-safe wording.",
    ac(
        "EOB questions can be asked via the assistant.",
        "Responses use member-friendly language.",
        "Members can move from EOB explanation into billing next steps.",
    ),
    "High",
    "eob,member,ai",
    "Billing",
    "5",
)
add_story(
    "STORY-044",
    "As a member, I want statement AI support so that I can understand statement lines, download artifacts, and decide on the next payment action.",
    "MEMBER-BILLING",
    "Provide statement-oriented AI responses, downloads, and recommended actions in billing workflows.",
    ac(
        "Statement questions are recognized by Nventr.",
        "The screen offers downloadable statement-related artifacts.",
        "Point-of-service or HSA suggestions can be surfaced as next actions.",
    ),
    "Medium",
    "statements,ai,billing",
    "Billing",
    "5",
)
add_story(
    "STORY-045",
    "As a member, I want point-of-service payment guidance so that I understand whether to use HSA, card, or a payment plan at the moment of care.",
    "MEMBER-BILLING",
    "Create a member AI workflow for point-of-service payment guidance tied to HSA balances and billing context.",
    ac(
        "Point-of-service prompts are recognized by the assistant.",
        "The workflow explains the likely best payment option.",
        "Notification or banner feedback confirms the AI action was queued.",
    ),
    "Medium",
    "pos-payment,hsa,member",
    "Billing",
    "3",
)

add_epic(
    "EPIC-010",
    "Member Appointments, Lab Scheduling, and Care Journey",
    "MEMBER-CARE",
    "Enable simple in-network appointment booking, test or lab follow-up scheduling, and care journey management for members.",
    ac(
        "Members can search providers, book appointments, and see bookings on the calendar.",
        "Appointment requests can be initiated manually or via AI.",
        "Care journey and follow-up experiences remain connected to appointments.",
    ),
    "High",
    "member,appointments,lab-scheduling,care-journey",
    "Member Portal",
)
add_story(
    "STORY-046",
    "As a member, I want to search in-network providers and book an appointment if a slot is available so that the flow is fast and simple.",
    "MEMBER-CARE",
    "Support provider search, slot confirmation, booking success feedback, and calendar visibility from the member appointment page.",
    ac(
        "Member can search and filter providers.",
        "Available slot booking shows a confirmation message.",
        "Booked appointments appear in itinerary and calendar views.",
    ),
    "High",
    "appointments,booking,member",
    "Appointments",
    "5",
)
add_story(
    "STORY-047",
    "As a member, I want Nventr to schedule appointments from a natural-language request so that I do not have to navigate every booking control manually.",
    "MEMBER-CARE",
    "Support AI booking prompts that search provider matches and book or suggest slots directly from the appointment page or assistant.",
    ac(
        "Prompts like book or schedule trigger appointment logic.",
        "If a match exists, the appointment is confirmed.",
        "If no match exists, provider suggestions are shown.",
    ),
    "High",
    "appointments,ai,member",
    "Appointments",
    "5",
)
add_story(
    "STORY-048",
    "As a member, I want lab or test follow-up scheduling tied to appointments so that additional care steps can be handled in the same journey.",
    "MEMBER-CARE",
    "Extend appointment workflows and AI prompts to support test or lab scheduling and preparation reminders.",
    ac(
        "Lab or test prompts create a distinct workflow action.",
        "Members see preparation or next-step guidance.",
        "Calendar and care journey stay aligned with booked follow-ups.",
    ),
    "Medium",
    "lab,test,care-journey",
    "Appointments",
    "5",
)
add_story(
    "STORY-049",
    "As a member, I want the care journey and follow-up layer to remind me about pre-visit and post-visit steps so that I stay on track.",
    "MEMBER-CARE",
    "Integrate care journey reminders, orchestration logic, and follow-up configuration with appointment and member dashboard context.",
    ac(
        "Care journey page shows pre and post care actions.",
        "Follow-up configuration can store orchestration settings.",
        "Care guidance remains visible after booking an appointment.",
    ),
    "Medium",
    "care-journey,follow-up,member",
    "Care Journey",
    "5",
)

add_epic(
    "EPIC-011",
    "Member Pharmacy, Refills, Delivery, and Dependents",
    "MEMBER-PHARMACY",
    "Provide members with working refill, pharmacy network, medication support, delivery options, and dependent management workflows.",
    ac(
        "Members can act on refill and pharmacy options with visible status updates.",
        "Network pharmacy selection works and updates state.",
        "Dependents can be added and managed from the member workspace.",
    ),
    "High",
    "member,pharmacy,refills,dependents",
    "Member Portal",
)
add_story(
    "STORY-050",
    "As a member, I want refill actions and success messages to update the pharmacy status table so that I know the request really went through.",
    "MEMBER-PHARMACY",
    "Wire refill-related CTAs to update on-screen status, notifications, and modal confirmations.",
    ac(
        "Request refill or approve refill actions change the status display.",
        "Members receive a success confirmation.",
        "Status table or notification area reflects the latest refill state.",
    ),
    "High",
    "pharmacy,refills,status",
    "Pharmacy",
    "5",
)
add_story(
    "STORY-051",
    "As a member, I want View Logic Chain to explain why the refill is allowed or blocked so that the AI experience feels trustworthy.",
    "MEMBER-PHARMACY",
    "Provide a clear AI reasoning modal for refill checks, coverage checks, and next action recommendations.",
    ac(
        "View Logic Chain opens a detailed reasoning view.",
        "The reasoning uses member-friendly language.",
        "The logic chain references coverage, prescription validity, and next step.",
    ),
    "Medium",
    "pharmacy,explainability,ai",
    "Pharmacy",
    "3",
)
add_story(
    "STORY-052",
    "As a member, I want Change Pharmacy to show in-network options and update my selected pharmacy so that future fills go to the right place.",
    "MEMBER-PHARMACY",
    "Show in-network pharmacies in a working selection modal and persist the chosen pharmacy in member state.",
    ac(
        "Change Pharmacy opens a list of in-network options.",
        "Selecting a pharmacy updates stored state and on-screen summary.",
        "A success notification confirms the change.",
    ),
    "High",
    "pharmacy,network,member",
    "Pharmacy",
    "5",
)
add_story(
    "STORY-053",
    "As a member, I want the refill-required card to do something useful when clicked so that urgent medication actions are not hidden behind dead UI.",
    "MEMBER-PHARMACY",
    "Bind the refill-required tile into a modal that offers refill and pharmacy-change actions.",
    ac(
        "Refill-required card opens a modal.",
        "Modal offers actionable next steps.",
        "Choosing an action updates status and notifications.",
    ),
    "Medium",
    "pharmacy,urgent-actions,member",
    "Pharmacy",
    "3",
)
add_story(
    "STORY-054",
    "As a member, I want to add and manage dependents so that family members can be included in portal workflows.",
    "MEMBER-PHARMACY",
    "Create a dependent management flow under the member dependents area with stored household state.",
    ac(
        "Members can add dependents with required demographic fields.",
        "Dependents appear in the dependents page.",
        "Nventr can recognize dependent-related prompts.",
    ),
    "High",
    "dependents,household,member",
    "Dependents",
    "5",
)

add_epic(
    "EPIC-012",
    "Consolidated Demo, QA, Accessibility, and Release Readiness",
    "PORTAL-QUALITY",
    "Prepare the portal for deeper implementation by maintaining a consolidated preview, performing page-by-page QA, and defining non-functional expectations.",
    ac(
        "A single-file consolidated preview stays aligned with the source pages.",
        "Broken-flow QA findings are tracked and actionable.",
        "Accessibility, responsiveness, and telemetry expectations are documented in the backlog.",
    ),
    "High",
    "consolidated,qa,accessibility,nfr",
    "Platform",
)
add_story(
    "STORY-055",
    "As a product reviewer, I want a consolidated HTML build that preserves navigation between pages so that stakeholders can review the prototype from one file.",
    "PORTAL-QUALITY",
    "Maintain the consolidated portal build script and output so all portal pages can be navigated inside a single HTML artifact.",
    ac(
        "Consolidated build can be regenerated from source pages.",
        "Internal links stay inside the bundle where supported.",
        "Role-mode launch buttons open the expected starting page.",
    ),
    "Medium",
    "consolidated,demo,build",
    "Platform",
    "5",
)
add_story(
    "STORY-056",
    "As a QA lead, I want page-by-page broken-flow findings documented so that the team can prioritize remaining fixes after prototype hardening.",
    "PORTAL-QUALITY",
    "Run repeatable QA sweeps against provider and member screens and convert findings into backlog-ready remediation items.",
    ac(
        "QA findings identify blockers and shallow interactions separately.",
        "Findings are grouped page by page.",
        "The backlog can be updated after each QA sweep.",
    ),
    "Medium",
    "qa,testing,backlog",
    "Platform",
    "3",
)
add_story(
    "STORY-057",
    "As a frontend engineer, I want consistent shell navigation and labels across provider and member pages so that the portal behaves like one product.",
    "PORTAL-QUALITY",
    "Standardize left navigation, top controls, labels, and AI entry points across pages and personas.",
    ac(
        "Shared shell produces consistent menu labels.",
        "Notifications, settings, and profile positions remain stable.",
        "Role-specific pages preserve the same visual and interaction model.",
    ),
    "Medium",
    "consistency,navigation,frontend",
    "Platform",
    "5",
)
add_story(
    "STORY-058",
    "As an accessibility reviewer, I want keyboard-friendly modals, prompts, and notifications so that core flows are usable beyond pointer-only interactions.",
    "PORTAL-QUALITY",
    "Improve focus management, keyboard triggers, aria labels, and visible status messaging for assistant, workflow modals, and page banners.",
    ac(
        "Interactive modals are reachable by keyboard.",
        "Status changes are exposed clearly in the UI.",
        "Core AI actions remain usable without a mouse.",
    ),
    "Medium",
    "accessibility,keyboard,ux",
    "Platform",
    "5",
)
add_story(
    "STORY-059",
    "As a product and engineering team, I want telemetry and event tracking stories defined so that usage of AI prompts and legacy fallbacks can be measured once the real build starts.",
    "PORTAL-QUALITY",
    "Define event instrumentation for sign-in, prompt usage, workflow queue actions, downloads, handoffs, and fallback-to-legacy behavior.",
    ac(
        "Key provider and member workflows have trackable events defined.",
        "AI-triggered and legacy-triggered paths can be compared.",
        "Human handoff and file-attachment events are included.",
    ),
    "Medium",
    "telemetry,analytics,product",
    "Platform",
    "3",
)


with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
    writer = csv.DictWriter(handle, fieldnames=COLUMNS)
    writer.writeheader()
    writer.writerows(ROWS)

print(f"Wrote {len(ROWS)} issues to {OUTPUT}")
