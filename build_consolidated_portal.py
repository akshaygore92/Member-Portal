from pathlib import Path
import json
import re
from html import unescape

ROOT = Path(__file__).resolve().parent
OUTPUT_NAME = 'PortalConsolidated.html'
PORTAL_SHELL_PATH = ROOT / 'portal-shell.js'

portal_shell = PORTAL_SHELL_PATH.read_text(encoding='utf-8')
portal_shell = portal_shell.replace(
    'const pageName = window.location.pathname.split("/").pop() || "";',
    'const pageName = window.__BUNDLED_PAGE_NAME || (window.location.pathname.split("/").pop() || "");'
)

bridge_helper_template = """
<style>
html.portal-bundle-embedded body > header,
html.portal-bundle-embedded body > aside,
html.portal-bundle-embedded body > nav,
html.portal-bundle-embedded body > div > header,
html.portal-bundle-embedded body > div > aside,
html.portal-bundle-embedded body > div > nav,
html.portal-bundle-embedded #providerWorkspaceShell,
html.portal-bundle-embedded #memberWorkspaceShell {{
  display: none !important;
}}
html.portal-bundle-embedded body > main,
html.portal-bundle-embedded body > div > main,
html.portal-bundle-embedded [class*="md:pl-64"],
html.portal-bundle-embedded [class*="md:pl-20"],
html.portal-bundle-embedded [class*="ml-20"],
html.portal-bundle-embedded [class*="ml-24"],
html.portal-bundle-embedded [class*="ml-64"] {{
  margin-left: 0 !important;
  padding-left: clamp(1rem, 2.5vw, 2rem) !important;
  max-width: none !important;
  width: auto !important;
}}
html.portal-bundle-embedded body > main,
html.portal-bundle-embedded body > div > main,
html.portal-bundle-embedded [class*="pt-20"],
html.portal-bundle-embedded [class*="pt-24"] {{
  padding-top: clamp(1rem, 2vw, 2rem) !important;
}}
</style>
<script>
(function () {{
  window.__PORTAL_BUNDLE_EMBEDDED = true;
  window.__BUNDLED_PAGE_NAME = {page_name};
  document.documentElement.classList.add('portal-bundle-embedded');

  function bundlePageName(target) {{
    if (typeof target !== 'string') return '';
    const trimmed = target.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) {{
      return '';
    }}
    const cleanTarget = trimmed.split('#')[0].split('?')[0];
    return cleanTarget.split('/').pop().split('\\\\').pop();
  }}

  function hideChromeElement(element) {{
    if (!element || element.dataset.portalBundleHidden === 'true') return;
    if (element.closest('#nventrUtilityRoot, #nventrAssistantShell, .nventr-panel, .nventr-overlay')) return;
    element.dataset.portalBundleHidden = 'true';
    element.hidden = true;
    element.style.setProperty('display', 'none', 'important');
  }}

  function looksLikePageChrome(element) {{
    if (!element) return false;
    const tag = element.tagName ? element.tagName.toLowerCase() : '';
    const className = String(element.getAttribute('class') || '');
    const id = String(element.id || '').toLowerCase();
    const parent = element.parentElement;
    const htmlLinkCount = element.querySelectorAll('a[href$=".html"], a[href*=".html#"], a[href*=".html?"]').length;
    const shellLike = id.includes('sidenav') || id.includes('sidebar') || /(^|\\s)(fixed|sticky|top-0|top-16|left-0)(\\s|$)/.test(className);

    if (element.id === 'providerWorkspaceShell' || element.id === 'memberWorkspaceShell') return true;
    if (parent === document.body && (tag === 'header' || tag === 'aside' || tag === 'nav')) return true;
    if (parent && parent.parentElement === document.body && (tag === 'header' || tag === 'aside' || tag === 'nav')) {{
      return shellLike || htmlLinkCount > 1;
    }}
    return false;
  }}

  function suppressBundledPageChrome() {{
    if (!document.body) return;
    document.body.classList.add('portal-bundle-embedded');
    document
      .querySelectorAll('body > header, body > aside, body > nav, body > div > header, body > div > aside, body > div > nav, #providerWorkspaceShell, #memberWorkspaceShell')
      .forEach(function (element) {{
        if (looksLikePageChrome(element)) hideChromeElement(element);
      }});
  }}

  window.__bundleNavigate = function (target) {{
    const pageName = bundlePageName(target);
    if (!pageName || !parent || !parent.PortalBundle) return false;
    const resolvedPage = typeof parent.PortalBundle.resolvePage === 'function'
      ? parent.PortalBundle.resolvePage(pageName)
      : pageName;
    if (resolvedPage && parent.PortalBundle.hasPage(resolvedPage)) {{
      parent.PortalBundle.navigate(resolvedPage);
      return true;
    }}
    return false;
  }};

  window.__bundleRedirect = function (target) {{
    if (typeof target === 'string' && window.__bundleNavigate(target)) {{
      return target;
    }}
    document.location.href = target;
    return target;
  }};

  document.addEventListener('click', function (event) {{
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (window.__bundleNavigate(href)) {{
      event.preventDefault();
    }}
  }});

  if (document.readyState === 'loading') {{
    document.addEventListener('DOMContentLoaded', suppressBundledPageChrome);
  }} else {{
    suppressBundledPageChrome();
  }}

  new MutationObserver(suppressBundledPageChrome).observe(document.documentElement, {{ childList: true, subtree: true }});
}})();
</script>
"""

