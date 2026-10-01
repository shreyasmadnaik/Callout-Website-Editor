import { useEffect, useState, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, BadgeInfo, BookOpen, Building2, Check, ChevronRight, Copy, Flame, HeartPulse, Info, LocateFixed, MapPin, Phone, Share2, Shield, ShieldAlert, Siren, Pill, Navigation, LockKeyhole } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();
const categories = [
  { name: 'Medical', key: 'medical', icon: HeartPulse, detail: 'Hospitals and medical care' },
  { name: 'Police', key: 'police', icon: Shield, detail: 'Police services nearby' },
  { name: 'Fire', key: 'fire', icon: Flame, detail: 'Fire and rescue services' },
  { name: 'Pharmacy', key: 'pharmacy', icon: Pill, detail: 'Pharmacies nearby' },
];
const navigation = [
  { href: '/', label: 'Home', icon: Shield },
  { href: '/nearby', label: 'Nearby', icon: MapPin },
  { href: '/what-to-do', label: 'Guide', icon: BookOpen },
  { href: '/card', label: 'Card', icon: Siren },
  { href: '/awareness', label: 'Awareness', icon: BadgeInfo },
  { href: '/about', label: 'About', icon: Info },
];
const steps = [
  ['Stay calm and check for immediate danger', 'Take a breath and look for hazards before approaching. Keep yourself and others out of danger.'],
  ['Call 112 for emergency help', 'Call the national emergency number when someone needs urgent police, fire or medical assistance.'],
  ['Tell the operator what happened', 'Explain the situation clearly. Speak slowly and answer the questions you are asked.'],
  ['Give your exact location', 'Share your address, nearby landmark or other location details so responders can find you.'],
  ['Follow the operator’s instructions', 'Listen carefully and stay on the line. Do not end the call until the operator says it is okay.'],
  ['Help only if it is safe to do so', 'Do not put yourself or another person at further risk. Avoid moving an injured person unless there is immediate danger.'],
  ['Keep the area clear for responders', 'Ask bystanders to make space and watch for arriving emergency services.'],
];

function EmergencyCall({ compact = false }: { compact?: boolean }) {
  return <a className={`call-primary ${compact ? 'min-h-[56px]' : ''}`} href="tel:112" aria-label="Call emergency number 112" data-testid="link-call-112">
    <Phone size={compact ? 18 : 21} strokeWidth={2.5} /><span>CALL 112</span>{!compact && <span className="hidden sm:inline text-[10px] font-semibold tracking-[.2em] opacity-80">NATIONAL EMERGENCY NUMBER</span>}
  </a>;
}

function Brand() {
  return <Link href="/" className="flex items-center gap-3 no-underline" aria-label="Sakhi Suraksha home" data-testid="link-brand-home">
    <span className="brand-mark"><ShieldAlert size={21} strokeWidth={2.1} /></span>
    <span><span className="brand-word block">SAKHI SURAKSHA</span><span className="brand-tag block">KNOW. LOCATE. ACT.</span></span>
  </Link>;
}

