import { FormEvent, useEffect, useMemo, useState } from 'react';
import GalleryPage from './GalleryPage';
import PublicHome from './PublicHome';
import { ArticlePage, ArticleModal, ArticlePreviewModal, sanitizeArticleHtml } from './ArticlePage';
import type { ReactNode } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, BookOpen, BriefcaseBusiness, CheckCircle2, ChevronRight, Edit3, FileText, Image as ImageIcon, LayoutDashboard, LogOut, Menu, Plus, RefreshCw, Search, ShieldCheck, Trash2, UserPlus, Users, WalletCards, X } from 'lucide-react';

const SUPABASE_URL = 'https://mwunxbhbdwzwkrmntxth.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_nAX-11lvLv9MJQs1b0chYA_G5SyqqFb';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

type Member = { id: string; member_code: string; nia: string | null; full_name: string; nickname: string | null; gender: string | null; birth_place: string | null; birth_date: string | null; address: string | null; village: string | null; phone: string | null; email: string | null; join_date: string | null; status: string | null; };
type Pengurus = { id: string; member_id: string | null; full_name: string; position: string; division: string | null; period: string | null; phone: string | null; status: string | null; };
type FormState = { member_code: string; nia: string; full_name: string; nickname: string; gender: string; birth_place: string; birth_date: string; address: string; village: string; phone: string; email: string; join_date: string; status: string; };
type PengurusForm = { member_id: string; full_name: string; position: string; division: string; period: string; phone: string; status: string; };
type EventItem = { id: string; title: string; description: string | null; event_date: string; start_time: string | null; end_time: string | null; location: string | null; status: string | null; pamphlet_url: string | null; documentation_urls: string[] | null; };
type EventForm = { title: string; description: string; event_date: string; start_time: string; end_time: string; location: string; status: string; pamphlet_url: string | null; documentation_urls: string[]; pamphlet_file: File | null; documentation_files: File[]; removed_pamphlet_url: string | null; removed_documentation_urls: string[] };
type FinanceItem = { id: string; transaction_date: string; type: 'income' | 'expense'; category: string; amount: number; description: string | null; };
type ArticleItem = { id: string; title: string; subtitle: string | null; category: string | null; tags: string[] | null; author: string | null; author_role: string | null; author_photo_url: string | null; author_bio: string | null; publish_date: string | null; status: 'draft' | 'published'; excerpt: string | null; cover_url: string | null; content: string; created_at?: string | null; updated_at?: string | null; };
type ArticleForm = { title: string; subtitle: string; category: string; tags: string[]; author: string; author_role: string; author_photo_url: string | null; author_bio: string; publish_date: string; status: 'draft' | 'published'; excerpt: string; cover_url: string | null; content: string };
type FinanceForm = { transaction_date: string; type: 'income' | 'expense'; category: string; amount: string; description: string }; type AboutContent = { profile: string; vision: string; missions: string[]; goals: string[]; activities: { title: string; description: string }[]; address: string; instagram: string; email: string; tiktok: string; youtube: string; };

