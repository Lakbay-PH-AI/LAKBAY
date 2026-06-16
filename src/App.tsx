import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  BedDouble,
  Bell,
  Bookmark,
  Bot,
  Bus,
  Check,
  Clipboard,
  Copy,
  Database,
  ExternalLink,
  Eye,
  Globe2,
  Home,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Map,
  Moon,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Ticket,
  User,
  Wrench
} from "lucide-react";
import { aiProviders, destinations, recommendations, webhookEvents, webhooks } from "./data/mockData";
import type { ModuleId, NavItem, PromptBuilderState, Recommendation, ThemeMode, UserAccount } from "./types/travel";
import { buildTravelPrompt, copyText, filterRecommendations } from "./utils/search";
import islandPreview from "./assets/lakbay-islands.png";

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "dashboard", label: "Dashboard", icon: Map, protected: true },
  { id: "planner", label: "AI Planner", icon: Sparkles, protected: true },
  { id: "hotels", label: "Hotels", icon: BedDouble },
  { id: "transport", label: "Transport", icon: Bus },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "deals", label: "Deals", icon: BadgeCheck },
  { id: "klook", label: "Klook", icon: Globe2 },
  { id: "saved", label: "Saved Trips", icon: Bookmark, protected: true },
  { id: "integrations", label: "Integrations", icon: KeyRound, protected: true },
  { id: "settings", label: "Settings", icon: Settings, protected: true },
  { id: "admin", label: "Admin", icon: Wrench, protected: true, adminOnly: true },
  { id: "profile", label: "Profile", icon: User, protected: true }
];

const initialPromptState: PromptBuilderState = {
  destination: "Boracay",
  dateRange: "2026-08-12 to 2026-08-17",
  travelers: "2 adults",
  adults: 2,
  kids: 0,
  budget: "PHP 60,000",
  tripType: "Beach, food, light adventure",
  hotelLevel: "Mid-range beachfront",
  transportPreference: "Flight plus airport transfer",
  mustSee: "White Beach, sunset sailing, island hopping, local seafood",
  pace: "Balanced",
  accessibility: "",
  food: "Seafood, Filipino comfort food, cafes",
  includeKlook: true,
  includeDiscounts: true,
  optimizeFor: "best value",
  promptType: "all-in-one master prompt"
};

const guestMessage = "Sign in to use AI travel search, generate prompts, save trips, and access personalized recommendations.";

