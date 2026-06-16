import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  BedDouble,
  Bookmark,
  Bus,
  Check,
  ChevronRight,
  Copy,
  Download,
  FerrisWheel,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Palette,
  Plane,
  ShieldCheck,
  Search,
  Settings,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  SunMedium,
  Ticket,
  Utensils
} from "lucide-react";
import { allCategories, deals, destinations, savedItems } from "./data/mockData";
import { analyzePrompt, promptSuggestions } from "./utils/search";
import type {
  AIProviderSetting,
  Category,
  CouponDeal,
  Destination,
  SearchAnalysis,
  SharePayload,
  UserPreferences
} from "./types/travel";

type View = "Home" | "Explore" | "Destination" | "Saved" | "Share" | "Settings";
type DealFilter = "All deals" | "Klook only" | "Hotels" | "Activities" | "Transportation" | "Theme parks" | "Food and dining" | "Expiring soon" | "Highest discount" | "No minimum spend";
type SessionStatus = "guest" | "authenticated";

const initialPrompt = "Find beachfront resorts in Palawan with airport transfer and family rooms";
const authRequiredMessage = "You must log in or register to use the AI search feature. Please log in or create an account to continue.";
const categoryIcons: Record<Category, React.ComponentType<{ size?: number }>> = {
  Hotels: BedDouble,
  Accommodations: Bookmark,
  Transportation: Bus,
  "Theme parks": FerrisWheel,
  Markets: ShoppingBag,
  Foods: Utensils
};

const defaultPreferences: UserPreferences = {
  nightMode: true,
  glassMode: true,
  depthMode: true,
  animatedMode: true,
  fontFamily: "Inter",
  fontScale: 1,
  animationIntensity: 70,
  resultDensity: "standard",
  responseStyle: "Balanced",
  couponSearch: true,
  preferKlook: true,
  includeThirdParty: true,
  verifiedOnly: false,
  hideExpired: true,
  notifyBetterDeals: true
};

