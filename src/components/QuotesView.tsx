import React, { useState } from 'react';
import { Book } from '../types';
import { Quote, Copy, Check, Search } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { BookCover } from './BookCover';

interface QuotesViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  books,
  onSelectBook
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedBookFilter, setSelectedBookFilter] = useState('all');

  // Collect all quotes
  const allQuotes = books.flatMap((b) =>
    (b.quotes || []).map((q, idx) => ({
      id: `${b.id}-q-${idx}`,
      bookId: b.id,
      bookTitle: b.title,
      author: b.author,
      coverImage: b.coverImage,
      text: q
    }))
  );

  const filteredQuotes = allQuotes.filter((item) => {
    const matchesQuery =
      item.text.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.bookTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesBook = selectedBookFilter === 'all' || item.bookId === selectedBookFilter;

    return matchesQuery && matchesBook;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    audioEngine.playChime();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-white tracking-normal flex items-center gap-2">
            <Quote className="w-5 h-5 text-amber-400" />
            <span>Alıntılar ({allQuotes.length})</span>
          </h2>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Kütüphanenizdeki yapıtlardan kaydedilen unutulmaz edebi cümleler.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search in quotes */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Alıntılarda veya kitaplarda ara..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter by book */}
        <div className="w-full sm:w-64">
          <select
            value={selectedBookFilter}
            onChange={(e) => setSelectedBookFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tüm Kitaplar ({books.length})</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotes Cards Grid */}
      {filteredQuotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuotes.map((item) => {
            const matchingBook = books.find((b) => b.id === item.bookId);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-white/[0.06] hover:border-amber-500/30 transition-all flex flex-col justify-between gap-4 group shadow-lg"
              >
                {/* Quote Text */}
                <div className="relative pl-6">
                  <Quote className="w-4 h-4 text-amber-500/60 absolute top-0 left-0" />
                  <p className="text-xs sm:text-sm text-zinc-200 font-serif italic leading-relaxed">
                    "{item.text}"
                  </p>
                </div>

                {/* Footer: Book meta & Actions */}
                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-2.5 cursor-pointer min-w-0"
                    onClick={() => matchingBook && onSelectBook(matchingBook)}
                    title="Kitabı görüntüle"
                  >
                    <div className="w-6 h-8 rounded overflow-hidden shadow flex-shrink-0 bg-zinc-800">
                      <BookCover
                        coverImage={item.coverImage}
                        title={item.bookTitle}
                        author={item.author}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors block truncate">
                        {item.bookTitle}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {item.author}
                      </span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(item.text, item.id)}
                    className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center gap-1 text-[11px]"
                    title="Alıntıyı Kopyala"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-white/[0.04]">
          <p className="text-xs text-zinc-500">Aramanıza uygun alıntı bulunamadı.</p>
        </div>
      )}
    </div>
  );
};