function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("planner");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [glass, setGlass] = useState(74);
  const [authView, setAuthView] = useState<"signin" | "signup" | "forgot" | "reset" | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [promptState, setPromptState] = useState(initialPromptState);
  const [query, setQuery] = useState("Boracay beachfront hotel airport transfer Klook activities");
  const [category, setCategory] = useState("all");
  const [generatedPrompt, setGeneratedPrompt] = useState(buildTravelPrompt(initialPromptState));
  const [savedIds, setSavedIds] = useState<string[]>(["hotel-1", "klook-1"]);
  const [toast, setToast] = useState("");

  const visibleRecommendations = useMemo(() => filterRecommendations(recommendations, query, category), [query, category]);
  const isAuthed = Boolean(user);

  const protect = (module: ModuleId) => {
    const target = navItems.find((item) => item.id === module);
    if (target?.adminOnly && user?.role !== "admin") {
      setAuthView("signin");
      setToast("Admin access requires an admin session.");
      return;
    }
    if (target?.protected && !isAuthed) {
      setActiveModule(module);
      setAuthView("signin");
      setToast(guestMessage);
      return;
    }
    setActiveModule(module);
  };

  const signIn = (role: "user" | "admin" = "user") => {
    setUser({
      name: role === "admin" ? "Admin Traveller" : "Maria Santos",
      email: role === "admin" ? "admin@lakbay.ai" : "maria@lakbay.ai",
      role,
      currency: "PHP",
      timezone: "Asia/Manila"
    });
    setAuthView(null);
    setToast("Signed in. Your AI travel workspace is unlocked.");
  };

  const guardedAction = (action: () => void) => {
    if (!isAuthed) {
      setAuthView("signin");
      setToast(guestMessage);
      return;
    }
    action();
  };

  const saveRecommendation = (id: string) => {
    guardedAction(() => {
      setSavedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
      setToast("Saved to your travel workspace.");
    });
  };

  const generatePrompt = () => {
    guardedAction(() => {
      setGeneratedPrompt(buildTravelPrompt(promptState));
      setToast("Detailed Philippines travel prompt generated.");
    });
  };

  return (
    <div className={`app ${theme}`} style={{ "--glass": `${glass}%` } as React.CSSProperties}>
      <div className="mapGlow" />
      <aside className="sidebar glass">
        <button className="brand" onClick={() => protect("home")} aria-label="Go to home">
          <span className="brandMark">LA</span>
          <span>
            <strong>Lakbay AI</strong>
            <small>Philippines</small>
          </span>
        </button>

        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeModule === item.id ? "active" : ""}
              onClick={() => protect(item.id)}
              title={item.protected ? "Sign-in protected area" : item.label}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.protected && <Lock size={13} />}
            </button>
          ))}
        </nav>

        <div className="profileTile">
          <div className="avatar">{user ? user.name.slice(0, 2).toUpperCase() : "G"}</div>
          <div>
            <strong>{user ? user.name : "Guest traveler"}</strong>
            <span>{user ? `${user.role} · ${user.currency}` : "Public preview only"}</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar glass">
          <div>
            <h1>{titleFor(activeModule)}</h1>
            <p>{subtitleFor(activeModule, isAuthed)}</p>
          </div>
          <div className="topActions">
            <button className="iconButton" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
              {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
            </button>
            <button className="iconButton" title="Notifications">
              <Bell size={18} />
            </button>
            {user ? (
              <button className="primary ghost" onClick={() => setUser(null)}>
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <button className="primary" onClick={() => setAuthView("signin")}>
                <LogIn size={16} /> Sign In
              </button>
            )}
          </div>
        </header>

        {toast && (
          <button className="toast" onClick={() => setToast("")}>
            <Check size={16} /> {toast}
          </button>
        )}

        <section className="workspace">
          <div className="contentColumn">
            {activeModule === "home" && <HomePanel onStart={() => protect("planner")} />}
            {activeModule === "dashboard" && <Dashboard savedIds={savedIds} />}
            {activeModule === "planner" && (
              <Planner
                promptState={promptState}
                setPromptState={setPromptState}
                generatedPrompt={generatedPrompt}
                generatePrompt={generatePrompt}
                runPrompt={() => guardedAction(() => setToast("AI run queued. Backend provider proxy is ready for real keys."))}
                query={query}
                setQuery={setQuery}
                isAuthed={isAuthed}
              />
            )}
            {["hotels", "transport", "tickets", "deals", "klook"].includes(activeModule) && (
              <RecommendationsModule
                activeModule={activeModule}
                query={query}
                setQuery={setQuery}
                category={category}
                setCategory={setCategory}
                items={visibleRecommendations}
                saveIds={savedIds}
                onSave={saveRecommendation}
              />
            )}
            {activeModule === "saved" && <SavedTrips items={recommendations.filter((item) => savedIds.includes(item.id))} onSave={saveRecommendation} />}
            {activeModule === "integrations" && <Integrations />}
            {activeModule === "settings" && <SettingsPanel glass={glass} setGlass={setGlass} theme={theme} setTheme={setTheme} />}
            {activeModule === "admin" && <AdminPanel />}
            {activeModule === "profile" && <Profile user={user} />}
          </div>

          <aside className="inspector">
            <StatusPanel />
            <DealsPanel onSave={saveRecommendation} savedIds={savedIds} />
            <DatabasePanel />
          </aside>
        </section>
      </main>

      {authView && <AuthModal view={authView} setView={setAuthView} onClose={() => setAuthView(null)} onSignIn={signIn} />}
    </div>
  );
}

function titleFor(module: ModuleId) {
  const titles: Record<ModuleId, string> = {
    home: "Lakbay AI Philippines",
    dashboard: "Travel Command Center",
    planner: "AI Planner",
    hotels: "Hotels & Accommodations",
    transport: "Transport Planner",
    tickets: "Tickets & Activities",
    deals: "Deals Lab",
    klook: "Klook Explorer",
    saved: "Saved Trips",
    integrations: "AI Integrations",
    settings: "Settings",
    admin: "Admin Management",
    profile: "Profile & Account"
  };
  return titles[module];
}

