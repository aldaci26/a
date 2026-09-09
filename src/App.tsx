import React, { useState, useEffect } from 'react';
import { Book, AmbientSoundMode } from './types';
import { INITIAL_BOOKS } from './data/initialBook';
import { Header } from './components/Header';
import { TableView } from './components/TableView';
import { SearchAndAddModal } from './components/SearchAndAddModal';
import { BookDetailModal } from './components/BookDetailModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { AmbientBackground } from './components/AmbientBackground';
import { CompactShowcase } from './components/CompactShowcase';
import { audioEngine } from './utils/audioEngine';

export const App: React.FC = () => {
  // Books state - Default strictly sorted by dateAdded descending (newest on top)
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('kitaplik_books_v11') || localStorage.getItem('kitaplik_books_v10');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Restore coverImage from INITIAL_BOOKS if missing or empty
          const healed = parsed.map((b: Book) => {
            if (!b.coverImage || b.coverImage.trim() === '') {
              const matched = INITIAL_BOOKS.find(
                (ib) => ib.id === b.id || ib.title.toLowerCase() === b.title.toLowerCase()
              );
              if (matched && matched.coverImage) {
                return { ...b, coverImage: matched.coverImage };
              }
            }
            return b;
          });

          return [...healed].sort(
            (a, b) => (new Date(b.dateAdded || 0).getTime() || 0) - (new Date(a.dateAdded || 0).getTime() || 0)
          );
        }
      }
    } catch {
      // fallback
    }
    return [...INITIAL_BOOKS].sort(
      (a, b) => (new Date(b.dateAdded || 0).getTime() || 0) - (new Date(a.dateAdded || 0).getTime() || 0)
    );
  });

  // Showcase state - Default to the most recently added book (books[0])
  const [showcaseBookId, setShowcaseBookId] = useState<string | null>(null);

  // Active showcase book
  const currentShowcaseBook = 
    (showcaseBookId ? books.find((b) => b.id === showcaseBookId) : null) || books[0] || null;

  // Ambient sound synthesizer & animation mode
  const [soundMode, setSoundMode] = useState<AmbientSoundMode>('off');
  const [lightningFlash, setLightningFlash] = useState(false);

  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [detailModalBook, setDetailModalBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Lightning effect hook when thunder strikes
  useEffect(() => {
    audioEngine.setThunderCallback(() => {
      setLightningFlash(true);
      setTimeout(() => setLightningFlash(false), 380);
    });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kitaplik_books_v11', JSON.stringify(books));
    } catch {
      // ignore
    }
  }, [books]);

  // Add online book - automatically showcases the newest book!
  const handleAddOnlineBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    setShowcaseBookId(newBook.id);
  };

  // Trigger confirmation modal for deleting a book
  const handleRequestDelete = (book: Book) => {
    setBookToDelete(book);
  };

  // Confirmed delete
  const handleConfirmDelete = () => {
    if (!bookToDelete) return;
    const targetId = bookToDelete.id;
    setBooks((prev) => prev.filter((b) => b.id !== targetId));
    if (detailModalBook && detailModalBook.id === targetId) {
      setDetailModalBook(null);
    }
    if (showcaseBookId === targetId) {
      setShowcaseBookId(null);
    }
    setBookToDelete(null);
    audioEngine.playChime();
  };

  // Dynamic selection styling based on ambient sound mode
  const getSelectionClass = () => {
    switch (soundMode) {
      case 'fireplace':
        return 'selection:bg-amber-500/35 selection:text-amber-100';
      case 'rain':
        return 'selection:bg-sky-500/35 selection:text-sky-100';
      case 'ocean':
        return 'selection:bg-teal-500/35 selection:text-teal-100';
      case 'forest':
        return 'selection:bg-emerald-500/35 selection:text-emerald-100';
      default:
        return 'selection:bg-amber-500/30 selection:text-amber-200';
    }
  };

  return (
    <div className={`min-h-screen ${soundMode !== 'off' ? 'bg-[#09090b]/60' : 'bg-[#09090b]'} text-[#f4f4f5] flex flex-col relative ${getSelectionClass()} font-sans transition-colors duration-500`}>
      
      {/* Dynamic Ambient Background Canvas (Fireplace / Rain / Ocean / Forest) */}
      <AmbientBackground mode={soundMode} lightningFlash={lightningFlash} />

      {/* Header: Clickable logo on left adds books, real ambient sounds on right */}
      <Header
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        soundMode={soundMode}
        setSoundMode={setSoundMode}
        totalBooks={books.length}
      />

      {/* Main Content Area: Compact Vitrin (Showcase) + Kitaplarım Listesi */}
      <main className="flex-1 pb-16 relative z-10 space-y-2">
        {/* 1. Compact Showcase (Anasayfa Vitrini - En son eklenen veya seçilen eser) */}
        {currentShowcaseBook && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
            <CompactShowcase
              book={currentShowcaseBook}
              onOpenDetailModal={(b) => setDetailModalBook(b)}
              onRequestDelete={handleRequestDelete}
              isLatestAdded={currentShowcaseBook.id === books[0]?.id}
              ambientMode={soundMode}
            />
          </div>
        )}

        {/* 2. Kitaplar Tablosu */}
        <TableView
          books={books}
          onRequestDelete={handleRequestDelete}
          onOpenDetailModal={(b) => setDetailModalBook(b)}
          selectedShowcaseId={currentShowcaseBook?.id}
          onSelectForShowcase={(b) => setShowcaseBookId(b.id)}
        />
      </main>

      {/* Search & Add Book Modal (Opens on Logo Click) */}
      <SearchAndAddModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        existingBooks={books}
        onSelectExistingBook={(b) => {
          setDetailModalBook(b);
        }}
        onAddOnlineBook={handleAddOnlineBook}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        book={detailModalBook}
        onClose={() => setDetailModalBook(null)}
        onRequestDelete={handleRequestDelete}
      />

      {/* In-App Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!bookToDelete}
        book={bookToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBookToDelete(null)}
      />
    </div>
  );
};