TITLE_RE = re.compile(r'<title>(.*?)</title>', re.IGNORECASE | re.DOTALL)
LOCATION_HREF_RE = re.compile(r'(?:(?:window|document)\.)?location\.href\s*=\s*(.+?);')

GROUPS = [
    ('Entry & Access', ['LandingPage.html', 'SignIn.html']),
    ('Provider Workspace', ['OperationalEffDashboard.html', 'Members.html', 'ProviderMemberDetail.html', 'Claims.html', 'Claim1.html', 'Denial.html', 'Auth.html', 'AddAuth.html', 'PaymentandRecon.html']),
    ('Member Workspace', ['Dashborad.html', 'Enrollment.html', 'Dependents.html', 'MemberbillingandHSA.html', 'FollowupConfig.html']),
    ('Shared Care Menus', ['Appointment.html', 'RXandPharmacy.html', 'Followuplayer.html']),
    ('Verification & Onboarding', ['KYC1.html', 'KYC2.html', 'KYC3.html', 'KYC4.html']),
    ('Back Office', ['BackendLogicWorkflows.html'])
]

page_files = sorted(
    [
        path for path in ROOT.glob('*.html')
        if path.name != OUTPUT_NAME and not path.name.lower().startswith('portalconsolidated')
    ],
    key=lambda item: item.name.lower()
)

DISPLAY_TITLE_OVERRIDES = {
    'AddAuth.html': 'New Prior Authorization',
    'Appointment.html': 'Appointments',
    'Auth.html': 'Prior Authorizations',
    'BackendLogicWorkflows.html': 'Backend Logic Workflows',
    'Claim1.html': 'Claims Workbench',
    'Claims.html': 'Claims Queue',
    'OperationalEffDashboard.html': 'Provider Dashboard',
    'Dashborad.html': 'Member Dashboard',
    'Denial.html': 'Appeals & Denials',
    'Dependents.html': 'Dependents',
    'Enrollment.html': 'Enrollment',
    'FollowupConfig.html': 'Follow-Up Configuration',
    'Followuplayer.html': 'Care Journey',
    'KYC1.html': 'Provider Verification',
    'KYC2.html': 'Role Routing',
    'KYC3.html': 'Document Review',
    'KYC4.html': 'Verification Complete',
    'LandingPage.html': 'Landing Page',
    'MemberbillingandHSA.html': 'Billing & HSA',
    'Members.html': 'Provider Members',
    'PaymentandRecon.html': 'Payments & Reconciliation',
    'ProviderMemberDetail.html': 'Provider Member Detail',
    'RXandPharmacy.html': 'Pharmacy',
    'SignIn.html': 'Sign In'
}