function subtitleFor(module: ModuleId, isAuthed: boolean) {
  if (!isAuthed && ["planner", "dashboard", "saved", "integrations", "settings", "admin", "profile"].includes(module)) return guestMessage;
  const copy: Record<ModuleId, string> = {
    home: "Premium AI travel planning and research for destinations across the Philippines.",
    dashboard: "Recent trips, provider health, webhook status, saved links, and destination trends.",
    planner: "Generate prompts, run AI travel research, compare providers, and reuse structured outputs.",
    hotels: "Search hotels, hostels, apartments, resorts, villas, and family stays with source links.",
    transport: "Plan flights, ferries, buses, vans, taxis, transfers, and island-hopping routes.",
    tickets: "Compare attraction tickets, tours, family activities, city passes, and cultural sites.",
    deals: "Track verified, estimated, seasonal, member-only, and user-added discount opportunities.",
    klook: "Explore tours, transfers, bundles, passes, and activity packages with clear link labels.",
    saved: "Your shortlists, saved itineraries, recent AI queries, and recommendation links.",
    integrations: "Configure Claude, ChatGPT, Grok, Gemini, OpenRouter, custom providers, and webhooks.",
    settings: "Profile, travel preferences, AI defaults, theme, glass intensity, exports, and notifications.",
    admin: "System controls for providers, roles, webhooks, audit logs, and usage protection.",
    profile: "Account details, saved searches, notification preferences, and session state."
  };
  return copy[module];
}

function HomePanel({ onStart }: { onStart: () => void }) {
  return (
    <motion.section className="hero glass" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h2>Plan smarter Philippine trips with AI research that respects source quality.</h2>
        <p>
          Build detailed prompts, compare providers, inspect hotels and transport, find Klook activity options, and save verified links without pretending demo data is live inventory.
        </p>
        <div className="heroActions">
          <button className="primary" onClick={onStart}>
            <Sparkles size={17} /> Open AI Planner
          </button>
          <a className="primary ghost" href="https://www.klook.com/en-PH/" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> Klook Philippines
          </a>
        </div>
      </div>
      <div className="islandMap" aria-hidden="true">
        {destinations.slice(0, 8).map((destination, index) => (
          <span key={destination} style={{ "--i": index } as React.CSSProperties}>
            {destination}
          </span>
        ))}
      </div>
    </motion.section>
  );
}

