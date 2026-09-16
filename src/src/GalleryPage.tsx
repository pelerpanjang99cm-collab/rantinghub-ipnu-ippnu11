import { api } from '@appdeploy/client';
import { BookOpen, CheckCircle2, Cloud, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type EventItem = { id: string; title: string; description: string | null; event_date: string; start_time: string | null; end_time: string | null; location: string | null; status: string | null; pamphlet_url: string | null; documentation_urls: string[] | null };
type ManualAlbum = { id: string; title: string; description: string; created_at: string; photos: string[] };
type Props = { events: EventItem[]; loading: boolean; saving: boolean; onUpload: (eventId: string, files: File[]) => Promise<void>; onDelete: (event: EventItem, url: string) => Promise<void>; onUploadManual: (albumId: string, albumTitle: string, files: File[]) => Promise<string[]>; onDeleteManual: (urls: string[]) => Promise<void> };
type CloudinaryStatus = { configured: boolean; cloudName?: string; message?: string };

const STORAGE_KEY = 'ipnuippnu_tembok_kidul_gallery_albums';

function readAlbums(): ManualAlbum[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAlbums(albums: ManualAlbum[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return <div className="modalOverlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="formModal"><div className="modalHead"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="closeBtn" onClick={onClose} aria-label="Tutup"><X size={18} /></button></div>{children}</div></div>;
}

export default function GalleryPage({ events, loading, saving, onUpload, onDelete, onUploadManual, onDeleteManual }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [manualAlbums, setManualAlbums] = useState<ManualAlbum[]>(readAlbums);
  const [albumModal, setAlbumModal] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<ManualAlbum | null>(null);
  const [albumFiles, setAlbumFiles] = useState<File[]>([]);
  const [albumError, setAlbumError] = useState('');
  const [cloudinaryStatus, setCloudinaryStatus] = useState<CloudinaryStatus | null>(null);

  useEffect(() => saveAlbums(manualAlbums), [manualAlbums]);
  useEffect(() => { api.get('/api/cloudinary/status').then(result => setCloudinaryStatus(result.data as CloudinaryStatus)).catch(() => setCloudinaryStatus({ configured: false, message: 'Status Cloudinary belum dapat diperiksa.' })); }, []);

  const eventAlbums = [...events].sort((a, b) => b.event_date.localeCompare(a.event_date));
  const allAlbums = useMemo(() => [...manualAlbums, ...eventAlbums.map(event => ({ id: `event-${event.id}`, title: event.title, description: event.description ?? 'Album otomatis dari Data Kegiatan.', created_at: event.event_date, photos: event.documentation_urls ?? [], event } as ManualAlbum & { event: EventItem }))].sort((a, b) => b.created_at.localeCompare(a.created_at)), [manualAlbums, eventAlbums]);
  const totalPhotos = allAlbums.reduce((sum, album) => sum + album.photos.length, 0);
  const documented = eventAlbums.filter(event => (event.documentation_urls ?? []).length > 0).length + manualAlbums.filter(album => album.photos.length > 0).length;
  const storageReady = cloudinaryStatus?.configured === true;
  const openUpload = (event: EventItem) => { setSelectedEvent(event); setFiles([]); };
  const submitUpload = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedEvent || !files.length) return; await onUpload(selectedEvent.id, files); setSelectedEvent(null); setFiles([]); };
  const createAlbum = (e: React.FormEvent) => { e.preventDefault(); const title = albumTitle.trim(); if (!title) { setAlbumError('Nama album wajib diisi.'); return; } const album: ManualAlbum = { id: crypto.randomUUID(), title, description: albumDescription.trim(), created_at: new Date().toISOString().slice(0, 10), photos: [] }; setManualAlbums(prev => [album, ...prev]); setAlbumModal(false); setAlbumTitle(''); setAlbumDescription(''); setAlbumError(''); };
  const openManualUpload = (album: ManualAlbum) => { setSelectedAlbum(album); setAlbumFiles([]); setAlbumError(''); };
  const submitManualUpload = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedAlbum || !albumFiles.length) return; const urls = await onUploadManual(selectedAlbum.id, selectedAlbum.title, albumFiles); if (urls.length) { setManualAlbums(prev => prev.map(album => album.id === selectedAlbum.id ? { ...album, photos: [...album.photos, ...urls] } : album)); setSelectedAlbum(null); setAlbumFiles([]); } };
  const deleteManualAlbum = async (album: ManualAlbum) => { if (!window.confirm(`Hapus album ${album.title}? Semua foto di album ini juga akan dihapus.`)) return; await onDeleteManual(album.photos); setManualAlbums(prev => prev.filter(item => item.id !== album.id)); };

  return <div className="pageIntro">
    <div className="introTop"><div><p className="kicker">ARSIP VISUAL RANTING</p><h1>Galeri</h1><p>Dokumentasi kegiatan tersusun sebagai album. Foto galeri disimpan di Cloudinary agar pengelolaan file galeri terpisah dari database.</p></div><button className="primaryBtn" onClick={() => { setAlbumModal(true); setAlbumError(''); }}><Plus size={18} /> Tambah Album</button></div>
    <section className="galleryStorageCard"><div className="galleryStorageIcon"><Cloud size={20} /></div><div><strong>{storageReady ? 'Cloudinary tersambung' : 'Cloudinary belum tersambung'}</strong><p>{storageReady ? `Media galeri aktif${cloudinaryStatus?.cloudName ? ` • ${cloudinaryStatus.cloudName}` : ''}.` : cloudinaryStatus?.message ?? 'Konfigurasikan Cloudinary di AppDeploy Secrets agar upload galeri aktif.'}</p></div></section>
    <section className="galleryStats"><div><span><ImageIcon /></span><strong>{totalPhotos}</strong><small>Total Foto</small></div><div><span><BookOpen /></span><strong>{allAlbums.length}</strong><small>Total Album</small></div><div><span><CheckCircle2 /></span><strong>{documented}</strong><small>Terisi Foto</small></div></section>
    {loading ? <div className="emptyState"><div className="spinner" /><p>Memuat galeri...</p></div> : allAlbums.length ? <div className="galleryAlbumGrid">{allAlbums.map(album => { const event = 'event' in album ? album.event : null; return <section className="galleryAlbum" key={album.id}><div className="galleryAlbumHead"><div><p className="kicker">{event ? 'ALBUM KEGIATAN' : 'ALBUM MANUAL'}</p><h2>{album.title}</h2><small>{album.created_at} • {album.photos.length} foto</small>{album.description && <p className="galleryAlbumDescription">{album.description}</p>}</div><div className="galleryAlbumActions">{event ? <button className="primaryBtn" disabled={!storageReady} onClick={() => openUpload(event)}><Plus size={16} /> Tambah Foto</button> : <><button className="primaryBtn" disabled={!storageReady} onClick={() => openManualUpload(album)}><Plus size={16} /> Tambah Foto</button><button className="galleryAlbumDelete" disabled={saving} onClick={() => deleteManualAlbum(album)} title="Hapus album"><Trash2 size={16} /></button></>}</div></div>{album.photos.length ? <div className="galleryGrid">{album.photos.map((url, index) => <div className="galleryItem" key={`${url}-${index}`}><img src={url} alt={`Foto ${album.title} ${index + 1}`} />{event ? <button className="galleryDelete" disabled={saving} onClick={() => onDelete(event, url)} title="Hapus foto"><Trash2 size={15} /></button> : <button className="galleryDelete" disabled={saving} onClick={async () => { await onDeleteManual([url]); setManualAlbums(prev => prev.map(item => item.id === album.id ? { ...item, photos: item.photos.filter(photo => photo !== url) } : item)); }} title="Hapus foto"><Trash2 size={15} /></button>}</div>)}</div> : <div className="galleryEmptyAlbum"><ImageIcon size={20} /><span>Belum ada foto di album ini.</span><button disabled={!storageReady} onClick={() => event ? openUpload(event) : openManualUpload(album)}>Tambah foto pertama</button></div>}</section>; })}</div> : <div className="dataCard"><div className="emptyState"><ImageIcon size={36} /><strong>Belum ada album</strong><p>Buat album manual dengan tombol Tambah Album, atau buat kegiatan dari menu Data Kegiatan.</p></div></div>}
    {albumModal && <Modal title="Tambah Album" subtitle="Buat album manual untuk dokumentasi yang tidak harus terikat pada Data Kegiatan." onClose={() => setAlbumModal(false)}><form onSubmit={createAlbum}><div className="formGrid"><label className="field fullField">Nama Album *<input value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} placeholder="Contoh: Pelantikan Pengurus" required /></label><label className="field fullField">Deskripsi<textarea value={albumDescription} onChange={e => setAlbumDescription(e.target.value)} placeholder="Keterangan singkat album" /></label></div>{albumError && <div className="modalError"><X size={17} />{albumError}</div>}<div className="modalFoot"><button type="button" className="secondaryBtn" onClick={() => setAlbumModal(false)}>Batal</button><button className="primaryBtn">Buat Album</button></div></form></Modal>}
    {selectedEvent && <Modal title={`Tambah Foto • ${selectedEvent.title}`} subtitle="Pilih satu atau beberapa foto. Foto akan masuk ke Cloudinary dan tampil di album kegiatan." onClose={() => setSelectedEvent(null)}><form onSubmit={submitUpload}><div className="galleryUploadBox"><ImageIcon size={28} /><strong>Pilih dokumentasi</strong><p>JPG, PNG, atau WebP • maksimal 8 MB per foto sebelum kompresi</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => setFiles(Array.from(e.target.files ?? []))} /><small>{files.length ? `${files.length} foto siap diunggah` : 'Belum ada foto dipilih'}</small></div><div className="modalFoot"><button type="button" className="secondaryBtn" onClick={() => setSelectedEvent(null)}>Batal</button><button className="primaryBtn" disabled={!storageReady || saving || !files.length}>{saving ? 'Mengunggah ke Cloudinary...' : 'Simpan Foto'}</button></div></form></Modal>}
    {selectedAlbum && <Modal title={`Tambah Foto • ${selectedAlbum.title}`} subtitle="Pilih foto untuk album manual. File fisiknya disimpan di Cloudinary." onClose={() => setSelectedAlbum(null)}><form onSubmit={submitManualUpload}><div className="galleryUploadBox"><ImageIcon size={28} /><strong>Pilih foto album</strong><p>JPG, PNG, atau WebP • maksimal 8 MB per foto sebelum kompresi</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => setAlbumFiles(Array.from(e.target.files ?? []))} /><small>{albumFiles.length ? `${albumFiles.length} foto siap diunggah` : 'Belum ada foto dipilih'}</small></div>{albumError && <div className="modalError"><X size={17} />{albumError}</div>}<div className="modalFoot"><button type="button" className="secondaryBtn" onClick={() => setSelectedAlbum(null)}>Batal</button><button className="primaryBtn" disabled={!storageReady || saving || !albumFiles.length}>{saving ? 'Mengunggah ke Cloudinary...' : 'Simpan Foto'}</button></div></form></Modal>}
  </div>;
}