DISPLAY_SUBTITLE_OVERRIDES = {
    'LandingPage.html': 'Entry and persona selection',
    'SignIn.html': 'Role-aware access',
    'Dashborad.html': 'Member command center',
    'Enrollment.html': 'Registration through activation',
    'Appointment.html': 'Scheduling and visits',
    'RXandPharmacy.html': 'Refills, pharmacy, delivery',
    'MemberbillingandHSA.html': 'Statements, EOB, HSA',
    'Followuplayer.html': 'Pre/post care workflow',
    'FollowupConfig.html': 'Follow-up rule setup',
    'Dependents.html': 'Household coverage',
    'OperationalEffDashboard.html': 'Provider operations overview',
    'Claims.html': 'Claim list and intake',
    'Claim1.html': 'Claim detail and triage',
    'Denial.html': 'Appeals and recovery',
    'Auth.html': 'Authorization review',
    'AddAuth.html': 'Prior auth request',
    'PaymentandRecon.html': 'ERA and reconciliation',
    'Members.html': 'Provider member list',
    'ProviderMemberDetail.html': 'Provider member profile',
    'KYC1.html': 'Identity start',
    'KYC2.html': 'Role and credentials',
    'KYC3.html': 'Document review',
    'KYC4.html': 'Activation',
    'BackendLogicWorkflows.html': 'Demo workflow map'
}

known_grouped = {name for _, names in GROUPS for name in names}
extras = [path.name for path in page_files if path.name not in known_grouped]
if extras:
    GROUPS.append(('More', extras))

pages = {}
meta = {}

for path in page_files:
    raw = path.read_text(encoding='utf-8')
    title_match = TITLE_RE.search(raw)
    title = unescape(title_match.group(1).strip()) if title_match else path.stem
    title = DISPLAY_TITLE_OVERRIDES.get(path.name, title)

    helper = bridge_helper_template.format(page_name=json.dumps(path.name))
    content = LOCATION_HREF_RE.sub(r'window.__bundleRedirect(\1);', raw)
    content = content.replace('<head>', '<head>\n' + helper, 1)

    if '<script src="portal-shell.js"></script>' in content:
        inline_shell = (
            f"<script>window.__BUNDLED_PAGE_NAME = {json.dumps(path.name)};</script>\n"
            f"<script>\n{portal_shell}\n</script>"
        )
        content = content.replace('<script src="portal-shell.js"></script>', inline_shell)

    pages[path.name] = content
    meta[path.name] = {
        'title': title,
        'subtitle': DISPLAY_SUBTITLE_OVERRIDES.get(path.name, path.name),
        'group': next((group for group, names in GROUPS if path.name in names), 'More')
    }


def safe_json(value):
    return json.dumps(value, ensure_ascii=False).replace('</', '<\\/')