function Dashboard({ savedIds }: { savedIds: string[] }) {
  return (
    <div className="grid two">
      <Metric title="Saved recommendations" value={String(savedIds.length)} note="Hotels, routes, deals, and Klook activities" />
      <Metric title="Provider status" value="4/5" note="One provider degraded, no exposed frontend keys" />
      <Metric title="Webhook health" value="2 live" note="Trip, export, and alert event support" />
      <Metric title="Destination trends" value="Boracay" note="Beachfront stays and transfers are rising" />
      <section className="panel wide">
        <h3>Quick Prompt Launcher</h3>
        <div className="chips">
          {["5-day Boracay value trip", "El Nido island-hopping comparison", "Cebu family hotel shortlist", "Manila to Baguio transport timeline"].map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <section className="panel metric">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </section>
  );
}

function Planner({
  promptState,
  setPromptState,
  generatedPrompt,
  generatePrompt,
  runPrompt,
  query,
  setQuery,
  isAuthed
}: {
  promptState: PromptBuilderState;
  setPromptState: (state: PromptBuilderState) => void;
  generatedPrompt: string;
  generatePrompt: () => void;
  runPrompt: () => void;
  query: string;
  setQuery: (value: string) => void;
  isAuthed: boolean;
}) {
  const update = <K extends keyof PromptBuilderState>(key: K, value: PromptBuilderState[K]) => setPromptState({ ...promptState, [key]: value });

  return (
    <div className="plannerGrid">
      <section className="panel promptBuilder">
        <div className="sectionHeader">
          <h3>Prompt Builder</h3>
          <span>{isAuthed ? "Protected workspace" : "Preview mode"}</span>
        </div>
        <div className="formGrid">
          <Field label="Destination" value={promptState.destination} onChange={(value) => update("destination", value)} />
          <Field label="Date range" value={promptState.dateRange} onChange={(value) => update("dateRange", value)} />
          <Field label="Travelers" value={promptState.travelers} onChange={(value) => update("travelers", value)} />
          <Field label="Budget" value={promptState.budget} onChange={(value) => update("budget", value)} />
          <Field label="Trip type" value={promptState.tripType} onChange={(value) => update("tripType", value)} />
          <Field label="Hotel level" value={promptState.hotelLevel} onChange={(value) => update("hotelLevel", value)} />
          <Field label="Transport" value={promptState.transportPreference} onChange={(value) => update("transportPreference", value)} />
          <label>
            Optimize
            <select value={promptState.optimizeFor} onChange={(event) => update("optimizeFor", event.target.value as PromptBuilderState["optimizeFor"])}>
              <option>best value</option>
              <option>cheapest</option>
              <option>fastest</option>
              <option>premium</option>
            </select>
          </label>
        </div>
        <label>
          Must-see places
          <textarea value={promptState.mustSee} onChange={(event) => update("mustSee", event.target.value)} />
        </label>
        <div className="toggleRow">
          <button className={promptState.includeKlook ? "selected" : ""} onClick={() => update("includeKlook", !promptState.includeKlook)}>
            <Check size={15} /> Include Klook
          </button>
          <button className={promptState.includeDiscounts ? "selected" : ""} onClick={() => update("includeDiscounts", !promptState.includeDiscounts)}>
            <Check size={15} /> Discount search
          </button>
        </div>
        <div className="actions">
          <button className="primary" onClick={generatePrompt}>
            <Clipboard size={16} /> Generate Prompt
          </button>
          <button className="primary ghost" onClick={runPrompt}>
            <Send size={16} /> Run Prompt
          </button>
        </div>
      </section>

      <section className="panel aiOutput">
        <div className="sectionHeader">
          <h3>AI Travel Query</h3>
          <button onClick={() => copyText(generatedPrompt)}>
            <Copy size={15} /> Copy
          </button>
        </div>
        <div className="searchBox">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask for a Philippine trip plan..." />
        </div>
        <pre>{generatedPrompt}</pre>
        <div className="resultCard">
          <img src={islandPreview} alt="Philippine island route planning preview" />
          <div>
            <strong><Bot size={16} /> Structured result preview</strong>
            <p>Use backend provider keys to return live AI output. Demo recommendations remain clearly marked as estimated or sample links.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function RecommendationsModule({
  activeModule,
  query,
  setQuery,
  category,
  setCategory,
  items,
  saveIds,
  onSave
}: {
  activeModule: ModuleId;
  query: string;
  setQuery: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  items: Recommendation[];
  saveIds: string[];
  onSave: (id: string) => void;
}) {
  const moduleCategory = activeModule === "hotels" ? "hotel" : activeModule === "tickets" ? "ticket" : activeModule === "deals" ? "deal" : activeModule === "klook" ? "klook" : activeModule === "transport" ? "transport" : "all";
  const moduleItems = items.filter((item) => moduleCategory === "all" || item.category === moduleCategory);

  return (
    <section className="panel">
      <div className="sectionHeader">
        <h3>Searchable Recommendation Links</h3>
        <span>{moduleItems.length} results</span>
      </div>
      <div className="toolbar">
        <div className="searchBox">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destination, route, hotel, activity..." />
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All</option>
          <option value="hotel">Hotels</option>
          <option value="transport">Transport</option>
          <option value="ticket">Tickets</option>
          <option value="deal">Deals</option>
          <option value="klook">Klook</option>
        </select>
      </div>
      <div className="recommendationList">
        {moduleItems.map((item) => (
          <RecommendationCard key={item.id} item={item} saved={saveIds.includes(item.id)} onSave={() => onSave(item.id)} />
        ))}
      </div>
    </section>
  );
}

function RecommendationCard({ item, saved, onSave }: { item: Recommendation; saved: boolean; onSave: () => void }) {
  return (
    <article className="recommendation">
      <div>
        <span className={`status ${item.link.status.replace(" ", "-")}`}>{item.link.status}</span>
        <h4>{item.title}</h4>
        <p>{item.summary}</p>
        <small>{item.meta}</small>
        <div className="visibleUrl">{item.link.url}</div>
      </div>
      <div className="recActions">
        <strong>{item.price}</strong>
        <a href={item.link.url} target="_blank" rel="noreferrer">
          <ExternalLink size={15} /> {item.link.label}
        </a>
        <button onClick={() => copyText(item.link.url)}>
          <Copy size={15} /> Copy URL
        </button>
        <button onClick={onSave}>
          <Save size={15} /> {saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}

function SavedTrips({ items, onSave }: { items: Recommendation[]; onSave: (id: string) => void }) {
  return (
    <section className="panel">
      <h3>Saved Trips & Links</h3>
      {items.length ? (
        <div className="recommendationList">{items.map((item) => <RecommendationCard key={item.id} item={item} saved onSave={() => onSave(item.id)} />)}</div>
      ) : (
        <div className="emptyState">
          <Bookmark size={24} />
          <strong>No saved links yet</strong>
          <p>Save hotels, routes, activities, deals, and AI outputs after signing in.</p>
        </div>
      )}
    </section>
  );
}

function Integrations() {
  return (
    <div className="grid two">
      {aiProviders.map((provider) => (
        <section className="panel provider" key={provider.id}>
          <div className="sectionHeader">
            <h3>{provider.name}</h3>
            <span className={`health ${provider.health.replace(" ", "-")}`}>{provider.health}</span>
          </div>
          <p>{provider.endpoint}</p>
          <div className="formGrid">
            <Field label="Model" value={provider.model} onChange={() => undefined} />
            <Field label="Temperature" value={String(provider.temperature)} onChange={() => undefined} />
            <Field label="Max tokens" value={String(provider.maxTokens)} onChange={() => undefined} />
            <Field label="Priority" value={String(provider.priority)} onChange={() => undefined} />
          </div>
          <label>
            API key
            <input type="password" value="Stored on backend only" readOnly />
          </label>
          <button className="primary ghost">
            <ShieldCheck size={16} /> Test Connection
          </button>
        </section>
      ))}
      <section className="panel wide">
        <h3>Webhook Settings</h3>
        <div className="webhookTable">
          {webhooks.map((hook) => (
            <div key={hook.id}>
              <strong>{hook.name}</strong>
              <span>{hook.event}</span>
              <span>{hook.retryPolicy}</span>
              <span className={`health ${hook.status}`}>{hook.status}</span>
            </div>
          ))}
        </div>
        <div className="chips">{webhookEvents.map((event) => <button key={event}>{event}</button>)}</div>
      </section>
    </div>
  );
}

function SettingsPanel({ glass, setGlass, theme, setTheme }: { glass: number; setGlass: (value: number) => void; theme: ThemeMode; setTheme: (value: ThemeMode) => void }) {
  return (
    <section className="panel settingsPanel">
      <h3>Workspace Settings</h3>
      <label>
        Search settings
        <input placeholder="Search profile, AI, theme, webhook, prompt defaults..." />
      </label>
      <label>
        Glass intensity
        <input type="range" min="36" max="92" value={glass} onChange={(event) => setGlass(Number(event.target.value))} />
      </label>
      <div className="toggleRow">
        <button className={theme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")}>
          <Moon size={15} /> Dark
        </button>
        <button className={theme === "light" ? "selected" : ""} onClick={() => setTheme("light")}>
          <SunMedium size={15} /> Light
        </button>
      </div>
      <div className="grid two">
        {["Profile settings", "Travel preferences", "AI preferences", "Prompt library", "Export settings", "Notifications", "Region / currency / timezone", "Session expiry behavior"].map((item) => (
          <div className="settingRow" key={item}>
            <Settings size={16} /> {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminPanel() {
  return (
    <div className="grid two">
      <Metric title="Role controls" value="3 roles" note="guest, signed-in user, admin" />
      <Metric title="Rate-limit awareness" value="Enabled" note="AI-heavy actions are backend-gated" />
      <Metric title="Secrets exposure" value="0 frontend keys" note="Provider credentials stay server-side" />
      <Metric title="Audit logs" value="Ready" note="Webhook, provider, session, and export events" />
    </div>
  );
}

function Profile({ user }: { user: UserAccount | null }) {
  return (
    <section className="panel">
      <h3>Account</h3>
      {user ? (
        <div className="profileForm">
          <Field label="Name" value={user.name} onChange={() => undefined} />
          <Field label="Email" value={user.email} onChange={() => undefined} />
          <Field label="Currency" value={user.currency} onChange={() => undefined} />
          <Field label="Timezone" value={user.timezone} onChange={() => undefined} />
        </div>
      ) : (
        <p>{guestMessage}</p>
      )}
    </section>
  );
}

function StatusPanel() {
  return (
    <section className="panel compact">
      <div className="sectionHeader">
        <h3>Provider Health</h3>
        <span>Live</span>
      </div>
      {aiProviders.slice(0, 4).map((provider) => (
        <div className="statusRow" key={provider.id}>
          <span>{provider.name}</span>
          <strong className={`health ${provider.health.replace(" ", "-")}`}>{provider.health}</strong>
          <small>{provider.latency}</small>
        </div>
      ))}
    </section>
  );
}

function DealsPanel({ onSave, savedIds }: { onSave: (id: string) => void; savedIds: string[] }) {
  const dealItems = recommendations.filter((item) => item.category === "deal" || item.category === "klook");
  return (
    <section className="panel compact">
      <div className="sectionHeader">
        <h3>Top Deal Findings</h3>
        <span>Demo links</span>
      </div>
      {dealItems.map((item) => (
        <button className="dealMini" key={item.id} onClick={() => onSave(item.id)}>
          <img src={islandPreview} alt="" />
          <span>{item.title}</span>
          <small>{savedIds.includes(item.id) ? "Saved" : item.link.status}</small>
        </button>
      ))}
    </section>
  );
}

function DatabasePanel() {
  return (
    <section className="panel compact">
      <div className="sectionHeader">
        <h3>Hosting Ready</h3>
        <Database size={17} />
      </div>
      <div className="statusRow">
        <span>Hostinger Node</span>
        <strong className="health healthy">ready</strong>
      </div>
      <div className="statusRow">
        <span>GitHub Actions</span>
        <strong className="health healthy">ready</strong>
      </div>
      <div className="statusRow">
        <span>Database schema</span>
        <strong className="health healthy">ready</strong>
      </div>
    </section>
  );
}

function AuthModal({
  view,
  setView,
  onClose,
  onSignIn
}: {
  view: "signin" | "signup" | "forgot" | "reset";
  setView: (view: "signin" | "signup" | "forgot" | "reset") => void;
  onClose: () => void;
  onSignIn: (role?: "user" | "admin") => void;
}) {
  const title = view === "signin" ? "Sign in" : view === "signup" ? "Create account" : view === "forgot" ? "Forgot password" : "Reset password";

  return (
    <div className="modalBackdrop" role="presentation">
      <section className="authModal glass" role="dialog" aria-modal="true" aria-label={title}>
        <button className="close" onClick={onClose}>
          <Eye size={16} />
        </button>
        <div className="brand compactBrand">
          <span className="brandMark">LA</span>
          <span>
            <strong>{title}</strong>
            <small>Protected AI travel workspace</small>
          </span>
        </div>
        <p>{guestMessage}</p>
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        {view !== "forgot" && (
          <label>
            Password
            <input type="password" placeholder="Minimum 8 characters" />
          </label>
        )}
        {view === "reset" && (
          <label>
            Reset code
            <input placeholder="Enter reset code" />
          </label>
        )}
        <button className="primary" onClick={() => onSignIn("user")}>
          <LogIn size={16} /> Continue
        </button>
        <button className="primary ghost" onClick={() => onSignIn("admin")}>
          <ShieldCheck size={16} /> Demo Admin Session
        </button>
        <div className="authLinks">
          <button onClick={() => setView("signin")}>Sign In</button>
          <button onClick={() => setView("signup")}>Sign Up</button>
          <button onClick={() => setView("forgot")}>Forgot Password</button>
          <button onClick={() => setView("reset")}>Reset</button>
        </div>
      </section>
    </div>
  );
}

export default App;
