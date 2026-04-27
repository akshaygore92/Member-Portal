# Feature Coverage Matrix

This matrix summarizes the current coverage of major platform capabilities across the portal prototype, backend workflow reference, and remaining engineering needs.

Status key:
- `Covered`: visible in UI/UX and represented in backend workflow or orchestration logic
- `Partial`: present in prototype/workflow form, but not yet production-grade or fully deep
- `Missing`: not meaningfully represented yet

| Feature | Status | Where in UI / Portal | Where in Backend / Logic | What Still Needs Engineering |
| --- | --- | --- | --- | --- |
| MIPS scores for physicians | Covered | `OperationalEffDashboard.html`, `portal-shell.js` | `portal-shell.js`, `BackendLogicWorkflows.html` | Hook to real physician quality data and scoring services |
| Predictive UM number of episodes | Covered | `OperationalEffDashboard.html`, `portal-shell.js` | `portal-shell.js`, `BackendLogicWorkflows.html` | Replace simulated values with live episode analytics |
| Predictive UM spend reduction | Covered | `OperationalEffDashboard.html`, `portal-shell.js` | `portal-shell.js`, `BackendLogicWorkflows.html` | Connect to care-management and utilization forecasting models |
| Predictive UM impact on MLR | Covered | `OperationalEffDashboard.html`, `portal-shell.js` | `portal-shell.js`, `BackendLogicWorkflows.html` | Feed actual plan-level MLR calculations and episode impact models |
| EOB agent | Covered | `Dashborad.html`, `MemberbillingandHSA.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add real EOB parsing, payer document ingestion, and explanation confidence handling |
| Statement AI agent | Covered | `MemberbillingandHSA.html`, `Dashborad.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add statement normalization, bill segmentation, and real document generation APIs |
| Call center AI agent with live agent | Partial | `OperationalEffDashboard.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add telephony integration, agent desktop, real queue routing, transcript persistence, and SLA logic |
| Ambient listening | Partial | `OperationalEffDashboard.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add live audio stream ingestion, transcription pipeline, PHI-safe storage, and consent management |
| Human handoff from AI | Covered | `portal-shell.js`, provider/member assistant flows | `BackendLogicWorkflows.html` | Add real case-management integration and staffed queue ownership |
| Pre and post care patient management | Covered | `Followuplayer.html`, `FollowupConfig.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Connect reminders and care pathways to live clinical and scheduling events |
| Member enrollment | Covered | `Enrollment.html`, `Members.html`, `ProviderMemberDetail.html` | `BackendLogicWorkflows.html` | Replace local demo persistence with API-backed workflow state |
| Provider verification | Covered | `KYC1.html`, `KYC3.html`, `KYC4.html` | `BackendLogicWorkflows.html` | Connect to credentialing or provider-registry verification services |
| Claim submission | Covered | `Claims.html`, `Claim1.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Integrate clearinghouse or claim intake APIs and external acknowledgements |
| Appeals and denials | Covered | `Denial.html`, `Claim1.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add payer-specific appeal submission endpoints and evidence versioning |
| Prior authorizations | Covered | `Auth.html`, `AddAuth.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add payer API integrations, rule libraries, and medical necessity engines |
| E-forms and packet generation | Covered | `AddAuth.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add form-template library, payload mapping, and payer-specific field validation |
| Billing and payments | Covered | `MemberbillingandHSA.html`, `PaymentandRecon.html` | `BackendLogicWorkflows.html` | Add real payment gateway, HSA integration, remittance ingestion, and settlement states |
| Integrated EDI 835 / ERA / payment posting | Partial | `PaymentandRecon.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add actual remit parsing, posting engine, reconciliation rules, and exception queues |
| Underpayment recovery | Partial | `PaymentandRecon.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add contract modeling, variance detection, and recovery case generation |
| Appointments / scheduling | Covered | `Appointment.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Integrate with real provider scheduling and calendar systems |
| Test / lab order scheduling | Partial | `Appointment.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add lab catalog, order validation, and diagnostic scheduling integrations |
| Rx management / refills / delivery | Covered | `RXandPharmacy.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add pharmacy network APIs, fulfillment statuses, and medication event ingestion |
| Brand vs generic exception handling | Covered | `RXandPharmacy.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Add formulary rules and PBM decisioning connectivity |
| Member / dependent management | Covered | `Dependents.html`, `Members.html`, `ProviderMemberDetail.html` | `BackendLogicWorkflows.html` | Add household relationship APIs and consent/guardian rules |
| Operational dashboard / intelligence | Covered | `OperationalEffDashboard.html`, `portal-shell.js` | `BackendLogicWorkflows.html` | Feed with real warehouse metrics, drill-throughs, and role-specific KPIs |
| CMS star ratings | Covered | `OperationalEffDashboard.html`, `portal-shell.js` | `portal-shell.js`, `BackendLogicWorkflows.html` | Add live plan-level quality metrics and historical trend calculation |
| MLR by plan | Covered | `OperationalEffDashboard.html`, `portal-shell.js` | `portal-shell.js`, `BackendLogicWorkflows.html` | Add plan-level financial fact tables and reconciliation to source systems |
| Multilingual AI support | Partial | `portal-shell.js`, member assistant flows | `BackendLogicWorkflows.html` | Add translation runtime, locale-aware prompts, and multilingual support content |
| Voice prompts | Covered | `OperationalEffDashboard.html`, `portal-shell.js`, `Appointment.html` | `BackendLogicWorkflows.html` | Add production browser/device support and transcript audit storage |
| File-based AI actions | Covered | `portal-shell.js`, claims/auth workflows | `BackendLogicWorkflows.html` | Add OCR, extraction accuracy checks, and secure document lifecycle management |
| Auto-adjudication | Assumed external | Not a direct portal feature | Documented assumption in `BackendLogicWorkflows.html` | Integrate statuses and outputs from existing adjudication platform if needed |

## Immediate High-Value Next Steps

1. Connect provider intelligence metrics in `OperationalEffDashboard.html` to real backend data feeds.
2. Turn `call center AI agent with live agent` from workflow simulation into a true telephony and queue integration.
3. Replace local browser-state persistence across enrollment, claims, auth, and billing with API-backed workflow state.
4. Add real document ingestion for EOB, statements, claims, and prior auth files so AI explanations use production artifacts.
5. Add event-driven audit and correlation IDs across every workflow documented in `BackendLogicWorkflows.html`.