html_output = f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>Axis Core AI Consolidated Portal</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #07131f;
      --panel: #102134;
      --panel-soft: #14273d;
      --line: rgba(148, 163, 184, 0.16);
      --text: #e4efff;
      --muted: #8ea0b9;
      --primary: #7dd3fc;
      --accent: #a78bfa;
      --success: #6ee7b7;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: Inter, Segoe UI, sans-serif;
      background:
        radial-gradient(circle at top left, rgba(125, 211, 252, 0.12), transparent 24%),
        radial-gradient(circle at bottom right, rgba(167, 139, 250, 0.14), transparent 28%),
        linear-gradient(180deg, #07131f 0%, #0b1728 100%);
      color: var(--text);
    }}
    .layout {{ display: grid; grid-template-columns: 340px minmax(0, 1fr); min-height: 100vh; }}
    .sidebar {{ border-right: 1px solid var(--line); background: rgba(5, 12, 22, 0.92); backdrop-filter: blur(16px); padding: 20px; }}
    .brand {{ display: flex; gap: 14px; align-items: center; padding: 14px; border: 1px solid var(--line); border-radius: 20px; background: rgba(255,255,255,0.04); }}
    .brand-mark {{ display: grid; place-items: center; width: 48px; height: 48px; border-radius: 16px; background: rgba(125, 211, 252, 0.12); color: var(--primary); font-size: 24px; }}
    .eyebrow {{ margin: 0; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--primary); font-weight: 700; }}
    .brand-title {{ margin: 4px 0 0; font-size: 18px; font-weight: 800; }}
    .brand-copy {{ margin: 4px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }}
    .toolbar {{ margin-top: 18px; display: grid; gap: 10px; }}
    .search {{ width: 100%; border: 1px solid var(--line); background: rgba(15, 23, 42, 0.88); color: var(--text); border-radius: 16px; padding: 12px 14px; font-size: 14px; }}
    .search:focus {{ outline: 2px solid rgba(125, 211, 252, 0.24); border-color: rgba(125, 211, 252, 0.48); }}
    .role-row, .action-row {{ display: flex; gap: 10px; flex-wrap: wrap; }}
    .btn {{ border: 1px solid var(--line); background: rgba(15, 23, 42, 0.88); color: var(--text); border-radius: 999px; padding: 10px 14px; font-size: 13px; font-weight: 700; cursor: pointer; }}
    .btn:hover {{ border-color: rgba(125, 211, 252, 0.42); }}
    .btn.active {{ background: rgba(125, 211, 252, 0.16); color: #f8fdff; border-color: rgba(125, 211, 252, 0.42); }}
    .btn.ghost {{ color: var(--muted); }}
    .note {{ margin-top: 12px; border: 1px solid rgba(110, 231, 183, 0.16); background: rgba(110, 231, 183, 0.08); color: #dffcf4; border-radius: 16px; padding: 12px; font-size: 12px; line-height: 1.5; }}
    .nav {{ margin-top: 16px; display: grid; gap: 14px; max-height: calc(100vh - 286px); overflow: auto; padding-right: 6px; }}
    .nav-group-title {{ margin: 0 0 10px; color: var(--muted); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; }}
    .nav-list {{ display: grid; gap: 8px; }}
    .nav-button {{ width: 100%; text-align: left; border: 1px solid transparent; background: rgba(255,255,255,0.02); color: #dbe7f7; border-radius: 14px; padding: 10px 12px; cursor: pointer; }}
    .nav-button:hover {{ border-color: var(--line); background: rgba(255,255,255,0.04); }}
    .nav-button.active {{ border-color: rgba(125, 211, 252, 0.34); background: rgba(125, 211, 252, 0.12); }}
    .nav-button small {{ display: block; margin-top: 4px; color: var(--muted); font-size: 12px; }}
    .main {{ display: flex; flex-direction: column; min-width: 0; }}
    .topbar {{ display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--line); background: rgba(7, 19, 31, 0.72); backdrop-filter: blur(16px); }}
    .topbar h1 {{ margin: 4px 0 0; font-size: 24px; }}
    .topbar p {{ margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; max-width: 780px; }}
    .status {{ display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }}
    .chip {{ border: 1px solid var(--line); background: rgba(15, 23, 42, 0.82); color: var(--muted); border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700; }}
    .chip strong {{ color: var(--text); }}
    .viewer {{ flex: 1; padding: 24px; }}
    iframe {{ width: 100%; min-height: calc(100vh - 150px); border: 1px solid var(--line); border-radius: 28px; background: #fff; box-shadow: 0 30px 80px rgba(2, 8, 23, 0.42); }}
    .empty {{ padding: 40px; border: 1px dashed var(--line); border-radius: 24px; color: var(--muted); background: rgba(255,255,255,0.02); }}
    @media (max-width: 1100px) {{
      .layout {{ grid-template-columns: 1fr; }}
      .sidebar {{ border-right: 0; border-bottom: 1px solid var(--line); }}
      .nav {{ max-height: none; }}
      iframe {{ min-height: 78vh; }}
    }}
  </style>
</head>
<body>
  <div class=\"layout\">
    <aside class=\"sidebar\">
      <div class=\"brand\">
        <div class=\"brand-mark\">A</div>
        <div>
          <p class=\"eyebrow\">Consolidated Demo</p>
          <p class=\"brand-title\">Axis Core AI Portal</p>
          <p class=\"brand-copy\">Review every provider, member, onboarding, and back-office screen from one consistent menu.</p>
        </div>
      </div>
      <div class=\"toolbar\">
        <input id=\"pageSearch\" class=\"search\" type=\"search\" placeholder=\"Search pages...\" />
        <div class=\"role-row\">
          <button class=\"btn\" id=\"memberModeBtn\" type=\"button\">Member Mode</button>
          <button class=\"btn\" id=\"providerModeBtn\" type=\"button\">Provider Mode</button>
        </div>
        <div class=\"action-row\">
          <button class=\"btn ghost\" id=\"resetStateBtn\" type=\"button\">Reset Demo State</button>
        </div>
      </div>
      <div class=\"note\">
        Leadership review mode: use this menu as the source of truth while page-level sidebars are suppressed inside the preview.
      </div>
      <div class=\"nav\" id=\"pageNav\"></div>
    </aside>
    <main class=\"main\">
      <header class=\"topbar\">
        <div>
          <p class=\"eyebrow\" id=\"currentGroup\">Entry & Access</p>
          <h1 id=\"currentTitle\">Landing Page</h1>
          <p id=\"currentPath\">LandingPage.html</p>
        </div>
        <div class=\"status\">
          <div class=\"chip\">Pages: <strong>{len(page_files)}</strong></div>
          <div class=\"chip\">Role: <strong id=\"currentRole\">member</strong></div>
          <div class=\"chip\">Mode: <strong>Consolidated Preview</strong></div>
        </div>
      </header>
      <div class=\"viewer\">
        <iframe id=\"pageFrame\" title=\"Axis Core AI consolidated portal preview\"></iframe>
      </div>
    </main>
  </div>
  <script>
    const PAGE_CONTENT = {safe_json(pages)};
    const PAGE_META = {safe_json(meta)};
    const PAGE_GROUPS = {safe_json(GROUPS)};

    const frame = document.getElementById('pageFrame');
    const pageNav = document.getElementById('pageNav');
    const pageSearch = document.getElementById('pageSearch');
    const memberModeBtn = document.getElementById('memberModeBtn');
    const providerModeBtn = document.getElementById('providerModeBtn');
    const resetStateBtn = document.getElementById('resetStateBtn');
    const currentTitle = document.getElementById('currentTitle');
    const currentPath = document.getElementById('currentPath');
    const currentGroup = document.getElementById('currentGroup');
    const currentRole = document.getElementById('currentRole');

    const state = {{
      currentPage: 'LandingPage.html',
      filter: ''
    }};

    function normalizePageName(pageName) {{
      if (typeof pageName !== 'string') return '';
      const cleanName = pageName.trim().split('#')[0].split('?')[0].split('/').pop().split('\\\\').pop();
      if (!cleanName) return '';
      if (Object.prototype.hasOwnProperty.call(PAGE_CONTENT, cleanName)) return cleanName;
      const lowerName = cleanName.toLowerCase();
      return Object.keys(PAGE_CONTENT).find((name) => name.toLowerCase() === lowerName) || '';
    }}

    function hasPage(pageName) {{
      return Boolean(normalizePageName(pageName));
    }}

    function readRole() {{
      return localStorage.getItem('preferredRole') || localStorage.getItem('kycRole') || 'provider';
    }}

    function setRole(role) {{
      localStorage.setItem('preferredRole', role);
      localStorage.setItem('kycRole', role);
      updateRoleButtons();
      loadPage(state.currentPage);
    }}

    function updateRoleButtons() {{
      const role = readRole();
      currentRole.textContent = role;
      memberModeBtn.classList.toggle('active', role === 'member');
      providerModeBtn.classList.toggle('active', role === 'provider');
    }}

    function loadPage(pageName) {{
      const resolvedPage = normalizePageName(pageName);
      if (!resolvedPage) return;
      state.currentPage = resolvedPage;
      frame.srcdoc = PAGE_CONTENT[resolvedPage];
      const meta = PAGE_META[resolvedPage] || {{ title: resolvedPage, group: 'More' }};
      currentTitle.textContent = meta.title;
      currentPath.textContent = resolvedPage;
      currentGroup.textContent = meta.group;
      if (window.location.hash !== '#' + encodeURIComponent(resolvedPage)) {{
        window.location.hash = encodeURIComponent(resolvedPage);
      }}
      renderNav();
    }}

    function renderNav() {{
      const filter = state.filter.trim().toLowerCase();
      pageNav.innerHTML = '';

      PAGE_GROUPS.forEach(([groupName, names]) => {{
        const visibleNames = names.filter((name) => hasPage(name)).filter((name) => {{
          if (!filter) return true;
          const meta = PAGE_META[name] || {{ title: name }};
          return name.toLowerCase().includes(filter) || meta.title.toLowerCase().includes(filter);
        }});

        if (!visibleNames.length) return;

        const group = document.createElement('section');
        const title = document.createElement('p');
        title.className = 'nav-group-title';
        title.textContent = groupName;
        group.appendChild(title);

        const list = document.createElement('div');
        list.className = 'nav-list';
        visibleNames.forEach((name) => {{
          const meta = PAGE_META[name] || {{ title: name }};
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'nav-button' + (name === state.currentPage ? ' active' : '');
          button.innerHTML = `<span>${{meta.title}}</span><small>${{meta.subtitle || name}}</small>`;
          button.addEventListener('click', () => loadPage(name));
          list.appendChild(button);
        }});
        group.appendChild(list);
        pageNav.appendChild(group);
      }});

      if (!pageNav.children.length) {{
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'No pages matched your search.';
        pageNav.appendChild(empty);
      }}
    }}

    window.PortalBundle = {{
      navigate(pageName) {{ loadPage(pageName); }},
      hasPage(pageName) {{ return hasPage(pageName); }},
      resolvePage(pageName) {{ return normalizePageName(pageName); }}
    }};

    pageSearch.addEventListener('input', (event) => {{
      state.filter = event.target.value || '';
      renderNav();
    }});

    memberModeBtn.addEventListener('click', () => {{
      setRole('member');
      loadPage('Dashborad.html');
    }});
    providerModeBtn.addEventListener('click', () => {{
      setRole('provider');
      loadPage('OperationalEffDashboard.html');
    }});
    resetStateBtn.addEventListener('click', () => {{
      localStorage.clear();
      localStorage.setItem('preferredRole', 'provider');
      localStorage.setItem('kycRole', 'provider');
      updateRoleButtons();
      loadPage('LandingPage.html');
    }});

    window.addEventListener('hashchange', () => {{
      const target = decodeURIComponent(window.location.hash.replace(/^#/, ''));
      if (target && target !== state.currentPage && hasPage(target)) {{
        loadPage(target);
      }}
    }});

    updateRoleButtons();
    localStorage.setItem('preferredRole', readRole());
    localStorage.setItem('kycRole', readRole());
    const initialPage = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    loadPage(hasPage(initialPage) ? initialPage : 'LandingPage.html');
  </script>
</body>
</html>
"""

(ROOT / OUTPUT_NAME).write_text(html_output, encoding='utf-8')
print(f'Generated {OUTPUT_NAME} with {len(page_files)} pages.')
