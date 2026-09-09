import React from 'react';
import { Book } from '../types';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Building, 
  Trash2, 
  Quote
} from 'lucide-react';
import { BookCover } from './BookCover';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onRequestDelete: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onRequestDelete
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!book) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#121116] border border-white/10 shadow-2xl p-6 sm:p-8 text-white scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all border border-white/[0.06] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Book Details Header with BookCover */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Book Cover Card */}
            <div className="w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
              <BookCover coverImage={book.coverImage} title={book.title} author={book.author} />
            </div>

            <div className="flex-1 pr-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-white tracking-tight">
                {book.title}
              </h2>
              <p className="text-base sm:text-lg text-amber-300 font-medium mt-1">
                {book.author}
              </p>

              {/* Spec Pills: Sadece Yıl, Sayfa Sayısı, Yayınevi */}
              <div className="flex flex-wrap gap-2 pt-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-white/[0.06] text-xs text-zinc-300 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>{book.totalPages} Sayfa</span>
                </div>

                {book.originalYear && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-white/[0.06] text-xs text-zinc-300 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{book.originalYear}</span>
                  </div>
                )}

                {book.publisher && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-white/[0.06] text-xs text-zinc-300 font-medium">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>{book.publisher}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="pt-2">
              <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
                Kitap Özeti
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed font-light">
                {book.description}
              </p>
            </div>
          )}

          {/* Quotes (if available) */}
          {book.quotes && book.quotes.length > 0 && (
            <div className="pt-3">
              <h4 className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-2.5 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" />
                <span>Öne Çıkan Alıntılar</span>
              </h4>
              <div className="space-y-2.5">
                {book.quotes.map((q, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/[0.05] text-xs sm:text-sm text-zinc-300 italic leading-relaxed"
                  >
                    "{q}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action: Delete with in-app Confirmation */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end">
            <button
              type="button"
              onClick={() => onRequestDelete(book)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              title="Kitabı Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kitabı Sil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