const emptyMember: FormState = { member_code: '', nia: '', full_name: '', nickname: '', gender: '', birth_place: '', birth_date: '', address: '', village: '', phone: '', email: '', join_date: '', status: 'active' };
const emptyPengurus: PengurusForm = { member_id: '', full_name: '', position: '', division: '', period: '', phone: '', status: 'active' };
const emptyEvent: EventForm = { title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', status: 'scheduled', pamphlet_url: null, documentation_urls: [], pamphlet_file: null, documentation_files: [], removed_pamphlet_url: null, removed_documentation_urls: [] };
const emptyFinance: FinanceForm = { transaction_date: new Date().toISOString().slice(0,10), type: 'income', category: '', amount: '', description: '' };
const emptyArticle: ArticleForm = { title: '', subtitle: '', category: '', tags: [], author: '', author_role: '', author_photo_url: null, author_bio: '', publish_date: new Date().toISOString().slice(0,10), status: 'draft', excerpt: '', cover_url: null, content: '' }; const defaultAbout: AboutContent = { profile: "Ikatan Pelajar Nahdlatul Ulama (IPNU) dan Ikatan Pelajar Putri Nahdlatul Ulama (IPPNU) Tembok Kidul adalah badan otonom di bawah naungan Pengurus Ranting Nahdlatul Ulama (PRNU) Desa Tembok Kidul. Organisasi ini menjadi wadah utama bagi para pelajar, santri, dan remaja Islam di lingkungan Desa Tembok Kidul untuk belajar, berorganisasi, dan memperdalam ajaran Islam Ahlussunnah wal Jama'ah An-Nahdliyah.", vision: 'Terwujudnya pelajar dan remaja Desa Tembok Kidul yang bertakwa kepada Allah SWT, berakhlak mulia, berilmu, berwawasan kebangsaan, serta bertanggung jawab terhadap tegaknya ajaran Islam Ahlussunnah wal Jama\'ah An-Nahdliyah.', missions: ['Kaderisasi Mandiri: Membentuk kader yang aktif, inovatif, dan berintegritas melalui pelatihan organisasi formal dan non-formal.','Dakwah Milenial: Menyiarkan nilai-nilai Islam yang ramah, moderat (tawassuth), dan toleran (tasamuh) di kalangan generasi muda Tembok Kidul.','Pilar Pendidikan & Sosial: Mengembangkan potensi akademik, minat-bakat, serta kepedulian sosial bagi seluruh anggota dan masyarakat sekitar.'], goals: ['Menjaga Tradisi NU: Membentengi generasi muda dari paham-paham radikal dan menyimpang yang merusak tatanan sosial masyarakat.','Wadah Silaturahmi: Mempererat ukhuwah islamiyah dan ukhuwah wathaniyah antar-pelajar dan pemuda di seluruh wilayah Desa Tembok Kidul.','Pusat Pengembangan Diri: Menjadi laboratorium kepemimpinan bagi remaja sebelum terjun ke jenjang organisasi yang lebih tinggi maupun ke masyarakat luas.'], activities: [{ title: 'Rutinan Reboan', description: 'Kegiatan pengajian dan pembahasan kitab keagamaan secara mendalam yang diselenggarakan setiap seminggu sekali pada Selasa malam Rabu.' },{ title: 'Rutinan Anjangsana', description: 'Kegiatan pertemuan dan kajian berkala setiap dua minggu sekali pada Minggu pagi, yang dilaksanakan secara bergilir di rumah Rekan dan Rekanita demi mempererat silaturahmi.' },{ title: 'Ziarah Biwulan', description: 'Agenda ziarah makam yang dilaksanakan setiap dua bulan sekali dengan tujuan menghormati dan meneladani para wali serta ulama lokal di wilayah Kabupaten Tegal.' }], address: 'Gedung Nu desa tembok kidul. Jl kepodang 2 padiangan, Tembok Kidul, Kec. Adiwerna, Kabupaten Tegal, Jawa Tengah 52194', instagram: '@ipnuippnurantingtembokkidul', email: 'ipnuippnurantingtembokkidul@gmail.com', tiktok: '@ipnuippnutemkid', youtube: '@ipnuippnurantingtembokkidul' };

const setupSql = `-- Jalankan SEKALI di Supabase SQL Editor.
-- Termasuk kolom gambar kegiatan dan bucket Storage.

alter table public.events add column if not exists pamphlet_url text;
alter table public.events add column if not exists documentation_urls text[] default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kegiatan-images', 'kegiatan-images', true, 5242880, array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists kegiatan_images_public_read on storage.objects;
create policy kegiatan_images_public_read on storage.objects for select using (bucket_id = 'kegiatan-images');
drop policy if exists kegiatan_images_admin_insert on storage.objects;
create policy kegiatan_images_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'kegiatan-images' and auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);
drop policy if exists kegiatan_images_admin_update on storage.objects;
create policy kegiatan_images_admin_update on storage.objects for update to authenticated using (bucket_id = 'kegiatan-images' and auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid) with check (bucket_id = 'kegiatan-images' and auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);
drop policy if exists kegiatan_images_admin_delete on storage.objects;
create policy kegiatan_images_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'kegiatan-images' and auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);

drop policy if exists organizations_admin_read on public.organizations;
create policy organizations_admin_read on public.organizations for select to authenticated using (true);
grant select on public.organizations to authenticated;

drop policy if exists members_admin_all on public.members;
create policy members_admin_all on public.members for all to authenticated using (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid) with check (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);
grant select, insert, update, delete on public.members to authenticated;

drop policy if exists events_admin_all on public.events;
create policy events_admin_all on public.events for all to authenticated using (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid) with check (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);
grant select, insert, update, delete on public.events to authenticated;

create table if not exists public.pengurus (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade, member_id uuid references public.members(id) on delete set null, full_name text not null, position text not null, division text, period text, phone text, status text default 'active', created_at timestamptz default now(), updated_at timestamptz default now());
alter table public.pengurus enable row level security;
drop policy if exists pengurus_admin_all on public.pengurus;
create policy pengurus_admin_all on public.pengurus for all to authenticated using (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid) with check (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);
grant select, insert, update, delete on public.pengurus to authenticated;

create table if not exists public.finance_transactions (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade, transaction_date date not null, type text not null check (type in ('income','expense')), category text not null, amount numeric(14,2) not null check (amount > 0), description text, created_at timestamptz default now(), updated_at timestamptz default now());
alter table public.finance_transactions enable row level security;
drop policy if exists finance_transactions_admin_all on public.finance_transactions;
create policy finance_transactions_admin_all on public.finance_transactions for all to authenticated using (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid) with check (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);
grant select, insert, update, delete on public.finance_transactions to authenticated;

create table if not exists public.articles (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade, title text not null, subtitle text, category text, author text, publish_date date default current_date, status text not null default 'draft' check (status in ('draft','published')), excerpt text, cover_url text, content text not null, created_at timestamptz default now(), updated_at timestamptz default now());
alter table public.articles add column if not exists subtitle text;
alter table public.articles add column if not exists cover_url text;
alter table public.articles enable row level security;
drop policy if exists articles_admin_all on public.articles;
create policy articles_admin_all on public.articles for all to authenticated using (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid) with check (auth.uid() = '1a6a6793-e62d-4e82-a166-9f3c5470e3b7'::uuid);
grant select, insert, update, delete on public.articles to authenticated;`;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<'dashboard' | 'anggota' | 'pengurus' | 'kegiatan' | 'keuangan' | 'tentang' | 'galeri' | 'artikel'>('dashboard');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [pengurus, setPengurus] = useState<Pengurus[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [finance, setFinance] = useState<FinanceItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [publicArticles, setPublicArticles] = useState<ArticleItem[]>([]);
  const [publicArticleError, setPublicArticleError] = useState('');
  const [publicEvents, setPublicEvents] = useState<EventItem[]>([]);
  const [publicEventError, setPublicEventError] = useState('');
  const [adminMode, setAdminMode] = useState(() => window.location.hash === '#admin');
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [memberModal, setMemberModal] = useState(false);
  const [pengurusModal, setPengurusModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [financeModal, setFinanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingPengurus, setEditingPengurus] = useState<Pengurus | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingFinance, setEditingFinance] = useState<FinanceItem | null>(null);
  const [memberForm, setMemberForm] = useState<FormState>(emptyMember);
  const [pengurusForm, setPengurusForm] = useState<PengurusForm>(emptyPengurus);
  const [eventForm, setEventForm] = useState<EventForm>(emptyEvent);
  const [financeForm, setFinanceForm] = useState<FinanceForm>(emptyFinance);
  const [articleModal, setArticleModal] = useState(false);
  const [articlePreview, setArticlePreview] = useState<ArticleItem | null>(null);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleForm>(emptyArticle); const [about, setAbout] = useState<AboutContent>(() => { try { const saved = localStorage.getItem('ipnuippnu_tembok_kidul_about'); return saved ? { ...defaultAbout, ...JSON.parse(saved) } : defaultAbout; } catch { return defaultAbout; } }); const [aboutModal, setAboutModal] = useState(false); const [aboutForm, setAboutForm] = useState<AboutContent>(defaultAbout);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const syncHash = () => setAdminMode(window.location.hash === '#admin');
    window.addEventListener('hashchange', syncHash);
    syncHash();
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => { loadPublicArticles(); loadPublicEvents(); if (user) loadAll(); }, [user]);

  useEffect(() => { const refreshEventStatuses = () => { setEvents(current => current.map(withAutomaticEventStatus)); setPublicEvents(current => current.map(withAutomaticEventStatus).filter(item => item.status !== 'completed').slice(0, 12)); }; const timer = window.setInterval(refreshEventStatuses, 30000); return () => window.clearInterval(timer); }, []);

  async function loadPublicArticles() {
    const { data, error } = await supabase.from('articles').select('id,title,subtitle,category,tags,author,author_role,author_photo_url,author_bio,publish_date,status,excerpt,cover_url,content').eq('status','published').order('publish_date',{ ascending:false });
    if (error) setPublicArticleError(error.message); else { setPublicArticleError(''); setPublicArticles((data ?? []) as ArticleItem[]); }
  }

  async function loadPublicEvents() {
    const { data, error } = await supabase.from('events').select('id,title,description,event_date,start_time,end_time,location,status,pamphlet_url,documentation_urls').order('event_date', { ascending: true });
    if (error) setPublicEventError(error.message); else { setPublicEventError(''); setPublicEvents((data ?? []).map(item => withAutomaticEventStatus(item as EventItem)).filter(item => item.status !== 'completed').slice(0, 12)); }
  }

  async function loadAll() {
    setLoading(true); setError('');
    const [mr, pr, ev, fr, ar] = await Promise.all([
      supabase.from('members').select('id,member_code,nia,full_name,nickname,gender,birth_place,birth_date,address,village,phone,email,join_date,status').order('created_at', { ascending: false }),
      supabase.from('pengurus').select('id,member_id,full_name,position,division,period,phone,status').order('created_at', { ascending: false }),
      supabase.from('events').select('id,title,description,event_date,start_time,end_time,location,status,pamphlet_url,documentation_urls').order('event_date', { ascending: false }),
      supabase.from('finance_transactions').select('id,transaction_date,type,category,amount,description').order('transaction_date', { ascending: false }),
      supabase.from('articles').select('id,title,subtitle,category,tags,author,author_role,author_photo_url,author_bio,publish_date,status,excerpt,cover_url,content,created_at,updated_at').order('publish_date', { ascending: false })
    ]);
    if (mr.error) setError(`Data anggota: ${mr.error.message}`); else setMembers((mr.data ?? []) as Member[]);
    if (pr.error) setError(prev => prev || `Data pengurus belum siap. Jalankan SQL persiapan di bagian bawah. (${pr.error.message})`); else setPengurus((pr.data ?? []) as Pengurus[]);
    if (ev.error) setError(prev => prev || `Data kegiatan belum siap. Jalankan SQL persiapan di bagian bawah. (${ev.error.message})`); else setEvents((ev.data ?? []).map(item => withAutomaticEventStatus(item as EventItem)));
    if (fr.error) setError(prev => prev || `Data keuangan belum siap. Jalankan SQL persiapan di bagian bawah. (${fr.error.message})`); else setFinance((fr.data ?? []) as FinanceItem[]);
    if (ar.error) setError(prev => prev || `Data artikel belum siap. Jalankan SQL persiapan di bagian bawah. (${ar.error.message})`); else setArticles((ar.data ?? []) as ArticleItem[]);
    setLoading(false);
  }

  async function login(e: FormEvent) {
    e.preventDefault(); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setError(error.message);
    else { setShowLogin(false); setAdminMode(true); window.location.hash = 'admin'; }
  }

  function openAdmin() {
    setAdminMode(true);
    window.location.hash = 'admin';
    setShowLogin(!user);
  }

  function openPublic() {
    setAdminMode(false);
    setShowLogin(false);
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  function openAboutEdit() { setAboutForm(about); setError(''); setAboutModal(true); } function saveAbout(e: FormEvent) { e.preventDefault(); setAbout(aboutForm); localStorage.setItem('ipnuippnu_tembok_kidul_about', JSON.stringify(aboutForm)); setAboutModal(false); } function openNewMember() { setEditingMember(null); setMemberForm(emptyMember); setError(''); setMemberModal(true); }
  function openEditMember(m: Member) { setEditingMember(m); setMemberForm({ member_code: m.member_code, nia: m.nia ?? '', full_name: m.full_name, nickname: m.nickname ?? '', gender: m.gender ?? '', birth_place: m.birth_place ?? '', birth_date: m.birth_date ?? '', address: m.address ?? '', village: m.village ?? '', phone: m.phone ?? '', email: m.email ?? '', join_date: m.join_date ?? '', status: m.status ?? 'active' }); setError(''); setMemberModal(true); }
  function openNewPengurus() { setEditingPengurus(null); setPengurusForm(emptyPengurus); setError(''); setPengurusModal(true); }
  function openEditPengurus(p: Pengurus) { setEditingPengurus(p); setPengurusForm({ member_id: p.member_id ?? '', full_name: p.full_name, position: p.position, division: p.division ?? '', period: p.period ?? '', phone: p.phone ?? '', status: p.status ?? 'active' }); setError(''); setPengurusModal(true); }

  async function saveMember(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    if (editingMember) {
      const { error } = await supabase.from('members').update(memberForm).eq('id', editingMember.id);
      if (error) setError(`Gagal mengubah anggota: ${error.message}`); else { setMemberModal(false); await loadAll(); }
    } else {
      const { data: org, error: orgError } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (orgError || !org) setError(`Organisasi belum bisa dibaca. ${orgError?.message ?? 'Cek policy RLS organizations.'}`);
      else {
        const { error } = await supabase.from('members').insert({ ...memberForm, organization_id: org.id });
        if (error) setError(`Gagal menyimpan anggota: ${error.message}`); else { setMemberModal(false); await loadAll(); }
      }
    }
    setSaving(false);
  }

  async function deleteMember(m: Member) {
    if (!window.confirm(`Hapus data ${m.full_name}? Data yang dihapus tidak bisa dikembalikan.`)) return;
    const { error } = await supabase.from('members').delete().eq('id', m.id);
    if (error) setError(`Gagal menghapus anggota: ${error.message}`); else await loadAll();
  }

  async function savePengurus(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    if (!pengurusForm.member_id) { setError('Pilih anggota yang menjadi pengurus terlebih dahulu.'); setSaving(false); return; }
    const selectedMember = members.find(m => m.id === pengurusForm.member_id);
    const payload = { ...pengurusForm, full_name: selectedMember?.full_name || pengurusForm.full_name };
    if (editingPengurus) {
      const { error } = await supabase.from('pengurus').update(payload).eq('id', editingPengurus.id);
      if (error) setError(`Gagal mengubah pengurus: ${error.message}`); else { setPengurusModal(false); await loadAll(); }
    } else {
      const { data: org, error: orgError } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (orgError || !org) setError(`Organisasi belum bisa dibaca. ${orgError?.message ?? 'Cek policy RLS organizations.'}`);
      else {
        const { error } = await supabase.from('pengurus').insert({ ...payload, organization_id: org.id });
        if (error) setError(`Gagal menyimpan pengurus: ${error.message}`); else { setPengurusModal(false); await loadAll(); }
      }
    }
    setSaving(false);
  }

  async function deletePengurus(p: Pengurus) {
    if (!window.confirm(`Hapus ${p.full_name} dari data pengurus?`)) return;
    const { error } = await supabase.from('pengurus').delete().eq('id', p.id);
    if (error) setError(`Gagal menghapus pengurus: ${error.message}`); else await loadAll();
  }

  function openNewArticle() { setEditingArticle(null); setArticleForm(emptyArticle); setError(''); setArticleModal(true); }
  function openEditArticle(article: ArticleItem) { setEditingArticle(article); setArticleForm({ title: article.title, subtitle: article.subtitle ?? '', category: article.category ?? '', tags: article.tags ?? [], author: article.author ?? '', author_role: article.author_role ?? '', author_photo_url: article.author_photo_url ?? null, author_bio: article.author_bio ?? '', publish_date: article.publish_date ?? new Date().toISOString().slice(0,10), status: article.status, excerpt: article.excerpt ?? '', cover_url: article.cover_url ?? null, content: article.content }); setError(''); setArticleModal(true); }
  async function saveArticle(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    if (!articleForm.title.trim() || !articleForm.publish_date || !articleForm.category.trim() || !articleForm.content.trim()) { setError('Judul, kategori, tanggal, dan isi artikel wajib diisi.'); setSaving(false); return; }
    const payload = { title: articleForm.title.trim(), subtitle: articleForm.subtitle.trim() || null, category: articleForm.category.trim(), tags: Array.from(new Set(articleForm.tags.map(tag => tag.trim()).filter(Boolean))).slice(0, 12), author: articleForm.author.trim() || null, author_role: articleForm.author_role.trim() || null, author_photo_url: articleForm.author_photo_url || null, author_bio: articleForm.author_bio.trim() || null, publish_date: articleForm.publish_date, status: articleForm.status, excerpt: articleForm.excerpt.trim() || null, cover_url: articleForm.cover_url || null, content: sanitizeArticleHtml(articleForm.content) };
    if (editingArticle) {
      const { error } = await supabase.from('articles').update(payload).eq('id', editingArticle.id);
      if (error) setError(`Gagal mengubah artikel: ${error.message}`); else { setArticleModal(false); await loadAll(); }
    } else {
      const { data: org, error: orgError } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (orgError || !org) setError(`Organisasi belum bisa dibaca. ${orgError?.message ?? 'Cek policy RLS organizations.'}`);
      else {
        const { error } = await supabase.from('articles').insert({ ...payload, organization_id: org.id });
        if (error) setError(`Gagal menyimpan artikel: ${error.message}`); else { setArticleModal(false); await loadAll(); }
      }
    }
    setSaving(false);
  }
  async function uploadArticleImage(file: File, kind: 'cover' | 'inline' | 'author') { if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Gunakan gambar JPG, PNG, atau WebP.'); if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran setiap gambar maksimal 5 MB.'); const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'; const path = `articles/${kind}/${crypto.randomUUID()}.${ext}`; const { error } = await supabase.storage.from('kegiatan-images').upload(path, file, { contentType: file.type, upsert: false }); if (error) throw new Error(`Gagal mengunggah gambar artikel: ${error.message}`); return supabase.storage.from('kegiatan-images').getPublicUrl(path).data.publicUrl; }  async function deleteArticle(article: ArticleItem) {
    if (!window.confirm(`Hapus artikel ${article.title}? Data yang dihapus tidak bisa dikembalikan.`)) return;
    const { error } = await supabase.from('articles').delete().eq('id', article.id);
    if (error) setError(`Gagal menghapus artikel: ${error.message}`); else await loadAll();
  }

  function openNewEvent() { setEditingEvent(null); setEventForm(emptyEvent); setError(''); setEventModal(true); }
  function openNewFinance() { setEditingFinance(null); setFinanceForm(emptyFinance); setError(''); setFinanceModal(true); }
  function openEditFinance(item: FinanceItem) { setEditingFinance(item); setFinanceForm({ transaction_date: item.transaction_date, type: item.type, category: item.category, amount: String(item.amount), description: item.description ?? '' }); setError(''); setFinanceModal(true); }
  function openEditEvent(e: EventItem) { setEditingEvent(e); setEventForm({ title: e.title, description: e.description ?? '', event_date: e.event_date, start_time: e.start_time ?? '', end_time: e.end_time ?? '', location: e.location ?? '', status: e.status ?? 'scheduled', pamphlet_url: e.pamphlet_url ?? null, documentation_urls: e.documentation_urls ?? [], pamphlet_file: null, documentation_files: [], removed_pamphlet_url: null, removed_documentation_urls: [] }); setError(''); setEventModal(true); }
  function openEventDetail(e: EventItem) { setSelectedEvent(e); }

  async function uploadCloudinaryGalleryImage(file: File, albumName: string) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Gunakan gambar JPG, PNG, atau WebP.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Ukuran foto asli maksimal 8 MB sebelum kompresi.');
    const compressed = await compressGalleryImage(file);
    const sessionResult = await supabase.auth.getSession();
    const accessToken = sessionResult.data.session?.access_token;
    if (!accessToken) throw new Error('Sesi pengurus tidak ditemukan. Silakan login kembali.');
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supabaseAccessToken: accessToken,
        fileName: compressed.name,
        mimeType: compressed.type,
        base64: compressed.dataUrl,
        albumName,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || 'Gagal mengunggah foto ke Cloudinary.');
    }

    return String(data?.url ?? '');
  }

  async function uploadEventImage(file: File, eventId: string, kind: 'pamphlet' | 'documentation') {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Gunakan gambar JPG, PNG, atau WebP.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran setiap gambar maksimal 5 MB.');
    if (kind === 'documentation') {
      const event = events.find(item => item.id === eventId);
      const albumName = `Kegiatan - ${event?.title ?? eventId}`;
      return uploadCloudinaryGalleryImage(file, albumName);
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${eventId}/${kind}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('kegiatan-images').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Gagal mengunggah gambar: ${error.message}`);
    return supabase.storage.from('kegiatan-images').getPublicUrl(path).data.publicUrl;
    }
    async function deleteStoredEventImage(url: string) {
    if (!url) return;
    if (url.includes('res.cloudinary.com')) {
      const sessionResult = await supabase.auth.getSession();
      const accessToken = sessionResult.data.session?.access_token;
      if (!accessToken) throw new Error('Sesi pengurus tidak ditemukan. Silakan login kembali.');
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseAccessToken: accessToken,
          url,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Gagal menghapus foto dari Cloudinary.');
      }

      return;
    }
    const marker = '/storage/v1/object/public/kegiatan-images/';
    const path = url.includes(marker) ? url.split(marker)[1] : '';
    if (path) {
      const { error } = await supabase.storage.from('kegiatan-images').remove([path]);
      if (error) throw new Error(`Gagal menghapus gambar: ${error.message}`);
    }
  }

  async function saveEvent(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!eventForm.title.trim() || !eventForm.event_date) {
        setError('Judul dan tanggal kegiatan wajib diisi.');
        return;
      }
      const { pamphlet_file, documentation_files, removed_pamphlet_url, removed_documentation_urls, ...eventFields } = eventForm;
      let eventId = editingEvent?.id;
      const previousPamphletUrl = editingEvent?.pamphlet_url ?? null;
      let pamphletUrl = eventForm.pamphlet_url;
      let documentationUrls = eventForm.documentation_urls;
      const eventPayload = { ...eventFields, status: getAutomaticEventStatus(eventForm), start_time: eventForm.start_time || null, end_time: eventForm.end_time || null, description: eventForm.description || null, location: eventForm.location || null };

      if (!eventId) {
        const { data: org, error: orgError } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
        if (orgError || !org) throw new Error(`Organisasi belum bisa dibaca. ${orgError?.message ?? 'Cek policy RLS organizations.'}`);
        const { data: created, error: insertError } = await supabase.from('events').insert({ ...eventPayload, organization_id: org.id }).select('id').single();
        if (insertError || !created) throw new Error(`Gagal menyimpan kegiatan: ${insertError?.message ?? 'ID kegiatan tidak ditemukan.'}`);
        eventId = created.id;
      } else {
        const { error } = await supabase.from('events').update(eventPayload).eq('id', eventId);
        if (error) throw new Error(`Gagal mengubah kegiatan: ${error.message}`);
      }

      if (pamphlet_file) pamphletUrl = await uploadEventImage(pamphlet_file, eventId, 'pamphlet');
      if (documentation_files.length) {
        const uploaded = await
                {mobileMenu && <button className="sidebarBackdrop" onClick={() => setMobileMenu(false)} aria-label="Tutup menu" />}
      <main className="adminMain"><div className="mobileToolbar"><button onClick={() => setMobileMenu(true)}><Menu /></button><span>Administrasi Ranting</span></div>{error && <div className="globalError"><AlertCircle size={18} /><span>{error}</span><button onClick={() => setError('')}><X size={16} /></button></div>}{tab === 'dashboard' && <Dashboard members={members} pengurus={pengurus} activeMembers={activeMembers} activePengurus={activePengurus} loading={loading} events={events} finance={finance} articles={articles} totalIncome={totalIncome} totalExpense={totalExpense} cashBalance={cashBalance} onMembers={() => setTab('anggota')} onPengurus={() => setTab('pengurus')} onKegiatan={() => setTab('kegiatan')} onKeuangan={() => setTab('keuangan')} onArtikel={() => setTab('artikel')} onTentang={() => setTab('tentang')} />} {tab === 'tentang' && <AboutPage about={about} onEdit={openAboutEdit} />} {tab === 'galeri' && <GalleryPage events={events} loading={loading} saving={saving} onUpload={addGalleryPhotos} onDelete={deleteGalleryPhoto} onUploadManual={uploadManualAlbumPhotos} onDeleteManual={deleteManualAlbumPhotos} />} {tab === 'anggota' && <MemberPage members={filteredMembers} search={search} setSearch={setSearch} loading={loading} onRefresh={loadAll} onAdd={openNewMember} onEdit={openEditMember} onDelete={deleteMember} />}{tab === 'pengurus' && <PengurusPage pengurus={filteredPengurus} search={search} setSearch={setSearch} loading={loading} onRefresh={loadAll} onAdd={openNewPengurus} onEdit={openEditPengurus} onDelete={deletePengurus} />}{tab === 'kegiatan' && <EventPage events={filteredEvents} search={search} setSearch={setSearch} loading={loading} onRefresh={loadAll} onAdd={openNewEvent} onEdit={openEditEvent} onDelete={deleteEvent} onDetail={openEventDetail} />}{tab === 'keuangan' && <FinancePage finance={filteredFinance} search={search} setSearch={setSearch} loading={loading} totalIncome={totalIncome} totalExpense={totalExpense} cashBalance={cashBalance} onRefresh={loadAll} onAdd={openNewFinance} onEdit={openEditFinance} onDelete={deleteFinance} />}{tab === 'artikel' && <ArticlePage articles={filteredArticles} search={search} setSearch={setSearch} loading={loading} onRefresh={loadAll} onAdd={openNewArticle} onEdit={openEditArticle} onDelete={deleteArticle} onPreview={setArticlePreview} />}<section className="setupCard"><div><strong>Pengaturan database</strong><p>Salin SQL ini jika tabel pengurus atau kegiatan belum siap atau policy belum siap.</p></div><button onClick={() => navigator.clipboard?.writeText(setupSql)}><CheckCircle2 size={16} /> Salin SQL</button></section></main>
    </div>
    {memberModal && <MemberModal editing={editingMember} form={memberForm} setForm={setMemberForm} saving={saving} error={error} onClose={() => setMemberModal(false)} onSubmit={saveMember} />}{pengurusModal && <PengurusModal editing={editingPengurus} form={pengurusForm} members={members} setForm={setPengurusForm} saving={saving} error={error} onClose={() => setPengurusModal(false)} onSubmit={savePengurus} />}{eventModal && <EventModal editing={editingEvent} form={eventForm} setForm={setEventForm} saving={saving} error={error} onClose={() => setEventModal(false)} onSubmit={saveEvent} />}{financeModal && <FinanceModal editing={editingFinance} form={financeForm} setForm={setFinanceForm} saving={saving} error={error} onClose={() => setFinanceModal(false)} onSubmit={saveFinance} />}{selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onEdit={() => { setSelectedEvent(null); openEditEvent(selectedEvent); }} />} {aboutModal && <AboutModal about={aboutForm} setAbout={setAboutForm} saving={saving} onClose={() => setAboutModal(false)} onSubmit={saveAbout} />} {articleModal && <ArticleModal editing={editingArticle} form={articleForm} setForm={setArticleForm} saving={saving} error={error} onClose={() => setArticleModal(false)} onSubmit={saveArticle} onUploadImage={uploadArticleImage} />} {articlePreview && <ArticlePreviewModal article={articlePreview} onClose={() => setArticlePreview(null)} onEdit={() => { setArticlePreview(null); openEditArticle(articlePreview); }} />} 
  </div>;
}

function NavButton({ active, icon, label, count, onClick }: { active: boolean; icon: ReactNode; label: string; count?: number; onClick: () => void }) { return <button className={active ? 'navBtn active' : 'navBtn'} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && <b>{count}</b>}<ChevronRight className="navArrow" size={16} /></button>; }
function Dashboard({ members, pengurus, activeMembers, activePengurus, loading, onMembers, onPengurus, events, finance, articles, totalIncome, totalExpense, cashBalance, onKegiatan, onKeuangan, onArtikel, onTentang }: { members: Member[]; pengurus: Pengurus[]; activeMembers: number; activePengurus: number; loading: boolean; onMembers: () => void; onPengurus: () => void; events: EventItem[]; finance: FinanceItem[]; articles: ArticleItem[]; totalIncome: number; totalExpense: number; cashBalance: number; onKegiatan: () => void; onKeuangan: () => void; onArtikel: () => void; onTentang: () => void }) { const recent = members.slice(0,5); const recentFinance = finance.slice(0,4); const upcoming = [...events].filter(e => e.event_date >= new Date().toISOString().slice(0,10)).sort((a,b) => a.event_date.localeCompare(b.event_date)).slice(0,4); const statusLabel = (status: string | null) => status === 'scheduled' ? 'Terjadwal' : status === 'ongoing' ? 'Berlangsung' : status === 'completed' ? 'Selesai' : status === 'cancelled' ? 'Dibatalkan' : 'Draft'; return <div className="pageIntro"><div className="introTop"><div><p className="kicker">DASHBOARD PENGURUS</p><h1>Administrasi Ranting</h1><p>Tempat sederhana untuk mengelola data anggota, kepengurusan, dan kegiatan.</p></div><div className="dateBadge">● Sistem aktif</div></div><div className="statGrid"><Stat icon={<Users />} value={members.length} label="Total Anggota" /><Stat icon={<CheckCircle2 />} value={activeMembers} label="Anggota Aktif" /><Stat icon={<BriefcaseBusiness />} value={pengurus.length} label="Total Pengurus" /><Stat icon={<ShieldCheck />} value={activePengurus} label="Pengurus Aktif" /><Stat icon={<FileText />} value={articles.length} label="Total Artikel" /></div><div className="quickGrid dashboardQuickGrid"><button onClick={onMembers}><span><UserPlus /></span><div><strong>Kelola Anggota</strong><small>Tambah, edit, cari, dan hapus data</small></div><ChevronRight /></button><button onClick={onPengurus}><span><BriefcaseBusiness /></span><div><strong>Kelola Pengurus</strong><small>Atur jabatan, bidang, dan periode</small></div><ChevronRight /></button><button onClick={onKegiatan}><span><CheckCircle2 /></span><div><strong>Kelola Kegiatan</strong><small>Agenda, status, pamflet, dan dokumentasi</small></div><ChevronRight /></button><button onClick={onArtikel}><span><FileText /></span><div><strong>Kelola Artikel</strong><small>Tulis, edit, preview, dan atur status</small></div><ChevronRight /></button></div><section className="aboutDashboardCard"><div><span><BookOpen /></span><div><p className="kicker">PROFIL ORGANISASI</p><h2>Tentang Kami</h2><p>Profil, visi, misi, tujuan, kegiatan rutin, alamat, dan media sosial ranting.</p></div></div><button onClick={onTentang}>Buka & Edit <ChevronRight size={17} /></button></section><section className="financeSummary"><div><p className="kicker">TRANSPARANSI KEUANGAN</p><h2>Saldo Kas</h2><strong>{formatRupiah(cashBalance)}</strong></div><button onClick={onKeuangan}>Kelola Keuangan <ChevronRight size={17} /></button><div className="financeSummaryMeta"><span><ArrowUpCircle size={15} /> Pemasukan <b>{formatRupiah(totalIncome)}</b></span><span><ArrowDownCircle size={15} /> Pengeluaran <b>{formatRupiah(totalExpense)}</b></span></div></section><section className="dataCard"><div className="cardHead"><div><h2>Riwayat Keuangan Terbaru</h2><p>{recentFinance.length ? `${recentFinance.length} transaksi terakhir` : 'Belum ada transaksi'}</p></div><button className="textButton" onClick={onKeuangan}>Lihat semua <ChevronRight size={16} /></button></div>{recentFinance.length ? <div className="financeMiniList">{recentFinance.map(item => <button className="financeMini" key={item.id} onClick={onKeuangan}><span className={item.type === 'income' ? 'financeIcon income' : 'financeIcon expense'}>{item.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}</span><div><strong>{item.category}</strong><small>{item.transaction_date} • {item.description || 'Tanpa keterangan'}</small></div><b className={item.type === 'income' ? 'incomeText' : 'expenseText'}>{item.type === 'income' ? '+' : '-'}{formatRupiah(item.amount)}</b></button>)}</div> : <EmptyState icon={<WalletCards />} title="Belum ada transaksi" text="Tambahkan pemasukan atau pengeluaran pertama dari menu Keuangan." />}</section><section className="dataCard"><div className="cardHead"><div><h2>Anggota Terbaru</h2><p>{loading ? 'Memuat data...' : `${recent.length} data terbaru`}</p></div><button className="textButton" onClick={onMembers}>Lihat semua <ChevronRight size={16} /></button></div>{recent.length ? <div className="miniList">{recent.map(m => <MiniMember key={m.id} member={m} />)}</div> : <EmptyState icon={<Users />} title="Belum ada anggota" text="Tambahkan data anggota pertama dari menu Data Anggota." />}</section><section className="dataCard"><div className="cardHead"><div><h2>Kegiatan Terdekat</h2><p>{upcoming.length ? `${upcoming.length} agenda berikutnya` : 'Belum ada agenda mendatang'}</p></div><button className="textButton" onClick={onKegiatan}>Lihat semua <ChevronRight size={16} /></button></div>{upcoming.length ? <div className="dashboardEventList">{upcoming.map(e => <button className="dashboardEvent" key={e.id} onClick={onKegiatan}><div className="eventDate"><strong>{e.event_date.slice(8,10)}</strong><span>{new Date(`${e.event_date}T12:00:00`).toLocaleDateString('id-ID',{month:'short'})}</span></div><div><strong>{e.title}</strong><span>{e.location || 'Lokasi belum diisi'}</span><small>{e.start_time ? e.start_time.slice(0,5) : 'Waktu belum diisi'} • {statusLabel(e.status)}</small></div><ChevronRight size={17} /></button>)}</div> : <EmptyState icon={<CheckCircle2 />} title="Belum ada kegiatan" text="Tambahkan agenda pertama dari menu Data Kegiatan." />}</section><section className="dataCard"><div className="cardHead"><div><h2>Struktur Pengurus</h2><p>Ringkasan kepengurusan</p></div><button className="textButton" onClick={onPengurus}>Kelola <ChevronRight size={16} /></button></div>{pengurus.length ? <div className="structurePreview">{pengurus.slice(0,4).map(p => <div key={p.id}><div className="avatar">{initials(p.full_name)}</div><div><strong>{p.full_name}</strong><span>{p.position}{p.division ? ` • ${p.division}` : ''}</span></div></div>)}</div> : <EmptyState icon={<BriefcaseBusiness />} title="Belum ada data pengurus" text="Jalankan SQL persiapan lalu tambahkan pengurus." />}</section></div>; }
function AboutPage({ about, onEdit }: { about: AboutContent; onEdit: () => void }) { return <div className="pageIntro"><div className="introTop"><div><p className="kicker">PROFIL ORGANISASI</p><h1>Tentang Kami</h1><p>Informasi resmi IPNU-IPPNU Tembok Kidul yang bisa diperbarui oleh pengurus.</p></div><button className="primaryBtn" onClick={onEdit}><Edit3 size={18} /> Edit Tentang Kami</button></div><section className="aboutAdminHero"><p>{about.profile}</p></section><div className="aboutAdminGrid"><section className="aboutAdminCard"><span className="aboutAdminIcon">🎯</span><h2>Visi</h2><p>{about.vision}</p></section><section className="aboutAdminCard"><span className="aboutAdminIcon">🚀</span><h2>Misi</h2><ul>{about.missions.map((item,index)=><li key={index}>{item}</li>)}</ul></section><section className="aboutAdminCard"><span className="aboutAdminIcon">🌱</span><h2>Tujuan Organisasi</h2><ul>{about.goals.map((item,index)=><li key={index}>{item}</li>)}</ul></section><section className="aboutAdminCard aboutAdminActivities"><span className="aboutAdminIcon">👥</span><h2>Peran & Kegiatan</h2><div className="aboutAdminActivityGrid">{about.activities.map((item,index)=><article key={index}><strong>{item.title}</strong><p>{item.description}</p></article>)}</div></section><section className="aboutAdminCard aboutAdminContact"><span className="aboutAdminIcon">📍</span><h2>Kontak & Sekretariat</h2><p>{about.address}</p><div className="aboutAdminContacts"><span>Instagram: {about.instagram}</span><span>Email: {about.email}</span><span>TikTok: {about.tiktok}</span><span>YouTube: {about.youtube}</span></div></section></div></div>; }
function AboutModal({ about, setAbout, saving, onClose, onSubmit }: { about: AboutContent; setAbout: (v: AboutContent) => void; saving: boolean; onClose: () => void; onSubmit: (e: FormEvent) => void }) { const updateMission = (index:number,value:string) => setAbout({ ...about, missions: about.missions.map((x,i)=>i===index?value:x) }); const updateGoal = (index:number,value:string) => setAbout({ ...about, goals: about.goals.map((x,i)=>i===index?value:x) }); const updateActivity = (index:number,key:'title'|'description',value:string) => setAbout({ ...about, activities: about.activities.map((x,i)=>i===index?{...x,[key]:value}:x) }); const addMission = () => setAbout({ ...about, missions: [...about.missions, ''] }); const removeMission = (index:number) => setAbout({ ...about, missions: about.missions.filter((_,i)=>i!==index) }); const addGoal = () => setAbout({ ...about, goals: [...about.goals, ''] }); const removeGoal = (index:number) => setAbout({ ...about, goals: about.goals.filter((_,i)=>i!==index) }); const addActivity = () => setAbout({ ...about, activities: [...about.activities, { title: '', description: '' }] }); const removeActivity = (index:number) => setAbout({ ...about, activities: about.activities.filter((_,i)=>i!==index) }); return <Modal title="Edit Tentang Kami" subtitle="Perbarui profil organisasi, visi, misi, tujuan, kegiatan rutin, dan kontak ranting." onClose={onClose} wide><form onSubmit={onSubmit}><div className="formGrid aboutFormGrid"><label className="field fullField">Profil / Sejarah Singkat<textarea value={about.profile} onChange={e=>setAbout({...about,profile:e.target.value})}/></label><label className="field fullField">Visi<textarea value={about.vision} onChange={e=>setAbout({...about,vision:e.target.value})}/></label><div className="aboutArrayHeader fullField"><strong>Misi</strong><button type="button" className="aboutAddBtn" onClick={addMission}><Plus size={15}/> Tambah Misi</button></div>{about.missions.map((item,index)=><div className="aboutDynamicField fullField" key={`mission-${index}`}><label className="field">Misi {index+1}<textarea value={item} onChange={e=>updateMission(index,e.target.value)}/></label><button type="button" className="aboutRemoveBtn" onClick={()=>removeMission(index)} disabled={about.missions.length<=1}><Trash2 size={15}/></button></div>)}<div className="aboutArrayHeader fullField"><strong>Tujuan Organisasi</strong><button type="button" className="aboutAddBtn" onClick={addGoal}><Plus size={15}/> Tambah Tujuan</button></div>{about.goals.map((item,index)=><div className="aboutDynamicField fullField" key={`goal-${index}`}><label className="field">Tujuan {index+1}<textarea value={item} onChange={e=>updateGoal(index,e.target.value)}/></label><button type="button" className="aboutRemoveBtn" onClick={()=>removeGoal(index)} disabled={about.goals.length<=1}><Trash2 size={15}/></button></div>)}<div className="aboutArrayHeader fullField"><strong>Peran & Kegiatan</strong><button type="button" className="aboutAddBtn" onClick={addActivity}><Plus size={15}/> Tambah Kegiatan</button></div>{about.activities.map((item,index)=><div className="aboutActivityForm fullField" key={`activity-${index}`}><label className="field">Nama Kegiatan<input value={item.title} onChange={e=>updateActivity(index,'title',e.target.value)} /></label><label className="field">Deskripsi Kegiatan<textarea value={item.description} onChange={e=>updateActivity(index,'description',e.target.value)} /></label><button type="button" className="aboutRemoveBtn" onClick={()=>removeActivity(index)} disabled={about.activities.length<=1}><Trash2 size={15}/> Hapus</button></div>)}<label className="field fullField">Alamat Sekretariat<textarea value={about.address} onChange={e=>setAbout({...about,address:e.target.value})}/></label><Field label="Instagram" value={about.instagram} placeholder="@akun" onChange={v=>setAbout({...about,instagram:v})}/><Field label="Email" value={about.email} placeholder="email@contoh.com" type="email" onChange={v=>setAbout({...about,email:v})}/><Field label="TikTok" value={about.tiktok} placeholder="@akun" onChange={v=>setAbout({...about,tiktok:v})}/><Field label="YouTube" value={about.youtube} placeholder="@channel" onChange={v=>setAbout({...about,youtube:v})}/></div><ModalFoot saving={saving} onClose={onClose} label="Simpan Tentang Kami"/></form></Modal>; }
function getAutomaticEventStatus(event: Pick<EventItem, 'event_date' | 'start_time' | 'end_time'>, now = new Date()): 'scheduled' | 'ongoing' | 'completed' { if (!event.event_date) return 'scheduled'; const [year, month, day] = event.event_date.split('-').map(Number); const eventDay = new Date(year, month - 1, day); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); if (eventDay > today) return 'scheduled'; if (eventDay < today) return 'completed'; if (event.end_time) { const [hour, minute] = event.end_time.split(':').map(Number); const end = new Date(year, month - 1, day, hour, minute); if (now >= end) return 'completed'; } if (event.start_time) { const [hour, minute] = event.start_time.split(':').map(Number); const start = new Date(year, month - 1, day, hour, minute); if (now < start) return 'scheduled'; } return 'ongoing'; }
function withAutomaticEventStatus(event: EventItem): EventItem { return { ...event, status: getAutomaticEventStatus(event) }; }
function formatRupiah(value: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value); }
function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) { return <div className="statCard"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>; }
function MiniMember({ member }: { member: Member }) { return <div className="miniMember"><div className="avatar">{initials(member.full_name)}</div><div><strong>{member.full_name}</strong><span>{member.member_code} • {member.village || 'Desa belum diisi'}</span></div><b className="status">{member.status === 'active' ? 'Aktif' : member.status || '—'}</b></div>; }
function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="emptyState"><span>{icon}</span><strong>{title}</strong><p>{text}</p></div>; }
function MemberPage({ members, search, setSearch, loading, onRefresh, onAdd, onEdit, onDelete }: { members: Member[]; search: string; setSearch: (v:string)=>void; loading:boolean; onRefresh:()=>void; onAdd:()=>void; onEdit:(m:Member)=>void; onDelete:(m:Member)=>void }) { return <div className="pageIntro"><div className="introTop"><div><p className="kicker">DATABASE RANTING</p><h1>Data Anggota</h1><p>Tambah, cari, edit, dan rapikan data anggota.</p></div><button className="primaryBtn" onClick={onAdd}><Plus size={18} /> Tambah Anggota</button></div><section className="dataCard"><div className="cardHead"><div><h2>Semua Anggota</h2><p>{members.length} data ditemukan</p></div><div className="toolbar"><div className="searchBox"><Search size={17} /><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama, kode, desa..." /></div><button className="squareBtn" onClick={onRefresh} title="Muat ulang"><RefreshCw size={17} /></button></div></div>{loading ? <div className="emptyState"><div className="spinner" /><p>Memuat data anggota...</p></div> : members.length ? <div className="memberList">{members.map(m=><div className="memberCard" key={m.id}><div className="avatar">{initials(m.full_name)}</div><div className="memberInfo"><strong>{m.full_name}</strong><span>{m.member_code}{m.nia ? ` • NIA ${m.nia}` : ''}</span><small>{m.village || 'Desa belum diisi'}{m.phone ? ` • ${m.phone}` : ''}</small>{m.email && <small>{m.email}</small>}</div><div className="memberCardActions"><b className="status">{m.status === 'active' ? 'Aktif' : m.status || '—'}</b><button onClick={()=>onEdit(m)}><Edit3 size={15}/> Edit</button><button className="dangerBtn" onClick={()=>onDelete(m)}><Trash2 size={15}/></button></div></div>)}</div> : <EmptyState icon={<Users />} title="Belum ada data anggota" text="Klik Tambah Anggota untuk memasukkan data pertama." />}</section></div>; }
function PengurusPage({ pengurus, search, setSearch, loading, onRefresh, onAdd, onEdit, onDelete }: { pengurus:Pengurus[]; search:string; setSearch:(v:string)=>void; loading:boolean; onRefresh:()=>void; onAdd:()=>void; onEdit:(p:Pengurus)=>void; onDelete:(p:Pengurus)=>void }) { return <div className="pageIntro"><div className="introTop"><div><p className="kicker">KEPENGURUSAN</p><h1>Data Pengurus</h1><p>Atur jabatan, bidang, periode, dan status pengurus.</p></div><button className="primaryBtn" onClick={onAdd}><Plus size={18}/> Tambah Pengurus</button></div><section className="dataCard"><div className="cardHead"><div><h2>Struktur Pengurus</h2><p>{pengurus.length} data ditemukan</p></div><div className="toolbar"><div className="searchBox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama, jabatan, bidang..."/></div><button className="squareBtn" onClick={onRefresh}><RefreshCw size={17}/></button></div></div>{loading ? <div className="emptyState"><div className="spinner"/><p>Memuat data pengurus...</p></div> : pengurus.length ? <div className="pengurusList">{pengurus.map(p=><div className="pengurusCard" key={p.id}><div className="avatar large">{initials(p.full_name)}</div><div className="memberInfo"><strong>{p.full_name}</strong><span className="position">{p.position}</span><small>{p.division || 'Bidang belum diisi'}{p.period ? ` • ${p.period}` : ''}{p.phone ? ` • ${p.phone}` : ''}{p.member_id ? ' • Terhubung anggota' : ' • Belum terhubung'}</small></div><div className="memberCardActions"><b className="status">{p.status === 'active' ? 'Aktif' : p.status || '—'}</b><button onClick={()=>onEdit(p)}><Edit3 size={15}/> Edit</button><button className="dangerBtn" onClick={()=>onDelete(p)}><Trash2 size={15}/></button></div></div>)}</div> : <EmptyState icon={<BriefcaseBusiness />} title="Belum ada data pengurus" text="Tambahkan pengurus pertama untuk mulai menyusun struktur." />}</section></div>; }
function EventPage({ events, search, setSearch, loading, onRefresh, onAdd, onEdit, onDelete, onDetail }: { events:EventItem[]; search:string; setSearch:(v:string)=>void; loading:boolean; onRefresh:()=>void; onAdd:()=>void; onEdit:(e:EventItem)=>void; onDelete:(e:EventItem)=>void; onDetail:(e:EventItem)=>void }) { return <div className="pageIntro"><div className="introTop"><div><p className="kicker">AGENDA RANTING</p><h1>Data Kegiatan</h1><p>Catat kegiatan, pamflet, dan bukti dokumentasi setiap acara.</p></div><button className="primaryBtn" onClick={onAdd}><Plus size={18}/> Tambah Kegiatan</button></div><section className="dataCard"><div className="cardHead"><div><h2>Semua Kegiatan</h2><p>{events.length} data ditemukan</p></div><div className="toolbar"><div className="searchBox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari kegiatan, lokasi, tanggal..."/></div><button className="squareBtn" onClick={onRefresh} title="Muat ulang"><RefreshCw size={17}/></button></div></div>{loading ? <div className="emptyState"><div className="spinner"/><p>Memuat data kegiatan...</p></div> : events.length ? <div className="eventList">{events.map(e=><div className="eventCard eventCardClickable" key={e.id} onClick={()=>onDetail(e)}><div className="eventDate"><strong>{e.event_date.slice(8,10)}</strong><span>{new Date(`${e.event_date}T12:00:00`).toLocaleDateString('id-ID',{month:'short'})}</span></div><div className="memberInfo"><strong>{e.title}</strong><span>{e.location || 'Lokasi belum diisi'}</span><small>{e.event_date}{e.start_time ? ` • ${e.start_time.slice(0,5)}` : ''}{e.end_time ? `-${e.end_time.slice(0,5)}` : ''} • {e.status === 'scheduled' ? 'Terjadwal' : e.status === 'ongoing' ? 'Berlangsung' : e.status === 'completed' ? 'Selesai' : e.status === 'cancelled' ? 'Dibatalkan' : 'Draft'}</small>{e.description && <small>{e.description}</small>}{e.pamphlet_url && <div className="imageStrip"><img src={e.pamphlet_url} alt={`Pamflet ${e.title}`} /><div>{(e.documentation_urls ?? []).slice(0,4).map((url,index)=><img key={`${url}-${index}`} src={url} alt={`Dokumentasi ${e.title} ${index + 1}`} />)}</div></div>}</div><div className="memberCardActions"><button onClick={ev=>{ev.stopPropagation(); onEdit(e);}}><Edit3 size={15}/> Edit</button><button className="dangerBtn" onClick={ev=>{ev.stopPropagation(); onDelete(e);}}><Trash2 size={15}/></button></div></div>)}</div> : <EmptyState icon={<CheckCircle2 />} title="Belum ada kegiatan" text="Klik Tambah Kegiatan untuk memasukkan agenda pertama." />}</section></div>; }
function EventDetailModal({ event, onClose, onEdit }: { event: EventItem; onClose:()=>void; onEdit:()=>void }) { const statusLabel = event.status === 'scheduled' ? 'Terjadwal' : event.status === 'ongoing' ? 'Berlangsung' : event.status === 'completed' ? 'Selesai' : event.status === 'cancelled' ? 'Dibatalkan' : 'Draft'; const docs = event.documentation_urls ?? []; const dateLabel = new Date(`${event.event_date}T12:00:00`).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); const timeLabel = event.start_time ? `${event.start_time.slice(0,5)}${event.end_time ? ` - ${event.end_time.slice(0,5)}` : ''}` : 'Waktu belum diisi'; return <Modal title="Detail Kegiatan" subtitle="Informasi lengkap dan arsip kegiatan ranting." wide onClose={onClose}><div className="eventDetail"><div className="eventDetailHero"><div><span className="eventDetailEyebrow">ARSIP KEGIATAN</span><h1>{event.title}</h1><p>Informasi dan dokumentasi kegiatan yang tersimpan di RantingHub.</p></div><b className="eventDetailStatus">{statusLabel}</b></div><section className="eventDetailInfo"><div><span>Tanggal</span><strong>{dateLabel}</strong></div><div><span>Waktu</span><strong>{timeLabel}</strong></div><div><span>Lokasi</span><strong>{event.location || 'Lokasi belum diisi'}</strong></div><div><span>Status</span><strong>{statusLabel}</strong></div></section><section className="eventDetailSection"><div className="eventDetailSectionHead"><div><span className="eventDetailLabel">MEDIA UTAMA</span><h3>Pamflet Kegiatan</h3></div><small>{event.pamphlet_url ? '1 gambar tersimpan' : 'Belum ada gambar'}</small></div>{event.pamphlet_url ? <img className="eventDetailPamphlet" src={event.pamphlet_url} alt={`Pamflet ${event.title}`} /> : <p className="eventDetailEmpty">Belum ada pamflet untuk kegiatan ini.</p>}</section><section className="eventDetailSection"><div className="eventDetailSectionHead"><div><span className="eventDetailLabel">ARSIP FOTO</span><h3>Dokumentasi Kegiatan</h3></div><small>{docs.length ? `${docs.length} foto tersimpan` : 'Belum ada dokumentasi'}</small></div>{docs.length ? <div className="eventDetailGallery">{docs.map((url,index)=><img key={`${url}-${index}`} src={url} alt={`Dokumentasi ${event.title} ${index + 1}`} />)}</div> : <p className="eventDetailEmpty">Dokumentasi bisa ditambahkan setelah kegiatan selesai.</p>}</section><section className="eventDetailSection"><div className="eventDetailSectionHead"><div><span className="eventDetailLabel">CATATAN</span><h3>Keterangan Kegiatan</h3></div></div><div className="eventDetailDescription">{event.description || 'Belum ada keterangan kegiatan.'}</div></section><div className="eventDetailActions"><button className="secondaryBtn" onClick={onClose}>Tutup</button><button className="primaryBtn" onClick={onEdit}><Edit3 size={16}/> Edit Kegiatan</button></div></div></Modal>; }
function FinancePage({ finance, search, setSearch, loading, totalIncome, totalExpense, cashBalance, onRefresh, onAdd, onEdit, onDelete }: { finance:FinanceItem[]; search:string; setSearch:(v:string)=>void; loading:boolean; totalIncome:number; totalExpense:number; cashBalance:number; onRefresh:()=>void; onAdd:()=>void; onEdit:(item:FinanceItem)=>void; onDelete:(item:FinanceItem)=>void }) { return <div className="pageIntro"><div className="introTop"><div><p className="kicker">TRANSPARANSI RANTING</p><h1>Keuangan</h1><p>Catat pemasukan, pengeluaran, dan lihat saldo kas secara otomatis.</p></div><button className="primaryBtn" onClick={onAdd}><Plus size={18}/> Tambah Transaksi</button></div><div className="financeStats"><div><ArrowUpCircle/><small>Total Pemasukan</small><strong>{formatRupiah(totalIncome)}</strong></div><div><ArrowDownCircle/><small>Total Pengeluaran</small><strong>{formatRupiah(totalExpense)}</strong></div><div><WalletCards/><small>Saldo Kas</small><strong>{formatRupiah(cashBalance)}</strong></div></div><section className="dataCard"><div className="cardHead"><div><h2>Riwayat Transaksi</h2><p>{finance.length} data ditemukan</p></div><div className="toolbar"><div className="searchBox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari kategori, keterangan, tanggal..." /></div><button className="squareBtn" onClick={onRefresh} title="Muat ulang"><RefreshCw size={17} /></button></div></div>{loading ? <div className="emptyState"><div className="spinner" /><p>Memuat data keuangan...</p></div> : finance.length ? <div className="financeList">{finance.map(item => <div className="financeRow" key={item.id}><div className={item.type === 'income' ? 'financeIcon income' : 'financeIcon expense'}>{item.type === 'income' ? <ArrowUpCircle size={19}/> : <ArrowDownCircle size={19}/>}</div><div className="memberInfo"><strong>{item.category}</strong><span>{item.transaction_date} • {item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span><small>{item.description || 'Tanpa keterangan'}</small></div><b className={item.type === 'income' ? 'incomeText' : 'expenseText'}>{item.type === 'income' ? '+' : '-'}{formatRupiah(item.amount)}</b><div className="memberCardActions"><button onClick={()=>onEdit(item)}><Edit3 size={15}/> Edit</button><button className="dangerBtn" onClick={()=>onDelete(item)}><Trash2 size={15}/></button></div></div>)}</div> : <EmptyState icon={<WalletCards />} title="Belum ada transaksi" text="Klik Tambah Transaksi untuk mulai mencatat kas ranting." />}</section></div>; }
function FinanceModal({ editing, form, setForm, saving, error, onClose, onSubmit }: { editing:FinanceItem|null; form:FinanceForm; setForm:(v:FinanceForm)=>void; saving:boolean; error:string; onClose:()=>void; onSubmit:(e:FormEvent)=>void }) { return <Modal title={editing?'Edit Transaksi':'Tambah Transaksi'} subtitle="Semua pemasukan dan pengeluaran disimpan sebagai riwayat kas ranting." onClose={onClose}><form onSubmit={onSubmit}><div className="formGrid"><Field label="Tanggal *" value={form.transaction_date} placeholder="YYYY-MM-DD" type="date" required onChange={v=>setForm({...form,transaction_date:v})}/><SelectField label="Jenis Transaksi *" value={form.type} options={['income','expense']} onChange={v=>setForm({...form,type:v as 'income' | 'expense'})}/><Field label="Kategori *" value={form.category} placeholder="Iuran anggota / Konsumsi" required onChange={v=>setForm({...form,category:v})}/><Field label="Nominal *" value={form.amount} placeholder="50000" required onChange={v=>setForm({...form,amount:v})}/><label className="field fullField">Keterangan<textarea value={form.description} placeholder="Keterangan transaksi" onChange={e=>setForm({...form,description:e.target.value})}/></label></div>{error&&<div className="modalError"><AlertCircle size={17}/>{error}</div>}<ModalFoot saving={saving} onClose={onClose} label="Simpan Transaksi"/></form></Modal>; }
function EventModal({ editing, form, setForm, saving, error, onClose, onSubmit }: { editing:EventItem|null; form:EventForm; setForm:(v:EventForm)=>void; saving:boolean; error:string; onClose:()=>void; onSubmit:(e:FormEvent)=>void }) { const previewStatus = getAutomaticEventStatus(form); const previewLabel = previewStatus === 'ongoing' ? 'Berlangsung' : previewStatus === 'completed' ? 'Selesai' : 'Terjadwal'; const pendingPamphletPreview = useMemo(() => form.pamphlet_file ? URL.createObjectURL(form.pamphlet_file) : null, [form.pamphlet_file]); const pendingDocumentationPreviews = useMemo(() => form.documentation_files.map(file => ({ file, url: URL.createObjectURL(file) })), [form.documentation_files]); useEffect(() => () => { if (pendingPamphletPreview) URL.revokeObjectURL(pendingPamphletPreview); pendingDocumentationPreviews.forEach(item => URL.revokeObjectURL(item.url)); }, [pendingPamphletPreview, pendingDocumentationPreviews]); const removePamphlet = () => { if (form.pamphlet_url) setForm({ ...form, pamphlet_url: null, removed_pamphlet_url: form.removed_pamphlet_url ?? form.pamphlet_url }); else setForm({ ...form, pamphlet_file: null }); }; const removeDocumentation = (url: string) => { setForm({ ...form, documentation_urls: form.documentation_urls.filter(item => item !== url), removed_documentation_urls: form.removed_documentation_urls.includes(url) ? form.removed_documentation_urls : [...form.removed_documentation_urls, url] }); }; const removePendingDocumentation = (index: number) => { setForm({ ...form, documentation_files: form.documentation_files.filter((_, itemIndex) => itemIndex !== index) }); }; return <Modal title={editing?'Edit Kegiatan':'Tambah Kegiatan'} subtitle="Status kegiatan ditentukan otomatis dari tanggal dan waktu. Tidak perlu dipilih manual." onClose={onClose}><form onSubmit={onSubmit}><div className="formGrid"><Field label="Judul Kegiatan *" value={form.title} placeholder="Rapat Rutin Ranting" required onChange={v=>setForm({...form,title:v})}/><Field label="Tanggal Kegiatan *" value={form.event_date} placeholder="YYYY-MM-DD" type="date" required onChange={v=>setForm({...form,event_date:v})}/><Field label="Mulai" value={form.start_time} placeholder="19:30" type="time" onChange={v=>setForm({...form,start_time:v})}/><Field label="Selesai" value={form.end_time} placeholder="21:30" type="time" onChange={v=>setForm({...form,end_time:v})}/><Field label="Lokasi" value={form.location} placeholder="Balai Desa" onChange={v=>setForm({...form,location:v})}/><div className="field"><span>Status Otomatis</span><div className={`automaticStatusBadge ${previewStatus}`}>{previewLabel}</div><small className="automaticStatusHint">Sebelum hari H: Terjadwal • hari H: Berlangsung • setelah selesai/lewat: Selesai</small></div><div className="field fullField imageUploadField"><span>Pamflet Kegiatan</span>{form.pamphlet_url && <div className="photoManageCard"><img className="uploadPreview single" src={form.pamphlet_url} alt="Pamflet kegiatan tersimpan" /><button type="button" className="imageRemoveBtn" onClick={removePamphlet}><Trash2 size={14}/> Hapus foto</button></div>}{pendingPamphletPreview && <div className="photoManageCard pending"><img className="uploadPreview single" src={pendingPamphletPreview} alt="Pamflet baru yang dipilih" /><button type="button" className="imageRemoveBtn" onClick={()=>setForm({...form,pamphlet_file:null})}><X size={14}/> Batal foto baru</button></div>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setForm({...form,pamphlet_file:e.target.files?.[0] ?? null})}/><small>1 gambar • JPG, PNG, WebP • maksimal 5 MB • foto yang tersimpan bisa dihapus</small></div><div className="field fullField imageUploadField"><span>Dokumentasi Kegiatan</span>{form.documentation_urls.length > 0 && <div className="uploadGallery">{form.documentation_urls.map((url,index)=><div className="photoManageCard" key={`${url}-${index}`}><img className="uploadPreview" src={url} alt={`Dokumentasi ${index + 1}`} /><button type="button" className="imageRemoveBtn compact" onClick={()=>removeDocumentation(url)}><Trash2 size={13}/> Hapus</button></div>)}</div>}{pendingDocumentationPreviews.length > 0 && <div className="uploadGallery pendingGallery">{pendingDocumentationPreviews.map((item,index)=><div className="photoManageCard pending" key={`${item.file.name}-${item.file.size}-${index}`}><img className="uploadPreview" src={item.url} alt={`Foto baru ${index + 1}`} /><button type="button" className="imageRemoveBtn compact" onClick={()=>removePendingDocumentation(index)}><X size={13}/> Batal</button></div>)}</div>}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>setForm({...form,documentation_files:Array.from(e.target.files ?? [])})}/><small>Bisa beberapa gambar • tambahkan lagi saat acara sudah selesai • maksimal 5 MB per gambar • foto tersimpan bisa dihapus</small></div><label className="field fullField">Deskripsi<textarea value={form.description} placeholder="Catatan atau keterangan kegiatan" onChange={e=>setForm({...form,description:e.target.value})}/></label></div>{error&&<div className="modalError"><AlertCircle size={17}/>{error}</div>}<ModalFoot saving={saving} onClose={onClose} label="Simpan Kegiatan"/></form></Modal>; }
function MemberModal({ editing, form, setForm, saving, error, onClose, onSubmit }: { editing:Member|null; form:FormState; setForm:(v:FormState)=>void; saving:boolean; error:string; onClose:()=>void; onSubmit:(e:FormEvent)=>void }) { return <Modal title={editing?'Edit Anggota':'Tambah Anggota'} subtitle="Lengkapi identitas dan data organisasi anggota." onClose={onClose}><form onSubmit={onSubmit}><div className="formGrid"><Field label="Kode Anggota *" value={form.member_code} placeholder="IPNU-001" required onChange={v=>setForm({...form,member_code:v})}/><Field label="NIA" value={form.nia} placeholder="Opsional" onChange={v=>setForm({...form,nia:v})}/><Field label="Nama Lengkap *" value={form.full_name} placeholder="Nama anggota" required onChange={v=>setForm({...form,full_name:v})}/><Field label="Nama Panggilan" value={form.nickname} placeholder="Panggilan" onChange={v=>setForm({...form,nickname:v})}/><SelectField label="Jenis Kelamin" value={form.gender} options={['Laki-laki','Perempuan']} onChange={v=>setForm({...form,gender:v})}/><Field label="Tempat Lahir" value={form.birth_place} placeholder="Brebes" onChange={v=>setForm({...form,birth_place:v})}/><Field label="Tanggal Lahir" value={form.birth_date} placeholder="YYYY-MM-DD" type="date" onChange={v=>setForm({...form,birth_date:v})}/><Field label="Alamat" value={form.address} placeholder="Alamat lengkap" onChange={v=>setForm({...form,address:v})}/><Field label="Desa/Kelurahan" value={form.village} placeholder="Tembok Kidul" onChange={v=>setForm({...form,village:v})}/><Field label="No. HP" value={form.phone} placeholder="08xxxxxxxxxx" inputMode="tel" onChange={v=>setForm({...form,phone:v})}/><Field label="Email" value={form.email} placeholder="nama@email.com" type="email" onChange={v=>setForm({...form,email:v})}/><Field label="Tanggal Masuk" value={form.join_date} placeholder="YYYY-MM-DD" type="date" onChange={v=>setForm({...form,join_date:v})}/><SelectField label="Status" value={form.status} options={['active','nonactive']} onChange={v=>setForm({...form,status:v})}/></div>{error&&<div className="modalError"><AlertCircle size={17}/>{error}</div>}<ModalFoot saving={saving} onClose={onClose} label="Simpan Anggota"/></form></Modal>; }
function PengurusModal({ editing, form, members, setForm, saving, error, onClose, onSubmit }: { editing:Pengurus|null; form:PengurusForm; members:Member[]; setForm:(v:PengurusForm)=>void; saving:boolean; error:string; onClose:()=>void; onSubmit:(e:FormEvent)=>void }) { return <Modal title={editing?'Edit Pengurus':'Tambah Pengurus'} subtitle="Pilih anggota dari database lalu tentukan jabatan dan bidang." onClose={onClose}><form onSubmit={onSubmit}><div className="formGrid"><SelectMemberField label="Anggota *" value={form.member_id} members={members} onChange={v=>{const m=members.find(item=>item.id===v); setForm({...form,member_id:v,full_name:m?.full_name ?? ''});}}/><Field label="Nama Lengkap" value={form.full_name} placeholder="Otomatis dari anggota" onChange={v=>setForm({...form,full_name:v})}/><SelectField label="Jabatan *" value={form.position} options={['Ketua','Wakil Ketua','Sekretaris','Wakil Sekretaris','Bendahara','Wakil Bendahara','Ketua Bidang','Anggota Bidang','Anggota','Lainnya']} onChange={v=>setForm({...form,position:v})}/><Field label="Bidang / Departemen" value={form.division} placeholder="Administrasi" onChange={v=>setForm({...form,division:v})}/><Field label="Periode" value={form.period} placeholder="2026-2028" onChange={v=>setForm({...form,period:v})}/><Field label="No. HP" value={form.phone} placeholder="08xxxxxxxxxx" inputMode="tel" onChange={v=>setForm({...form,phone:v})}/><SelectField label="Status" value={form.status} options={['active','nonactive']} onChange={v=>setForm({...form,status:v})}/></div>{error&&<div className="modalError"><AlertCircle size={17}/>{error}</div>}<ModalFoot saving={saving} onClose={onClose} label="Simpan Pengurus"/></form></Modal>; }
function SelectMemberField({ label, value, members, onChange }: { label:string; value:string; members:Member[]; onChange:(v:string)=>void }) { return <label className="field">{label}<select value={value} onChange={e=>onChange(e.target.value)} required><option value="">Pilih anggota</option>{members.map(m=><option key={m.id} value={m.id}>{m.member_code} — {m.full_name}</option>)}</select></label>; }
function Modal({ title, subtitle, onClose, children, wide }: { title:string; subtitle:string; onClose:()=>void; children:ReactNode; wide?:boolean }) { return <div className="modalOverlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className={wide ? 'formModal eventDetailModal' : 'formModal'}><div className="modalHead"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="closeBtn" onClick={onClose}><X/></button></div>{children}</div></div>; }
function ModalFoot({ saving, onClose, label }: { saving:boolean; onClose:()=>void; label:string }) { return <div className="modalFoot"><button type="button" className="secondaryBtn" onClick={onClose}>Batal</button><button className="primaryBtn" disabled={saving}>{saving?'Menyimpan...':label}</button></div>; }
function Field({ label, value, placeholder, required, inputMode, type, onChange }: { label:string; value:string; placeholder:string; required?:boolean; inputMode?:'tel'; type?:'text'|'email'|'date'; onChange:(v:string)=>void }) { return <label className="field">{label}<input type={type ?? 'text'} value={value} placeholder={placeholder} required={required} inputMode={inputMode} onChange={e=>onChange(e.target.value)}/></label>; }
function SelectField({ label, value, options, onChange }: { label:string; value:string; options:string[]; onChange:(v:string)=>void }) { return <label className="field">{label}<select value={value} onChange={e=>onChange(e.target.value)}><option value="">Pilih</option>{options.map(o=><option key={o} value={o}>{o==='active'?'Aktif':o==='nonactive'?'Nonaktif':o}</option>)}</select></label>; }
function Login({ email, password, setEmail, setPassword, error, onSubmit, onBack }: { email:string; password:string; setEmail:(v:string)=>void; setPassword:(v:string)=>void; error:string; onSubmit:(e:FormEvent)=>void; onBack?:()=>void }) { return <div className="loginPage"><div className="loginBrand"><img className="brandImage loginLogo" src="/resources/logo.png" alt="Logo IPNU-IPPNU Tembok Kidul" /><div><strong>IPNU-IPPNU Tembok Kidul</strong><small>Ruang Pengurus</small></div></div><div className="loginCard"><p className="kicker">RUANG PENGURUS</p><h1>Selamat datang 👋</h1><p>Masuk untuk mengelola data anggota dan kepengurusan Ranting Tembok Kidul.</p><form onSubmit={onSubmit}><label className="field">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email pengurus" required/></label><label className="field">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></label>{error&&<div className="modalError"><AlertCircle size={17}/>{error}</div>}<button className="primaryBtn wide" type="submit">Masuk ke Dashboard <ChevronRight size={17}/></button></form>{onBack&&<button type="button" className="loginBackButton" onClick={onBack}>← Kembali ke Website</button>}<small className="loginHint">Akses dibatasi untuk akun pengurus.</small></div></div>; }
function initials(name:string) { /* Tentang Kami editor added next. */ return name.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
export default App;
