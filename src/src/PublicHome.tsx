import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, FileText, LogIn, MapPin, Menu, Share2, Users, X } from 'lucide-react';
import PublicArticlePage from './PublicArticlePage';
import PublicGalleryPage from './PublicGalleryPage';
import type { ArticleItem } from './ArticlePage';

type AboutContent = {
  profile: string;
  vision: string;
  missions: string[];
  goals: string[];
  activities: { title: string; description: string }[];
  address: string;
  instagram: string;
  email: string;
  tiktok: string;
  youtube: string;
};

type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string | null;
  pamphlet_url: string | null;
  documentation_urls: string[] | null;
};

type PublicHomeProps = {
  articles: ArticleItem[];
  articleError?: string;
  events: PublicEvent[];
  eventError?: string;
  about: AboutContent;
  onLogin: () => void;
};

type PublicView = 'home' | 'about' | 'agenda' | 'articles' | 'gallery';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(`${value}T00:00:00`));
}

function eventStatusLabel(status: string | null) {
  return status === 'ongoing' ? 'Berlangsung' : 'Terjadwal';
}



function getAgendaUrl() {
  const url = new URL(window.location.href);
  url.hash = 'agenda-ranting';
  return url.toString();
}



function getViewFromHash(): PublicView {
  if (window.location.hash === '#tentang-organisasi') return 'about';
  if (window.location.hash === '#agenda-ranting') return 'agenda';
  if (window.location.hash === '#artikel-ranting' || window.location.hash.startsWith('#/artikel/')) return 'articles';
  if (window.location.hash === '#galeri-ranting') return 'gallery';
  return 'home';
}

