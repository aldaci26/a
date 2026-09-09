import React from 'react';
import { 
  BookOpen, 
  Calendar,
  Building,
  Info,
  Trash2,
  Sparkles,
  Quote
} from 'lucide-react';
import { Book } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { BookCover } from './BookCover';

interface HomePageProps {
  books: Book[];
  selectedBookId: string;
  onSelectBook: (id: string) => void;
  onOpenDetailModal: (book: Book) => void;
  onDeleteBook: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  books,
  selectedBookId,
  onSelectBook,
  onOpenDetailModal,
  onDeleteBook
}) => {
  const currentBook = books.find((b) => b.id === selectedBookId) || books[0];

  if (!currentBook) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-400 text-sm">Kütüphanenizde henüz kitap bulunmuyor.</p>
      </div>
    );
  }

  const otherBooks = books.filter((b) => b.id !== currentBook.id);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      
      {/* 1. SEÇİLİ ODAK KİTAP (HERO SHOWCASE) */}
      <section className="relative rounded-3xl bg-zinc-900/70 border border-white/[0.08] p-6 sm:p-9 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Warm Ambient Glow */}
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-25 bg-amber-500" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-15 bg-amber-600" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Sol: Büyük Kitap Kapağı (Gerçek Kapak Görseli) */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div 
              className="relative group cursor-pointer"
              onClick={() => onOpenDetailModal(currentBook)}
              title="Detayları görüntülemek için tıklayın"
            >
              <div className="w-52 sm:w-60 h-76 sm:h-88 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative transition-transform duration-300 group-hover:scale-[1.02] bg-zinc-950 flex-shrink-0">
                <BookCover
                  coverImage={currentBook.coverImage}
                  title={currentBook.title}
                  author={currentBook.author}
                />
              </div>
              <div className="mt-3 text-center">
                <span className="text-[11px] text-zinc-400 group-hover:text-amber-300 transition-colors inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Kapağa tıklayarak detayları inceleyin</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sağ: Kitap Bilgileri */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium mb-2">
                <span>Öne Çıkan Eser</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-white tracking-normal leading-tight">
                {currentBook.title}
              </h1>
              <p className="text-base sm:text-lg text-amber-200/90 font-medium mt-1">
                {currentBook.author}
              </p>
            </div>

            {/* Bilgi Rozetleri: Sadece Yıl, Sayfa Sayısı, Yayınevi */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {currentBook.originalYear && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-white/[0.08] text-xs text-zinc-200 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentBook.originalYear}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-white/[0.08] text-xs text-zinc-200 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentBook.totalPages} Sayfa</span>
              </div>

              {currentBook.publisher && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-white/[0.08] text-xs text-zinc-200 font-medium">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentBook.publisher}</span>
                </div>
              )}
            </div>

            {/* Kitap Açıklaması */}
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light line-clamp-4 pt-1">
              {currentBook.description}
            </p>

            {/* Alıntı Bölümü */}
            {currentBook.quotes && currentBook.quotes.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-amber-500/20 relative pl-9">
                <Quote className="w-4 h-4 text-amber-400 absolute top-4 left-3" />
                <p className="text-xs sm:text-sm text-zinc-200 font-serif italic leading-relaxed">
                  "{currentBook.quotes[0]}"
                </p>
              </div>
            )}

            {/* Aksiyon Butonları: Detay & Doğrudan Çalışan Silme */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenDetailModal(currentBook)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Detayları İncele</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteBook(currentBook.id);
                  audioEngine.playChime();
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all active:scale-95"
                title="Bu kitabı kütüphaneden sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kitabı Sil</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KÜTÜPHANEDEKİ DİĞER ESERLER (KAPAK GÖRSELLİ RAF / GRID VİTRİNİ) */}
      {otherBooks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold font-serif-display text-white tracking-normal flex items-center gap-2">
              <span>Kütüphanedeki Diğer Eserler</span>
              <span className="text-xs font-sans text-zinc-400 font-normal">({otherBooks.length})</span>
            </h2>
            <span className="text-xs text-zinc-400">Okumak istediğiniz esere tıklayarak odaklanın</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {otherBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => {
                  audioEngine.playPageTurn();
                  onSelectBook(book.id);
                }}
                className="group relative rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/[0.06] hover:border-amber-500/40 p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/10"
              >
                {/* Kitap Kapağı */}
                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md bg-zinc-950 mb-2.5 relative flex-shrink-0">
                  <BookCover
                    coverImage={book.coverImage}
                    title={book.title}
                    author={book.author}
                  />

                  {/* Silme Tuşu (Hover/Touch) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBook(book.id);
                      audioEngine.playChime();
                    }}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                    title="Bu kitabı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Başlık ve Bilgiler */}
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {book.author}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/[0.04]">
                    <span>{book.originalYear || '—'}</span>
                    <span>{book.totalPages} sf.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