const defaultProviders: AIProviderSetting[] = [
  { provider: "OpenAI", apiKey: "", baseUrl: "", model: "gpt-4.1-mini", enabled: true, isDefault: true },
  { provider: "Claude", apiKey: "", baseUrl: "", model: "claude-3-5-sonnet", enabled: false, isDefault: false },
  { provider: "Perplexity", apiKey: "", baseUrl: "", model: "sonar-pro", enabled: false, isDefault: false },
  { provider: "Gemini", apiKey: "", baseUrl: "", model: "gemini-1.5-pro", enabled: false, isDefault: false },
  { provider: "Mistral", apiKey: "", baseUrl: "", model: "mistral-large", enabled: false, isDefault: false },
  { provider: "Groq", apiKey: "", baseUrl: "", model: "llama-3.3-70b-versatile", enabled: false, isDefault: false },
  { provider: "OpenRouter", apiKey: "", baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini", enabled: false, isDefault: false }
];

export default function App() {
  const [view, setView] = useState<View>("Home");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(["Hotels", "Transportation"]);
  const [analysis, setAnalysis] = useState<SearchAnalysis>(() => analyzePrompt(initialPrompt, ["Hotels", "Transportation"]));
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [providers, setProviders] = useState(defaultProviders);
  const [selectedDestination, setSelectedDestination] = useState<Destination>(analysis.destination);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState("Ready for a Philippines-only search.");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(() => getSessionStatus());
  const isAuthenticated = sessionStatus === "authenticated";

  const shellClass = [
    "app-shell",
    preferences.nightMode ? "theme-dark" : "theme-light",
    preferences.glassMode ? "mode-glass" : "",
    preferences.depthMode ? "mode-depth" : "",
    preferences.animatedMode ? "mode-animated" : "",
    `density-${preferences.resultDensity}`
  ].join(" ");

  const appStyle = {
    "--font-family": preferences.fontFamily,
    "--font-scale": preferences.fontScale,
    "--motion-scale": preferences.animationIntensity / 100
  } as React.CSSProperties;

  function runSearch(nextPrompt = prompt) {
    const currentSession = getSessionStatus();
    setSessionStatus(currentSession);
    if (currentSession !== "authenticated") {
      setToast(authRequiredMessage);
      setView("Home");
      return;
    }

    setToast("Analyzing destination, style, categories, and matching deals...");
    startTransition(() => {
      window.setTimeout(() => {
        const next = analyzePrompt(nextPrompt, selectedCategories);
        setAnalysis(next);
        setSelectedDestination(next.destination);
        setPrompt(nextPrompt);
        setView("Explore");
        setToast(`Structured results ready for ${next.destination.name}.`);
      }, 650);
    });
  }

  function toggleCategory(category: Category) {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

  function copyDeal(deal: CouponDeal) {
    const value = deal.code ?? "AUTO-APPLIED";
    void navigator.clipboard?.writeText(value);
    setToast(`${value} copied.`);
  }

  function authenticate(mode: "login" | "register") {
    window.localStorage.setItem(
      "luzonloop-session",
      JSON.stringify({ status: "authenticated", mode, updatedAt: new Date().toISOString() })
    );
    setSessionStatus("authenticated");
    setToast(mode === "login" ? "Logged in. AI search is available." : "Account created. AI search is available.");
  }

  function signOut() {
    window.localStorage.removeItem("luzonloop-session");
    setSessionStatus("guest");
    setToast(authRequiredMessage);
    setView("Home");
  }

  return (
    <div className={shellClass} style={appStyle}>
      <AppNav active={view} onChange={setView} />
      <main className="main-stage">
        <TopBar
          toast={toast}
          isAuthenticated={isAuthenticated}
          onLogin={() => authenticate("login")}
          onRegister={() => authenticate("register")}
          onSignOut={signOut}
          onSettings={() => setView("Settings")}
        />
        {view === "Home" && (
          <HomeView
            prompt={prompt}
            setPrompt={setPrompt}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            onSearch={runSearch}
            isPending={isPending}
            isAuthenticated={isAuthenticated}
            authMessage={authRequiredMessage}
            onLogin={() => authenticate("login")}
            onRegister={() => authenticate("register")}
            onDestination={(destination) => {
              setSelectedDestination(destination);
              setView("Destination");
            }}
          />
        )}
        {view === "Explore" && (
          <ResultsView
            analysis={analysis}
            isPending={isPending}
            onSave={() => setToast("Saved to your trip shelf.")}
            onShare={() => setView("Share")}
            onCopyDeal={copyDeal}
          />
        )}
        {view === "Destination" && <DestinationDetail destination={selectedDestination} analysis={analysis} onCopyDeal={copyDeal} />}
        {view === "Saved" && <SavedView />}
        {view === "Share" && <ShareView analysis={analysis} onToast={setToast} />}
        {view === "Settings" && (
          <SettingsView
            preferences={preferences}
            setPreferences={setPreferences}
            providers={providers}
            setProviders={setProviders}
            onToast={setToast}
          />
        )}
      </main>
    </div>
  );
}

function getSessionStatus(): SessionStatus {
  try {
    const session = window.localStorage.getItem("luzonloop-session");
    if (!session) return "guest";
    const parsed = JSON.parse(session) as { status?: string };
    return parsed.status === "authenticated" ? "authenticated" : "guest";
  } catch {
    return "guest";
  }
}

function AppNav({ active, onChange }: { active: View; onChange: (view: View) => void }) {
  const items: { view: View; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { view: "Home", icon: Search, label: "Home" },
    { view: "Explore", icon: Sparkles, label: "Explore" },
    { view: "Destination", icon: MapPin, label: "Destination" },
    { view: "Saved", icon: Bookmark, label: "Saved" },
    { view: "Share", icon: Share2, label: "Share" },
    { view: "Settings", icon: Settings, label: "Settings" }
  ];

  return (
    <aside className="app-nav">
      <button className="brand" onClick={() => onChange("Home")} aria-label="LuzonLoop home">
        <span className="brand-mark">L</span>
        <span>LuzonLoop</span>
      </button>
      <nav>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.view} className={active === item.view ? "nav-item active" : "nav-item"} onClick={() => onChange(item.view)}>
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="nav-rail-card">
        <Plane size={20} />
        <strong>PH only</strong>
        <span>Every result is constrained to Philippine routes, stays, food, and deals.</span>
      </div>
    </aside>
  );
}

function TopBar({
  toast,
  isAuthenticated,
  onLogin,
  onRegister,
  onSignOut,
  onSettings
}: {
  toast: string;
  isAuthenticated: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onSignOut: () => void;
  onSettings: () => void;
}) {
  return (
    <header className="topbar">
      <div>
        <p className="status-line">{toast}</p>
        <h1>Ask for a Philippines trip</h1>
      </div>
      <div className="topbar-actions">
        {isAuthenticated ? (
          <button className="session-button authenticated" onClick={onSignOut}>
            <ShieldCheck size={17} />
            Logged in
          </button>
        ) : (
          <>
            <button className="session-button" onClick={onLogin}>Log in</button>
            <button className="session-button" onClick={onRegister}>Register</button>
          </>
        )}
        <button className="icon-button" aria-label="Open settings" onClick={onSettings}>
          <Palette size={19} />
        </button>
        <button className="primary-small" onClick={onSettings}>
          <Settings size={17} />
          BYO AI
        </button>
      </div>
    </header>
  );
}

function HomeView(props: {
  prompt: string;
  setPrompt: (value: string) => void;
  selectedCategories: Category[];
  toggleCategory: (category: Category) => void;
  onSearch: (prompt?: string) => void;
  isPending: boolean;
  isAuthenticated: boolean;
  authMessage: string;
  onLogin: () => void;
  onRegister: () => void;
  onDestination: (destination: Destination) => void;
}) {
  return (
    <div className="home-grid">
      <motion.section className="hero-search-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div className="hero-copy">
          <h2>Plan smarter across hotels, ferries, markets, theme parks, food, and deals.</h2>
          <p>Type a natural-language travel request and LuzonLoop turns it into structured Philippine travel modules.</p>
        </div>
        {!props.isAuthenticated && (
          <AuthGate message={props.authMessage} onLogin={props.onLogin} onRegister={props.onRegister} />
        )}
        <HeroSearch {...props} />
        <PromptSuggestionChips onPick={(value) => props.onSearch(value)} />
        <CategoryChips selected={props.selectedCategories} onToggle={props.toggleCategory} />
      </motion.section>
      <section className="side-stack">
        <VideoPanel />
        <TrendingDestinations onSelect={props.onDestination} />
      </section>
    </div>
  );
}

function AuthGate({ message, onLogin, onRegister }: { message: string; onLogin: () => void; onRegister: () => void }) {
  return (
    <section className="auth-gate" aria-live="polite">
      <ShieldCheck size={22} />
      <p>{message}</p>
      <div>
        <button type="button" onClick={onLogin}>Log in</button>
        <button type="button" onClick={onRegister}>Create account</button>
      </div>
    </section>
  );
}

function HeroSearch({
  prompt,
  setPrompt,
  onSearch,
  isPending
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  selectedCategories: Category[];
  toggleCategory: (category: Category) => void;
  onSearch: (prompt?: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="search-box">
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Try: 3-day Baguio trip with cheap hotels, street food, night market, and bus options"
      />
      <div className="search-footer">
        <span className="animated-placeholder">Analyzes destination, category, style, budget, duration, and coupons.</span>
        <button className="search-action" onClick={() => onSearch()} disabled={isPending || prompt.trim().length < 3}>
          {isPending ? <span className="spinner" /> : <Search size={20} />}
          Search
        </button>
      </div>
    </div>
  );
}

function PromptSuggestionChips({ onPick }: { onPick: (value: string) => void }) {
  return (
    <div className="chip-row">
      {promptSuggestions.map((suggestion) => (
        <button key={suggestion} className="suggestion-chip" onClick={() => onPick(suggestion)}>
          {suggestion}
        </button>
      ))}
    </div>
  );
}

function CategoryChips({ selected, onToggle }: { selected: Category[]; onToggle: (category: Category) => void }) {
  return (
    <div className="category-grid">
      {allCategories.map((category) => {
        const Icon = categoryIcons[category];
        return (
          <button key={category} className={selected.includes(category) ? "category-chip active" : "category-chip"} onClick={() => onToggle(category)}>
            <Icon size={18} />
            {category}
          </button>
        );
      })}
    </div>
  );
}

function VideoPanel() {
  return (
    <section className="media-panel">
      <div className="media-frame">
        <img src="https://images.unsplash.com/photo-1578922746465-3a80a228f223?auto=format&fit=crop&w=900&q=80" alt="Philippine island coastline" />
        <button className="play-button" aria-label="Play travel media">
          <ChevronRight size={26} />
        </button>
      </div>
      <div>
        <h3>Featured travel media</h3>
        <p>Island hops, city food walks, cool mountain routes, and family park days.</p>
      </div>
    </section>
  );
}

function TrendingDestinations({ onSelect }: { onSelect: (destination: Destination) => void }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h3>Trending Philippine destinations</h3>
        <span>Live mock inventory</span>
      </div>
      <div className="destination-list">
        {destinations.map((destination) => (
          <button key={destination.id} className="destination-row" onClick={() => onSelect(destination)}>
            <img src={destination.heroImage} alt={destination.name} />
            <span>
              <strong>{destination.name}</strong>
              <small>{destination.bestFor.join(" / ")}</small>
            </span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </section>
  );
}

function ResultsView({
  analysis,
  isPending,
  onSave,
  onShare,
  onCopyDeal
}: {
  analysis: SearchAnalysis;
  isPending: boolean;
  onSave: () => void;
  onShare: () => void;
  onCopyDeal: (deal: CouponDeal) => void;
}) {
  if (isPending) return <SkeletonLoader />;

  return (
    <SearchResultsLayout>
      <AISummaryPanel analysis={analysis} onSave={onSave} onShare={onShare} />
      <div className="results-columns">
        <div className="results-main">
          <ResultSection title="Hotels / accommodations" icon={BedDouble}>
            {[...analysis.hotels, ...analysis.accommodations].map((item) => (
              <TravelCard key={item.id} title={item.name} meta={`${item.area} · ${item.priceRange}`} tags={item.tags} detail={"amenities" in item ? item.amenities.join(", ") : ""} />
            ))}
          </ResultSection>
          <ResultSection title="Transportation" icon={Bus}>
            {analysis.transport.map((item) => (
              <TravelCard key={item.id} title={item.route} meta={`${item.mode} · ${item.estimate}`} tags={item.tags} detail={item.notes} />
            ))}
          </ResultSection>
          <ResultSection title="Theme parks / attractions" icon={FerrisWheel}>
            {[...analysis.themeParks, ...analysis.attractions].map((item) => (
              <TravelCard key={item.id} title={item.name} meta={`${item.type} · ${item.priceRange}`} tags={item.tags} detail={"familyRating" in item ? `Family rating ${item.familyRating}/5` : "Recommended for this route."} />
            ))}
          </ResultSection>
          <div className="split-sections">
            <ResultSection title="Markets" icon={ShoppingBag}>
              {analysis.markets.map((item) => (
                <TravelCard key={item.id} title={item.name} meta={item.hours} tags={item.tags} detail={item.specialty} />
              ))}
            </ResultSection>
            <ResultSection title="Foods / local specialties" icon={Utensils}>
              {analysis.foods.map((item) => (
                <TravelCard key={item.id} title={item.name} meta={item.priceRange} tags={item.tags} detail={item.specialty} />
              ))}
            </ResultSection>
          </div>
        </div>
        <aside className="results-side">
          <BudgetWidget estimate={analysis.budgetEstimate} budget={analysis.budget} />
          <ItineraryTimeline analysis={analysis} />
          <DealsSection deals={analysis.deals} onCopy={onCopyDeal} />
        </aside>
      </div>
    </SearchResultsLayout>
  );
}

function SearchResultsLayout({ children }: { children: React.ReactNode }) {
  return <motion.div className="results-layout" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>;
}

function AISummaryPanel({ analysis, onSave, onShare }: { analysis: SearchAnalysis; onSave: () => void; onShare: () => void }) {
  return (
    <section className="summary-panel">
      <div>
        <p className="status-line">Recommended area / destination</p>
        <h2>{analysis.destination.name}, {analysis.destination.region}</h2>
        <p>{analysis.summary}</p>
        <div className="tag-row">
          {analysis.styleTags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
      <div className="summary-actions">
        <button onClick={onSave}><Bookmark size={17} />Save</button>
        <button onClick={onShare}><Share2 size={17} />Share</button>
      </div>
    </section>
  );
}

function ResultSection({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number }>; children: React.ReactNode }) {
  return (
    <section className="result-section">
      <div className="section-heading">
        <h3><Icon size={19} />{title}</h3>
      </div>
      <div className="card-list">{children}</div>
    </section>
  );
}

function TravelCard({ title, meta, detail, tags }: { title: string; meta: string; detail: string; tags: string[] }) {
  return (
    <article className="travel-card">
      <div>
        <h4>{title}</h4>
        <p>{meta}</p>
        <small>{detail}</small>
      </div>
      <div className="mini-tags">{tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}

function BudgetWidget({ estimate, budget }: { estimate: string; budget: string }) {
  return (
    <section className="panel budget-widget">
      <div className="section-heading"><h3>Budget estimate</h3><span>{budget}</span></div>
      <strong>{estimate}</strong>
      <p>Includes stays, local transport, food, and one paid activity. Flights vary by date.</p>
    </section>
  );
}

function ItineraryTimeline({ analysis }: { analysis: SearchAnalysis }) {
  return (
    <section className="panel">
      <div className="section-heading"><h3>Suggested itinerary</h3><span>{analysis.duration}</span></div>
      <ol className="timeline">
        {analysis.itinerary.map((item) => (
          <li key={`${item.day}-${item.title}`}>
            <span>Day {item.day}</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <small>{item.estimate}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DealsSection({ deals: visibleDeals, onCopy }: { deals: CouponDeal[]; onCopy: (deal: CouponDeal) => void }) {
  const [filter, setFilter] = useState<DealFilter>("Klook only");
  const filters: DealFilter[] = ["Klook only", "All deals", "Hotels", "Activities", "Transportation", "Theme parks", "Food and dining", "Expiring soon", "Highest discount", "No minimum spend"];
  const filtered = visibleDeals.filter((deal) => {
    if (filter === "All deals") return true;
    if (filter === "Klook only") return deal.source === "Klook";
    if (filter === "Expiring soon") return deal.expiry < "2026-09-01";
    if (filter === "Highest discount") return deal.discount.includes("%") || deal.discount.includes("18");
    if (filter === "No minimum spend") return deal.minimumSpend === "No minimum";
    return deal.category === filter;
  });

  return (
    <section className="panel deals-panel">
      <div className="section-heading"><h3>Related Deals & Coupons</h3><span>Klook-first</span></div>
      <select value={filter} onChange={(event) => setFilter(event.target.value as DealFilter)}>
        {filters.map((item) => <option key={item}>{item}</option>)}
      </select>
      {filtered.length === 0 ? <EmptyState title="No matching deals" detail="Relax the filters or include third-party sources in settings." /> : filtered.map((deal) => <CouponCard key={deal.id} deal={deal} onCopy={() => onCopy(deal)} />)}
    </section>
  );
}

function CouponCard({ deal, onCopy }: { deal: CouponDeal; onCopy: () => void }) {
  return (
    <article className="coupon-card">
      <div className="coupon-top">
        <span><Ticket size={15} />{deal.source}</span>
        <b>{deal.verified ? "Verified" : "Unverified"}</b>
      </div>
      <h4>{deal.title}</h4>
      <p>{deal.discount} · {deal.minimumSpend}</p>
      <small>{deal.eligibility}. Expires {deal.expiry}. {deal.termsPreview}</small>
      <div className="coupon-actions">
        <button onClick={onCopy}><Copy size={15} />{deal.code ?? "Auto-applied"}</button>
        <button><ChevronRight size={15} />Open</button>
      </div>
      <em>{deal.howToUse}</em>
    </article>
  );
}

function DestinationDetail({ destination, analysis, onCopyDeal }: { destination: Destination; analysis: SearchAnalysis; onCopyDeal: (deal: CouponDeal) => void }) {
  return (
    <div className="detail-page">
      <section className="destination-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,8,14,.84), rgba(4,8,14,.18)), url(${destination.heroImage})` }}>
        <div>
          <h2>{destination.name}</h2>
          <p>{destination.summary}</p>
          <div className="tag-row">{destination.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </section>
      <div className="results-columns">
        <div className="results-main">
          <ResultSection title="Overview" icon={MapPin}>
            <TravelCard title="Best for" meta={destination.region} tags={destination.tags} detail={destination.bestFor.join(", ")} />
          </ResultSection>
          <ResultSection title="Travel tips" icon={Star}>
            {analysis.tips.map((tip) => <TravelCard key={tip} title={tip} meta="Philippines-only guidance" tags={["Best value"]} detail="Verify schedules and weather for the final booking date." />)}
          </ResultSection>
        </div>
        <aside className="results-side">
          <DealsSection deals={deals} onCopy={onCopyDeal} />
        </aside>
      </div>
    </div>
  );
}

function SavedView() {
  return (
    <section className="panel page-panel">
      <div className="section-heading"><h2>Saved</h2><span>Searches, destinations, stays, foods, transport, deals</span></div>
      <div className="saved-grid">
        {savedItems.map((item) => <SavedItemCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}

function SavedItemCard({ item }: { item: { title: string; detail: string; kind: string; tags: string[] } }) {
  return (
    <article className="saved-card">
      <span>{item.kind}</span>
      <h3>{item.title}</h3>
      <p>{item.detail}</p>
      <div className="mini-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}

function ShareView({ analysis, onToast }: { analysis: SearchAnalysis; onToast: (value: string) => void }) {
  const [payload, setPayload] = useState<SharePayload>({
    email: "",
    subject: `${analysis.destination.name} travel plan`,
    intro: "Here is the LuzonLoop summary I generated.",
    channel: "Email",
    sections: ["Summary", "Hotels", "Transportation", "Deals"],
    mode: "summary"
  });

  function update<K extends keyof SharePayload>(key: K, value: SharePayload[K]) {
    setPayload((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="share-grid">
      <div className="panel share-form">
        <div className="section-heading"><h2>Share / Forward</h2><span>Selected-section sharing</span></div>
        <label>Email<input value={payload.email} onChange={(event) => update("email", event.target.value)} placeholder="traveler@example.com" /></label>
        <label>Subject<input value={payload.subject} onChange={(event) => update("subject", event.target.value)} /></label>
        <label>Intro<textarea value={payload.intro} onChange={(event) => update("intro", event.target.value)} /></label>
        <div className="segmented">
          {(["summary", "full", "selected"] as const).map((mode) => <button key={mode} className={payload.mode === mode ? "active" : ""} onClick={() => update("mode", mode)}>{mode}</button>)}
        </div>
        <div className="share-actions">
          <button onClick={() => onToast("Email summary queued in placeholder flow.")}><Mail size={17} />Email</button>
          <button onClick={() => onToast("Messenger-style forward prepared.")}><MessageCircle size={17} />Messenger</button>
          <button onClick={() => onToast("Share copy placed on clipboard.")}><Copy size={17} />Copy</button>
          <button onClick={() => onToast("Export placeholder generated.")}><Download size={17} />Export</button>
        </div>
      </div>
      <div className="share-card">
        <h3>{analysis.destination.name} trip card</h3>
        <p>{analysis.summary}</p>
        <strong>{analysis.budgetEstimate}</strong>
        <div className="mini-tags">{payload.sections.map((section) => <span key={section}>{section}</span>)}</div>
      </div>
    </section>
  );
}

function SettingsView({
  preferences,
  setPreferences,
  providers,
  setProviders,
  onToast
}: {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  providers: AIProviderSetting[];
  setProviders: React.Dispatch<React.SetStateAction<AIProviderSetting[]>>;
  onToast: (value: string) => void;
}) {
  const fonts = ["Inter", "Satoshi", "Manrope", "DM Sans", "Poppins", "Outfit", "Montserrat"];
  const [providerStatus, setProviderStatus] = useState<Record<string, string>>({});

  function updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function updateProvider(index: number, updates: Partial<AIProviderSetting>) {
    setProviders((current) => current.map((provider, itemIndex) => (itemIndex === index ? { ...provider, ...updates } : provider)));
  }

  function flashStatus(provider: string, message: string) {
    setProviderStatus((current) => ({ ...current, [provider]: message }));
    onToast(message);
  }

  return (
    <div className="settings-grid">
      <section className="panel">
        <div className="section-heading"><h2>Theme / personalization</h2><span>Applied globally</span></div>
        <div className="toggle-grid">
          <Toggle label="Night mode" value={preferences.nightMode} onChange={(value) => updatePreference("nightMode", value)} icon={Moon} />
          <Toggle label="Glassmorphism" value={preferences.glassMode} onChange={(value) => updatePreference("glassMode", value)} icon={Sparkles} />
          <Toggle label="3D-inspired mode" value={preferences.depthMode} onChange={(value) => updatePreference("depthMode", value)} icon={SunMedium} />
          <Toggle label="Animated mode" value={preferences.animatedMode} onChange={(value) => updatePreference("animatedMode", value)} icon={Star} />
        </div>
        <div className="control-grid">
          <label>Font family<select value={preferences.fontFamily} onChange={(event) => updatePreference("fontFamily", event.target.value)}>{fonts.map((font) => <option key={font}>{font}</option>)}</select></label>
          <label>Result density<select value={preferences.resultDensity} onChange={(event) => updatePreference("resultDensity", event.target.value as UserPreferences["resultDensity"])}><option>compact</option><option>standard</option><option>immersive</option></select></label>
          <label>Response style<select value={preferences.responseStyle} onChange={(event) => updatePreference("responseStyle", event.target.value as UserPreferences["responseStyle"])}><option>Concise</option><option>Balanced</option><option>Detailed</option></select></label>
          <label>Font scale<input type="range" min="0.9" max="1.15" step="0.01" value={preferences.fontScale} onChange={(event) => updatePreference("fontScale", Number(event.target.value))} /></label>
          <label>Animation intensity<input type="range" min="0" max="100" value={preferences.animationIntensity} onChange={(event) => updatePreference("animationIntensity", Number(event.target.value))} /></label>
        </div>
      </section>
      <section className="panel">
        <div className="section-heading"><h2>Coupon preferences</h2><span>Klook-first support</span></div>
        <div className="toggle-grid">
          <Toggle label="Enable coupon search" value={preferences.couponSearch} onChange={(value) => updatePreference("couponSearch", value)} icon={Ticket} />
          <Toggle label="Prefer Klook deals first" value={preferences.preferKlook} onChange={(value) => updatePreference("preferKlook", value)} icon={Check} />
          <Toggle label="Include third-party sources" value={preferences.includeThirdParty} onChange={(value) => updatePreference("includeThirdParty", value)} icon={ShoppingBag} />
          <Toggle label="Show only verified offers" value={preferences.verifiedOnly} onChange={(value) => updatePreference("verifiedOnly", value)} icon={Star} />
          <Toggle label="Hide expired deals" value={preferences.hideExpired} onChange={(value) => updatePreference("hideExpired", value)} icon={Ticket} />
          <Toggle label="Notify on better matching deals" value={preferences.notifyBetterDeals} onChange={(value) => updatePreference("notifyBetterDeals", value)} icon={Sparkles} />
        </div>
      </section>
      <section className="panel providers-panel">
        <div className="section-heading"><h2>BYO AI API providers</h2><span>UI-only mock test until server proxy is added</span></div>
        {providers.map((provider, index) => (
          <AIProviderForm
            key={provider.provider}
            provider={provider}
            status={providerStatus[provider.provider]}
            onUpdate={(updates) => updateProvider(index, updates)}
            onDefault={() => {
              setProviders((current) => current.map((item) => ({ ...item, isDefault: item.provider === provider.provider })));
              flashStatus(provider.provider, `${provider.provider} is now the default provider.`);
            }}
            onSave={() => {
              updateProvider(index, { enabled: true });
              flashStatus(provider.provider, `${provider.provider} settings saved locally.`);
            }}
            onTest={() => flashStatus(provider.provider, `${provider.provider} mock connection checked. Add a server proxy before using real secrets.`)}
          />
        ))}
      </section>
    </div>
  );
}

function Toggle({ label, value, onChange, icon: Icon }: { label: string; value: boolean; onChange: (value: boolean) => void; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <button type="button" className={value ? "toggle active" : "toggle"} onClick={() => onChange(!value)} aria-pressed={value}>
      <Icon size={17} />
      <span>{label}</span>
      <b>{value ? "On" : "Off"}</b>
    </button>
  );
}

function AIProviderForm({
  provider,
  status,
  onUpdate,
  onDefault,
  onSave,
  onTest
}: {
  provider: AIProviderSetting;
  status?: string;
  onUpdate: (updates: Partial<AIProviderSetting>) => void;
  onDefault: () => void;
  onSave: () => void;
  onTest: () => void;
}) {
  return (
    <article className="provider-row">
      <div className="provider-title">
        <strong>{provider.provider}</strong>
        <button className={provider.enabled ? "tiny-switch active" : "tiny-switch"} onClick={() => onUpdate({ enabled: !provider.enabled })}>{provider.enabled ? "Enabled" : "Disabled"}</button>
      </div>
      <input type="password" value={provider.apiKey} placeholder="API key stored locally for this mock UI" onChange={(event) => onUpdate({ apiKey: event.target.value })} />
      <input value={provider.baseUrl ?? ""} placeholder="Optional base URL" onChange={(event) => onUpdate({ baseUrl: event.target.value })} />
      <input value={provider.model} placeholder="Model" onChange={(event) => onUpdate({ model: event.target.value })} />
      <div className="provider-actions">
        <button type="button" onClick={onTest}>Test</button>
        <button type="button" onClick={onSave}>Save</button>
        <button type="button" className={provider.isDefault ? "active" : ""} onClick={onDefault}>{provider.isDefault ? "Default" : "Set default"}</button>
      </div>
      <p className="provider-status">{status ?? (provider.isDefault ? "Default provider" : "Ready")}</p>
    </article>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <Sparkles size={22} />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 7 }).map((_, index) => <div className="skeleton" key={index} />)}
    </div>
  );
}