function SiteShell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  return <div className="app-shell">
    <header className="site-header"><Brand /></header>
    {children}
    <nav className="bottom-nav" aria-label="Main navigation"><div className="bottom-nav-inner">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? path === '/' : path === href || (href === '/nearby' && path.startsWith('/nearby'));
        return <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`} aria-current={active ? 'page' : undefined}>
          <Icon size={17} strokeWidth={active ? 2.3 : 1.8} /><span>{label}</span>
        </Link>;
      })}
    </div></nav>
  </div>;
}

function CategoryGrid() {
  return <div className="grid grid-cols-2 gap-3">
    {categories.map(({ name, key, icon: Icon }) => <Link key={key} href={`/nearby?category=${key}`} className="category-tile no-underline" data-testid={`link-category-${key}`}>
      <Icon size={22} strokeWidth={1.8} className="text-[#9B7CF6]" /><span className="font-semibold text-sm">{name}</span>
    </Link>)}
  </div>;
}

function LocationPanel({ inline = false }: { inline?: boolean }) {
  const [status, setStatus] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const category = new URLSearchParams(window.location.search).get('category') || '';
  const selected = categories.find((item) => item.key === category);
  const getHelp = () => {
    if (!navigator.geolocation) { setStatus('Location is not available in this browser.'); return; }
    setLoading(true); setStatus('Requesting your location…'); setMapsUrl('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const query = selected ? `${selected.name} near me` : 'emergency services near me';
        const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.latitude},${coords.longitude},14z`;
        setMapsUrl(url); setLoading(false); setStatus('Your location is ready. Open Maps to view nearby places.');
      },
      () => { setLoading(false); setStatus('Location could not be accessed. Check your browser permissions and try again.'); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };
  return <section className={`panel p-5 sm:p-6 ${inline ? '' : 'mt-5'}`} aria-labelledby="find-help-heading">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E9E4FF] text-[#9B7CF6]"><MapPin size={19} /></span>
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-[15px] text-[#111827]" id="find-help-heading">{selected ? `Find ${selected.name} Near Me` : 'Find Help Near Me'}</h2>
        <p className="body-copy mt-1 text-xs">Find nearby emergency facilities and available contact information.</p>
      </div>
    </div>
    {selected && <p className="mt-4 text-xs text-[#6B7280]">{selected.detail}</p>}
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button className="outline-action !border-0 !bg-gradient-to-r !from-[#A47CF5] !to-[#6685F5] !px-4 !py-2.5 text-xs font-semibold !text-white" onClick={getHelp} disabled={loading} data-testid="button-use-location">
        <LocateFixed size={15} />{loading ? 'Finding location…' : 'Use my location'}
      </button>
      {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="outline-action !py-2.5 text-xs" data-testid="link-open-maps"><Navigation size={15} />Open in Google Maps<ArrowRight size={14} /></a>}
    </div>
    {status && <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#6B7280]" role="status" data-testid="status-location"><Info size={14} className="mt-0.5 shrink-0 text-[#9B7CF6]" />{status}</p>}
  </section>;
}

function HomePage() {
  return <main className="main-content home-content">
    <div className="mb-5 flex items-center justify-between"><div><div className="eyebrow">Help, when it matters</div><p className="mt-2 text-sm text-[#6B7280]">Clear steps. Nearby support. One number.</p></div><span className="hidden sm:grid h-12 w-12 place-items-center rounded-2xl border border-[#E5E5EF] bg-white text-[#9B7CF6]"><Shield size={22}/></span></div>
    <EmergencyCall />
    <LocationPanel inline />
    <div className="section-label">CATEGORIES</div>
    <CategoryGrid />
    <div className="section-label">QUICK ACTIONS</div>
    <div className="grid gap-2.5">
      <Link href="/nearby" className="quick-link no-underline" data-testid="link-quick-find"><MapPin size={17} className="text-[#9B7CF6]"/><span className="flex-1 text-sm font-medium">Find Help Near Me</span><ChevronRight size={16} className="text-[#6B7280]"/></Link>
      <a href="tel:112" className="quick-link no-underline" data-testid="link-quick-call"><Phone size={17} className="text-[#9B7CF6]"/><span className="flex-1 text-sm font-medium">Call 112</span><ChevronRight size={16} className="text-[#6B7280]"/></a>
      <Link href="/what-to-do" className="quick-link no-underline" data-testid="link-quick-guide"><HeartPulse size={17} className="text-[#9B7CF6]"/><span className="flex-1 text-sm font-medium">What To Do</span><ChevronRight size={16} className="text-[#6B7280]"/></Link>
      <Link href="/awareness" className="quick-link no-underline" data-testid="link-quick-awareness"><BookOpen size={17} className="text-[#9B7CF6]"/><span className="flex-1 text-sm font-medium">Emergency Awareness</span><ChevronRight size={16} className="text-[#6B7280]"/></Link>
    </div>
    <p className="mx-auto mt-5 max-w-lg text-center text-[11px] leading-relaxed text-[#6B7280]" data-testid="text-facility-note">Facility data comes from Google Maps Places. We never invent phone numbers.</p>
  </main>;
}

function NearbyPage() {
  return <main className="main-content">
    <p className="eyebrow mb-3">LOCATE SUPPORT</p><h1 className="page-heading">Nearby help</h1>
    <p className="body-copy mt-3 max-w-xl">Choose a service and use your location to search Google Maps for nearby facilities.</p>
    <div className="section-label">CHOOSE A CATEGORY</div><CategoryGrid />
    <LocationPanel />
    <p className="mt-4 flex gap-2 text-xs leading-relaxed text-[#6B7280]"><AlertCircle size={15} className="mt-0.5 shrink-0"/>Nearby facility information is provided by Google Maps Places. Sakhi Suraksha does not display fabricated results or phone numbers.</p>
  </main>;
}

function GuidePage() {
  return <main className="main-content">
    <p className="eyebrow mb-3">PRACTICAL GUIDANCE</p><h1 className="page-heading">What To Do</h1>
    <p className="body-copy mt-3 max-w-xl">In an emergency, take these steps and call for help.</p>
    <div className="my-6"><EmergencyCall compact /></div>
    <div className="grid gap-3">
      {steps.map(([title, description], index) => <article className="panel flex gap-4 p-4 sm:p-5" key={title} data-testid={`card-emergency-step-${index + 1}`}>
        <span className="step-number">{index + 1}</span><div><h2 className="font-bold text-sm text-[#111827]">{title}</h2><p className="body-copy mt-1.5 text-sm">{description}</p></div>
      </article>)}
    </div>
    <p className="body-copy mt-5 text-xs">If you are in immediate danger, move to a safer place if possible and call 112.</p>
  </main>;
}

function AwarenessPage() {
  return <main className="main-content">
    <p className="eyebrow mb-3">KNOW. LOCATE. ACT.</p><h1 className="page-heading">Emergency awareness</h1>
    <section className="panel mt-6 p-5 sm:p-7">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E9E4FF] text-[#9B7CF6]"><Building2 size={23}/></span>
      <h2 className="mt-5 font-bold text-xl text-[#111827]">Community Engagement Project</h2>
      <p className="body-copy mt-3">Sakhi Suraksha is part of a Community Engagement Project focused on emergency awareness. It brings together practical emergency guidance, access to nearby services and information about the national emergency number.</p>
      <p className="body-copy mt-3">Knowing what to do and how to seek help can make a difference during an emergency. Explore the guidance and share it with your community.</p>
    </section>
    <section className="panel mt-4 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div><p className="eyebrow">NATIONAL EMERGENCY NUMBER</p><p className="mt-2 font-semibold text-5xl tracking-tight text-[#6685F5]">112</p><p className="body-copy mt-2 text-sm">Call 112 for emergency assistance.</p></div>
      <a className="outline-action !border-[#E5E5EF] !bg-[#E9E4FF] !text-[#6685F5]" href="tel:112" data-testid="link-awareness-call"><Phone size={17}/>Call 112</a>
    </section>
  </main>;
}

function CardPage() {
  const [feedback, setFeedback] = useState('');
  const share = async () => {
    const shareData = { title: 'Sakhi Suraksha — Emergency Card', text: 'Sakhi Suraksha • National emergency number 112 • KNOW. LOCATE. ACT.', url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(shareData); setFeedback('Card shared.'); }
      else if (navigator.clipboard) { await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); setFeedback('Emergency card details copied.'); }
      else setFeedback('Sharing is not available in this browser.');
    } catch (error) { if (error instanceof Error && error.name !== 'AbortError') setFeedback('Unable to share right now.'); }
  };
  return <main className="main-content max-w-[610px]">
    <p className="eyebrow mb-3">KEEP HELP CLOSE</p><h1 className="page-heading">Emergency card</h1>
    <section className="panel relative mt-6 overflow-hidden px-6 py-9 text-center sm:px-10 sm:py-12" data-testid="card-emergency-number">
      <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full border border-[#E5E5EF]"/><div className="pointer-events-none absolute -right-5 -top-7 h-36 w-36 rounded-full border border-[#E5E5EF]"/>
      <div className="relative"><div className="brand-word">SAKHI SURAKSHA</div><div className="brand-tag mt-2">KNOW. LOCATE. ACT.</div>
        <p className="mt-7 font-bold text-7xl tracking-[-.06em] text-[#6685F5] sm:text-8xl">112</p>
        <p className="eyebrow mt-3">NATIONAL EMERGENCY NUMBER</p>
        <div className="mt-7 flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[.2em] text-[#6B7280]"><Shield size={14}/>POLICE <span className="text-[#6B7280]">•</span> MEDICAL <span className="text-[#6B7280]">•</span> FIRE <span className="text-[#6B7280]">•</span> SAFETY</div>
      </div>
    </section>
    <div className="mt-4"><EmergencyCall compact /></div>
    <section className="panel mt-4 p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E9E4FF] text-[#9B7CF6]"><Share2 size={18}/></span><div><h2 className="font-bold text-sm">Share emergency card</h2><p className="body-copy mt-1 text-xs">Share the emergency number and Sakhi Suraksha link with someone you care about.</p></div></div>
      <button className="outline-action mt-4 w-full !border-0 !bg-gradient-to-r !from-[#A47CF5] !to-[#6685F5] !text-white" onClick={share} data-testid="button-share-card"><Share2 size={16}/>Share Sakhi Suraksha</button>
      {feedback && <p className="mt-3 flex items-center justify-center gap-2 text-xs text-[#9B7CF6]" role="status" data-testid="status-share"><Check size={14}/>{feedback}</p>}
    </section>
  </main>;
}

function AboutPage() {
  return <main className="main-content">
    <p className="eyebrow mb-3">ABOUT THIS PROJECT</p><h1 className="page-heading">Sakhi Suraksha</h1>
    <p className="body-copy mt-3 max-w-xl">KNOW. LOCATE. ACT.</p>
    <section className="panel mt-6 p-5 sm:p-7">
      <h2 className="font-bold text-xl text-[#111827]">Our goals</h2>
      <p className="body-copy mt-3">Sakhi Suraksha aims to make essential emergency information easy to find: how to call 112, where to look for nearby emergency services, and what steps to take in an emergency.</p>
      <p className="body-copy mt-3">This Community Engagement Project supports awareness and practical preparedness. It is an information resource and does not replace emergency services.</p>
    </section>
    <section className="panel mt-4 p-5 sm:p-7">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#75DDE4]/15 text-[#75DDE4]"><LockKeyhole size={19}/></span><h2 className="font-bold text-xl text-[#111827]">Privacy</h2></div>
      <p className="body-copy mt-4">Your location is requested only when you choose “Use my location” to create a Google Maps search. The search opens Google Maps; location access is controlled by your browser. Sakhi Suraksha does not display fabricated facility listings or phone numbers.</p>
      <p className="body-copy mt-3">You can use the informational pages without sharing your location. Emergency calls are placed through your device using 112.</p>
    </section>
    <section className="mt-4 flex items-start gap-3 rounded-2xl border border-[#E5E5EF] bg-white p-4 text-xs leading-relaxed text-[#6B7280]"><Copy size={15} className="mt-0.5 shrink-0 text-[#9B7CF6]"/>Facility data comes from Google Maps Places. We never invent phone numbers.</section>
  </main>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  const [path] = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Home', '/nearby': 'Nearby Help', '/what-to-do': 'What To Do', '/awareness': 'Emergency Awareness', '/card': 'Emergency Card', '/about': 'About' };
    document.title = `${titles[path] || 'Sakhi Suraksha'} | Sakhi Suraksha`;
  }, [path]);
  return <RoutedErrorBoundary><SiteShell><Switch>
    <Route path="/" component={HomePage}/>
    <Route path="/nearby" component={NearbyPage}/>
    <Route path="/what-to-do" component={GuidePage}/>
    <Route path="/awareness" component={AwarenessPage}/>
    <Route path="/card" component={CardPage}/>
    <Route path="/about" component={AboutPage}/>
    <Route><main className="main-content"><p className="eyebrow">PAGE NOT FOUND</p><h1 className="page-heading mt-3">Let’s get you help.</h1><Link className="outline-action mt-5 no-underline" href="/">Return home<ArrowRight size={15}/></Link></main></Route>
  </Switch></SiteShell></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}

export default App;