export default function PublicHome({ articles, articleError, events, eventError, about, onLogin }: PublicHomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [view, setView] = useState<PublicView>(getViewFromHash);

  useEffect(() => {
    const syncView = () => {
      setView(getViewFromHash());
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', syncView);
    return () => window.removeEventListener('hashchange', syncView);
  }, []);

  useEffect(() => {
    const root = document.querySelector('.publicSite');
    if (!root) return;
    const selector = 'main > section, main > .publicPageIntro, main > .publicBackButton, .publicEventCard, .publicArticleCard, .publicSimpleGrid article, .publicActivitiesList article, .publicEventDetail, .publicFooter';
    const observed = new WeakSet<Element>();
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('publicRevealVisible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    const collect = () => {
      root.querySelectorAll(selector).forEach(element => {
        if (observed.has(element)) return;
        observed.add(element);
        const parent = element.parentElement;
        const siblings = parent ? Array.from(parent.children) : [];
        const siblingIndex = Math.max(0, siblings.indexOf(element));
        element.classList.add('publicRevealTarget');
        element.setAttribute('style', `${element.getAttribute('style') || ''};--reveal-delay:${Math.min(siblingIndex, 4) * 70}ms`);
        revealObserver.observe(element);
      });
    };
    collect();
    const mutationObserver = new MutationObserver(collect);
    mutationObserver.observe(root, { childList: true, subtree: true });
    return () => {
      mutationObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [view]);

  const go = (next: PublicView) => {
    setMenuOpen(false);
    setSelectedEvent(null);
    const hash = next === 'about' ? '#tentang-organisasi' : next === 'agenda' ? '#agenda-ranting' : next === 'articles' ? '#artikel-ranting' : next === 'gallery' ? '#galeri-ranting' : '';
    if (window.location.hash === hash) {
      setView(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (hash) window.location.hash = hash;
    else window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setMenuOpen(false);
    onLogin();
  };

  const nearestEvents = useMemo(() => events.slice(0, 2), [events]);

  return (
    <div className="publicSite">
      <header className="publicHeader">
        <button className="publicBrandButton" onClick={() => go('home')} aria-label="Kembali ke beranda">
          <img src="/resources/logo.png" alt="Logo IPNU-IPPNU Tembok Kidul" />
          <span><strong>IPNU-IPPNU Tembok Kidul</strong><small>Sistem Informasi Organisasi</small></span>
        </button>
        <nav className="publicDesktopNav" aria-label="Navigasi publik">
          <button className={view === 'home' ? 'publicNavActive' : ''} onClick={() => go('home')}>Beranda</button>
          <button className={view === 'about' ? 'publicNavActive' : ''} onClick={() => go('about')}>Tentang Kami</button>
          <button className={view === 'agenda' ? 'publicNavActive' : ''} onClick={() => go('agenda')}>Agenda</button>
          <button className={view === 'articles' ? 'publicNavActive' : ''} onClick={() => go('articles')}>Artikel</button>
          <button className="publicLoginButton" onClick={handleLogin}><LogIn size={15} /> Login Pengurus</button>
        </nav>
        <button className="publicMenuButton" onClick={() => setMenuOpen(value => !value)} aria-label="Buka menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        {menuOpen && <nav className="publicMobileMenu" aria-label="Menu mobile">
          <button onClick={() => go('home')}>Beranda</button>
          <button onClick={() => go('about')}>Tentang Kami</button>
          <button onClick={() => go('agenda')}>Agenda Ranting</button>
          <button onClick={() => go('articles')}>Artikel</button>
          <button onClick={() => go('gallery')}>Galeri</button>
          <button onClick={handleLogin}><LogIn size={16} /> Login Pengurus</button>
        </nav>}
      </header>

      {view === 'home' && <main>
        <section className="publicHero publicHeroSimple" id="beranda">
          <div className="publicHeroGlow" />
          <div className="publicHeroCopy">
            <span className="publicPill"><i /> Website Resmi Ranting</span>
            <h1>Ruang digital<br /><em>IPNU-IPPNU Tembok Kidul.</em></h1>
            <p>Beranda informasi organisasi untuk mengenal kegiatan, kabar, dan perjalanan IPNU-IPPNU Ranting Tembok Kidul.</p>
            <div className="publicHeroActions">
              <button className="publicPrimaryButton" onClick={() => go('articles')}>Baca Artikel <ChevronRight size={17} /></button>
              <button className="publicSecondaryButton" onClick={() => go('about')}>Kenal Organisasi <ChevronRight size={17} /></button>
            </div>
          </div>
        </section>

        <section className="publicSchedule publicScheduleHome" id="jadwal">
          <div className="publicScheduleIntro">
            <div><span className="sectionLabel">AGENDA RANTING</span><h2>Jadwal <em>kegiatan.</em></h2><p>Dua kegiatan terdekat IPNU-IPPNU Tembok Kidul yang sudah dijadwalkan pengurus.</p></div>
            <div className="publicScheduleBadge"><CalendarDays size={18} /><span>{events.length} agenda</span></div>
          </div>
          {eventError ? <div className="publicArticleNotice">Jadwal kegiatan belum dapat dimuat. Pastikan akses publik kegiatan sudah diaktifkan di Supabase.</div> : nearestEvents.length === 0 ? <div className="publicEventEmpty"><CalendarDays size={28} /><strong>Belum ada kegiatan terjadwal.</strong><p>Agenda baru akan muncul di sini setelah pengurus menambahkannya.</p></div> : <div className="publicEventGrid">{nearestEvents.map(event => <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />)}</div>}
          {events.length > 2 && <button className="publicMoreButton" onClick={() => go('agenda')}>Lihat selengkapnya <ChevronRight size={17} /></button>}
        </section>

        <PublicArticlePage articles={articles} limitToTwo onOpenAll={() => go('articles')} />
        {articleError && <div className="publicArticleNotice">Artikel publik belum dapat dimuat. Pastikan policy publik artikel sudah dijalankan di Supabase.</div>}

      </main>}

      {view === 'about' && <AboutView about={about} onBack={() => go('home')} />}
      {view === 'agenda' && <AgendaView events={events} eventError={eventError} onBack={() => go('home')} onSelect={setSelectedEvent} />}
      {view === 'articles' && <PublicArticlePage articles={articles} onBack={() => go('home')} />}
      {view === 'gallery' && <PublicGalleryPage onBack={() => go('home')} />}
            {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <footer className="publicFooter"><div><strong>IPNU-IPPNU Tembok Kidul</strong><span>Sistem Informasi Organisasi</span></div><div><span>Gedung NU Desa Tembok Kidul</span><span>© {new Date().getFullYear()} RantingHub</span></div></footer>
    </div>
  );
}

function EventCard({ event, onClick }: { event: PublicEvent; onClick: () => void }) {
  return <button className="publicEventCard" onClick={onClick}><div className="publicEventDate"><strong>{formatShortDate(event.event_date)}</strong><span>{eventStatusLabel(event.status)}</span></div><div className="publicEventBody"><h3>{event.title}</h3><div className="publicEventMeta">{event.start_time && <span><Clock3 size={14} /> {event.start_time.slice(0,5)}{event.end_time ? `–${event.end_time.slice(0,5)}` : ''} WIB</span>}{event.location && <span><MapPin size={14} /> {event.location}</span>}</div>{event.description && <p>{event.description}</p>}<span className="publicEventDetailLink">Lihat detail <ChevronRight size={15} /></span></div></button>;
}

function AgendaView({ events, eventError, onBack, onSelect }: { events: PublicEvent[]; eventError?: string; onBack: () => void; onSelect: (event: PublicEvent) => void }) {
  return <main className="publicInnerPage"><button className="publicBackButton" onClick={onBack}><ArrowLeft size={17} /> Kembali ke Beranda</button><div className="publicPageIntro"><span className="sectionLabel">AGENDA RANTING</span><h1>Semua <em>kegiatan.</em></h1><p>Daftar kegiatan IPNU-IPPNU Tembok Kidul yang sudah dijadwalkan pengurus.</p></div>{eventError ? <div className="publicArticleNotice">Jadwal kegiatan belum dapat dimuat. Pastikan akses publik kegiatan sudah diaktifkan di Supabase.</div> : events.length === 0 ? <div className="publicEventEmpty"><CalendarDays size={28} /><strong>Belum ada agenda.</strong><p>Kegiatan yang dijadwalkan pengurus akan tampil di halaman ini.</p></div> : <div className="publicAgendaList">{events.map(event => <EventCard key={event.id} event={event} onClick={() => onSelect(event)} />)}</div>}</main>;
}

function AboutView({ about, onBack }: { about: AboutContent; onBack: () => void }) {
  return <main className="publicInnerPage publicAboutPage"><button className="publicBackButton" onClick={onBack}><ArrowLeft size={17} /> Kembali ke Beranda</button><div className="publicPageIntro"><span className="sectionLabel">TENTANG KAMI</span><h1>Kenal lebih dekat<br /><em>organisasi kami.</em></h1><p>Profil resmi IPNU-IPPNU Ranting Tembok Kidul, mulai dari visi, misi, tujuan, hingga kegiatan rutin dan kontak organisasi.</p></div><section className="publicAboutProfile"><span className="publicAboutEyebrow">PROFIL ORGANISASI</span><p>{about.profile}</p></section><div className="publicSimpleGrid"><article><span>01</span><h2>Visi</h2><p>{about.vision}</p></article><article><span>02</span><h2>Misi</h2><ul>{about.missions.map((item,index) => <li key={`mission-${index}`}>{item}</li>)}</ul></article><article><span>03</span><h2>Tujuan Organisasi</h2><ul>{about.goals.map((item,index) => <li key={`goal-${index}`}>{item}</li>)}</ul></article></div><section className="publicActivitiesBlock"><div><span className="publicAboutEyebrow">KEGIATAN RUTIN</span><h2>Berproses bersama.</h2></div><div className="publicActivitiesList">{about.activities.map((item,index) => <article key={`activity-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div></section><section className="publicContactBlock"><div><span className="publicAboutEyebrow">KONTAK & SEKRETARIAT</span><h2>Temui kami.</h2><p>{about.address}</p></div><div className="publicContactList"><span>Instagram <strong>{about.instagram}</strong></span><span>Email <strong>{about.email}</strong></span><span>TikTok <strong>{about.tiktok}</strong></span><span>YouTube <strong>{about.youtube}</strong></span></div></section></main>;
}

function EventDetail({ event, onClose }: { event: PublicEvent; onClose: () => void }) {
  const docs = event.documentation_urls ?? [];
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const time = event.start_time ? `
⏰ ${event.start_time.slice(0, 5)}${event.end_time ? `–${event.end_time.slice(0, 5)}` : ''} WIB` : '';
    const location = event.location ? `
📍 ${event.location}` : '';
    const description = event.description ? `

${event.description}` : '';
    const invitation = `📣 UNDANGAN KEGIATAN IPNU-IPPNU TEMBOK KIDUL

📌 ${event.title}
📅 ${formatDate(event.event_date)}${time}${location}${description}

🔗 Detail agenda: ${getAgendaUrl()}`;
    try {
      await navigator.clipboard.writeText(invitation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = invitation;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      textarea.remove();
      if (success) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      }
    }
  };

  return <div className="publicEventOverlay" role="dialog" aria-modal="true" aria-label={`Detail ${event.title}`} onClick={onClose}><article className="publicEventDetail" onClick={e => e.stopPropagation()}><button className="publicEventClose" onClick={onClose} aria-label="Tutup detail"><X size={18} /></button>{event.pamphlet_url && <img className="publicEventPamphlet" src={event.pamphlet_url} alt={`Pamflet ${event.title}`} />}<span className="sectionLabel">{eventStatusLabel(event.status)}</span><h2>{event.title}</h2><div className="publicEventDetailMeta"><span><CalendarDays size={15} /> {formatDate(event.event_date)}</span>{event.start_time && <span><Clock3 size={15} /> {event.start_time.slice(0,5)}{event.end_time ? `–${event.end_time.slice(0,5)}` : ''} WIB</span>}{event.location && <span><MapPin size={15} /> {event.location}</span>}</div>{event.description && <p className="publicEventDescription">{event.description}</p>}<div className="publicEventActions"><button className="publicEventShareButton" onClick={handleShare}>{copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? 'Undangan Tersalin' : 'Bagikan Kegiatan'}</button></div>{docs.length ? <div className="publicEventGallery"><h3>Dokumentasi</h3><div>{docs.map((url,index) => <img key={`${url}-${index}`} src={url} alt={`Dokumentasi ${event.title} ${index + 1}`} />)}</div></div> : null}</article></div>;
}
