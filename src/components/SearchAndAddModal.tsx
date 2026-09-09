import React, { useState, useEffect, useMemo } from 'react';
import { Book } from '../types';
import { 
  Search, 
  X, 
  Plus, 
  Check, 
  Sparkles, 
  Loader2,
  BookOpen,
  BookMarked
} from 'lucide-react';
import { generateQuotesForBook } from '../utils/quoteGenerator';
import { audioEngine } from '../utils/audioEngine';
import { getRecommendations } from '../utils/recommendationEngine';
import { BookCover } from './BookCover';

interface SearchAndAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBooks: Book[];
  onSelectExistingBook: (book: Book) => void;
  onAddOnlineBook: (book: Book) => void;
}

interface OnlineResult {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  originalYear: number;
  publisher: string;
  coverImage: string;
  description: string;
}

export const SearchAndAddModal: React.FC<SearchAndAddModalProps> = ({
  isOpen,
  onClose,
  existingBooks,
  onSelectExistingBook,
  onAddOnlineBook
}) => {
  const [query, setQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<OnlineResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const recommendations = useMemo(() => {
    return getRecommendations(existingBooks);
  }, [existingBooks]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setOnlineResults([]);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search via Open Library API + Fallback catalog
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setOnlineResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=10`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          const parsed: OnlineResult[] = data.docs.map((doc: any, index: number) => {
            const title = doc.title || 'İsimsiz Eser';
            const author = doc.author_name ? doc.author_name[0] : 'Bilinmeyen Yazar';
            const pages = doc.number_of_pages_median || (doc.number_of_pages ? doc.number_of_pages[0] : 240);
            const originalYear = doc.first_publish_year || 1950;
            const publisher = doc.publisher ? doc.publisher[0] : 'Kültür Yayınları';
            const coverImage = doc.cover_i 
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg?default=false`
              : (doc.isbn && doc.isbn[0] ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg?default=false` : '');

            return {
              id: `ol-${doc.key?.replace('/works/', '') || index}-${Date.now()}`,
              title,
              author,
              totalPages: pages > 0 ? pages : 240,
              originalYear,
              publisher,
              coverImage,
              description: `${title}, ${author} tarafından kaleme alınmış ve ilk olarak ${originalYear} yılında yayımlanmış seçkin bir eserdir.`
            };
          });

          setOnlineResults(parsed);
        } else {
          setOnlineResults([]);
        }
      } catch {
        // Fallback from recommendation catalog
        const localMatches = recommendations
          .filter(r => 
            r.title.toLowerCase().includes(trimmed.toLowerCase()) || 
            r.author.toLowerCase().includes(trimmed.toLowerCase())
          )
          .map(r => ({
            id: r.id,
            title: r.title,
            author: r.author,
            totalPages: r.totalPages,
            originalYear: r.originalYear,
            publisher: r.publisher,
            coverImage: r.coverImage || '',
            description: r.description
          }));
        setOnlineResults(localMatches);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, recommendations]);

  if (!isOpen) return null;

  // Filter existing library books
  const libraryMatches = query.trim()
    ? existingBooks.filter(
        b =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleAddOnline = (item: OnlineResult | { id: string; title: string; author: string; totalPages: number; originalYear: number; publisher: string; coverImage?: string; description: string; quotes?: string[] }) => {
    audioEngine.playChime();
    setAddedIds(prev => ({ ...prev, [item.id]: true }));

    const newBook: Book = {
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: item.title,
      author: item.author,
      totalPages: item.totalPages,
      originalYear: item.originalYear,
      publisher: item.publisher,
      coverImage: ('coverImage' in item && item.coverImage) ? item.coverImage : '',
      description: item.description,
      quotes: ('quotes' in item && item.quotes && item.quotes.length > 0) ? item.quotes : generateQuotesForBook(item.title, item.author),
      dateAdded: new Date().toISOString()
    };

    onAddOnlineBook(newBook);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#121116] border border-white/10 shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Search Input */}
        <div className="p-4 sm:p-6 border-b border-white/[0.08] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/80" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kitap veya yazar adı arayın..."
              autoFocus
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 animate-spin" />
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          
          {/* 1. Existing Library Results */}
          {libraryMatches.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kütüphanenizde Bulunanlar ({libraryMatches.length})</span>
              </div>
              <div className="space-y-2.5">
                {libraryMatches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectExistingBook(b);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/[0.06] hover:border-amber-500/40 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-white/10">
                        <BookCover coverImage={b.coverImage} title={b.title} author={b.author} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                          {b.title}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {b.author} · {b.totalPages} Sayfa · {b.originalYear || 'Klasik'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
                      Görüntüle
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Online Search Results */}
          {onlineResults.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400/90 font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Çevrimiçi Arama Sonuçları ({onlineResults.length})</span>
              </div>
              <div className="space-y-2.5">
                {onlineResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-zinc-900/60 border border-white/[0.06] hover:border-emerald-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-white/10">
                        <BookCover coverImage={item.coverImage} title={item.title} author={item.author} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {item.author} · {item.totalPages} Sayfa · {item.originalYear}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddOnline(item)}
                      disabled={addedIds[item.id]}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        addedIds[item.id]
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 active:scale-95'
                      }`}
                    >
                      {addedIds[item.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Eklendi</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Kütüphaneme Ekle</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Recommendations */}
          {!query.trim() && recommendations.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kütüphanenize Özel Öneriler</span>
              </div>
              <div className="space-y-2.5">
                {recommendations.slice(0, 6).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-zinc-900/60 border border-white/[0.06] hover:border-amber-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-white/10">
                        <BookCover coverImage={rec.coverImage} title={rec.title} author={rec.author} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {rec.author} · {rec.totalPages} Sayfa · {rec.originalYear}
                        </p>
                        <p className="text-[10px] text-amber-400/80 mt-1 italic">
                          {rec.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddOnline(rec)}
                      disabled={addedIds[rec.id]}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        addedIds[rec.id]
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-white/[0.08] active:scale-95'
                      }`}
                    >
                      {addedIds[rec.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Eklendi</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Kütüphaneme Ekle</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {query.trim() && !isLoading && libraryMatches.length === 0 && onlineResults.length === 0 && (
            <div className="text-center py-10 text-zinc-400 text-sm">
              <BookMarked className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              "{query}" için bir sonuç bulunamadı. Farklı bir yazar veya kitap ismi deneyebilirsiniz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
