import { api } from '@appdeploy/client';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type GalleryPhoto = { url: string; createdAt: string };
type GalleryAlbum = { title: string; kind: string; createdAt: string; photos: GalleryPhoto[] };

export default function PublicGalleryPage({ onBack }: { onBack: () => void }) {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    let active = true;
    api.get('/api/cloudinary/public-gallery')
      .then(result => {
        if (!active) return;
        const data = result.data as { albums?: GalleryAlbum[] };
        setAlbums(Array.isArray(data.albums) ? data.albums : []);
        setError('');
      })
      .catch(() => {
        if (active) setError('Galeri publik belum dapat dimuat. Silakan coba lagi beberapa saat.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return <main className="publicInnerPage publicGalleryPage">
    <button className="publicBackButton" onClick={onBack}><ArrowLeft size={17} /> Kembali ke Beranda</button>
    <div className="publicPageIntro">
      <span className="sectionLabel">GALERI RANTING</span>
      <h1>Jejak <em>perjalanan.</em></h1>
      <p>Dokumentasi kegiatan IPNU-IPPNU Tembok Kidul yang tersimpan sebagai album foto.</p>
    </div>

    {loading ? <div className="publicGalleryState"><ImageIcon size={30} /><strong>Memuat galeri...</strong><p>Menyiapkan dokumentasi dari Cloudinary.</p></div>
      : error ? <div className="publicGalleryState publicGalleryError"><ImageIcon size={30} /><strong>Galeri belum tersedia</strong><p>{error}</p></div>
      : albums.length === 0 ? <div className="publicGalleryState"><ImageIcon size={30} /><strong>Belum ada dokumentasi</strong><p>Foto kegiatan yang sudah dipublikasikan akan tampil di sini.</p></div>
      : <div className="publicGalleryAlbums">{albums.map(album => <section className="publicGalleryAlbum" key={album.title}>
        <div className="publicGalleryAlbumHead"><div><span className="publicAboutEyebrow">{album.kind}</span><h2>{album.title}</h2></div><span>{album.photos.length} foto</span></div>
        <div className="publicGalleryGrid">{album.photos.map((photo, index) => <button className="publicGalleryItem" key={`${photo.url}-${index}`} onClick={() => setSelectedPhoto({ url: photo.url, title: `${album.title} — Foto ${index + 1}` })} aria-label={`Buka ${album.title}, foto ${index + 1}`}><img src={photo.url} alt={`${album.title} ${index + 1}`} loading="lazy" /><span>Lihat foto</span></button>)}</div>
      </section>)}</div>}

    {selectedPhoto && <div className="publicGalleryLightbox" role="dialog" aria-modal="true" aria-label={selectedPhoto.title} onClick={() => setSelectedPhoto(null)}><div className="publicGalleryLightboxInner" onClick={event => event.stopPropagation()}><button className="publicGalleryClose" onClick={() => setSelectedPhoto(null)} aria-label="Tutup foto"><X size={20} /></button><img src={selectedPhoto.url} alt={selectedPhoto.title} /></div></div>}
  </main>;
}
