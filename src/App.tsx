import React, { useState, useEffect, useCallback } from 'react';
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
import { loadBooks, saveBooks } from './utils/storage';

export const App: React.FC = () => {
  // Books state - Default strictly sorted by dateAdded descending (newest on top)
  const [books, setBooks] = useState<Book[]>(() => loadBooks());

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

  // Sync to localStorage safely
  useEffect(() => {
    saveBooks(books);
  }, [books]);

  // Add online book - automatically showcases the newest book!
  const handleAddOnlineBook = useCallback((newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    setShowcaseBookId(newBook.id);
  }, []);

  // Trigger confirmation modal for deleting a book
  const handleRequestDelete = useCallback((book: Book) => {
    setBookToDelete(book);
  }, []);

  // Confirmed delete
  const handleConfirmDelete = useCallback(() => {
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
  }, [bookToDelete, detailModalBook, showcaseBookId]);

  // Modal and detail handlers
  const handleOpenSearchModal = useCallback(() => {
    setIsSearchModalOpen(true);
  }, []);

  const handleCloseSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
  }, []);

  const handleOpenDetailModal = useCallback((book: Book) => {
    setDetailModalBook(book);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setDetailModalBook(null);
  }, []);

  const handleSelectForShowcase = useCallback((book: Book) => {
    setShowcaseBookId(book.id);
  }, []);

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
        onOpenSearchModal={handleOpenSearchModal}
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
              onOpenDetailModal={handleOpenDetailModal}
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
          onOpenDetailModal={handleOpenDetailModal}
          selectedShowcaseId={currentShowcaseBook?.id}
          onSelectForShowcase={handleSelectForShowcase}
        />
      </main>

      {/* Search & Add Book Modal (Opens on Logo Click) */}
      <SearchAndAddModal
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
        existingBooks={books}
        onSelectExistingBook={handleOpenDetailModal}
        onAddOnlineBook={handleAddOnlineBook}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        book={detailModalBook}
        onClose={handleCloseDetailModal}
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
