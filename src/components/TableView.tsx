import React, { useState } from 'react';
import { Book, SortField, SortOrder } from '../types';
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown, BookMarked, Info } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface TableViewProps {
  books: Book[];
  onRequestDelete: (book: Book) => void;
  onOpenDetailModal: (book: Book) => void;
  selectedShowcaseId?: string;
  onSelectForShowcase?: (book: Book) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  books,
  onRequestDelete,
  onOpenDetailModal,
  selectedShowcaseId,
  onSelectForShowcase
}) => {
  // Default sorting: Newest added on top (dateAdded desc)
  const [sortField, setSortField] = useState<SortField>('dateAdded');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // For dateAdded, default to desc (newest first)
      setSortOrder(field === 'dateAdded' ? 'desc' : 'asc');
    }
    audioEngine.playChime();
  };

  const sortedBooks = [...books].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'dateAdded') {
      const timeA = new Date(a.dateAdded || 0).getTime() || 0;
      const timeB = new Date(b.dateAdded || 0).getTime() || 0;
      comparison = timeA - timeB;
    } else if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title, 'tr');
    } else if (sortField === 'author') {
      comparison = a.author.localeCompare(b.author, 'tr');
    } else if (sortField === 'pages') {
      comparison = a.totalPages - b.totalPages;
    } else if (sortField === 'year') {
      comparison = (a.originalYear || 0) - (b.originalYear || 0);
    } else if (sortField === 'publisher') {
      comparison = (a.publisher || '').localeCompare(b.publisher || '', 'tr');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1 text-amber-400 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-amber-400 inline" />
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Quick Sorting Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-white tracking-normal">
            Kitaplarım
          </h2>
        </div>

        {/* Mobile & Quick Sort Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Sırala:</span>
          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
              setSortField(field);
              setSortOrder(order);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="dateAdded-desc">Eklenme Tarihi (Yeniden Eskiye - Varsayılan)</option>
            <option value="dateAdded-asc">Eklenme Tarihi (Eskiden Yeniye)</option>
            <option value="title-asc">Kitap İsmi (A - Z)</option>
            <option value="title-desc">Kitap İsmi (Z - A)</option>
            <option value="author-asc">Yazar (A - Z)</option>
            <option value="pages-desc">Sayfa Sayısı (Çoktan Aza)</option>
            <option value="pages-asc">Sayfa Sayısı (Azdan Çoka)</option>
            <option value="year-desc">Yıl (Yeniden Eskiye)</option>
            <option value="year-asc">Yıl (Eskiden Yeniye)</option>
            <option value="publisher-asc">Yayınevi (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Clean Table Container (No Book Images) */}
      <div className="rounded-2xl bg-zinc-950/45 border border-white/[0.07] overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/60 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-white/[0.06] select-none">
              <tr>
                <th 
                  className="py-3.5 px-4 sm:px-6 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <span>Kitap & Yazar</span>
                  {renderSortIndicator('title')}
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                  onClick={() => handleSort('pages')}
                >
                  <span>Sayfa Sayısı</span>
                  {renderSortIndicator('pages')}
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                  onClick={() => handleSort('year')}
                >
                  <span>Yıl</span>
                  {renderSortIndicator('year')}
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                  onClick={() => handleSort('publisher')}
                >
                  <span>Yayınevi</span>
                  {renderSortIndicator('publisher')}
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                  onClick={() => handleSort('dateAdded')}
                >
                  <span>Eklenme Tarihi</span>
                  {renderSortIndicator('dateAdded')}
                </th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sortedBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <BookMarked className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    Henüz kitap bulunmuyor. Sol üstteki logoya tıklayarak yeni kitap ekleyebilirsiniz.
                  </td>
                </tr>
              ) : (
                sortedBooks.map((book) => {
                  const isShowcased = book.id === selectedShowcaseId;
                  return (
                    <tr
                      key={book.id}
                      onClick={() => {
                        audioEngine.playPageTurn();
                        if (onSelectForShowcase) {
                          onSelectForShowcase(book);
                        } else {
                          onOpenDetailModal(book);
                        }
                      }}
                      className={`transition-all duration-200 cursor-pointer group ${
                        isShowcased
                          ? 'bg-amber-500/[0.09] ring-1 ring-inset ring-amber-500/30'
                          : 'hover:bg-white/[0.03]'
                      }`}
                      title="Bu kitabı vitrine taşımak için tıklayın"
                    >
                      {/* Book & Author - Clean Typographic layout without book cover image */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                              isShowcased ? 'text-amber-300' : 'text-white group-hover:text-amber-300'
                            }`}>
                              {book.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                            {book.author}
                          </span>
                        </div>
                      </td>

                      {/* Sayfa Sayısı */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-300 font-medium">
                        {book.totalPages} Sayfa
                      </td>

                      {/* Yıl */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400">
                        {book.originalYear || '—'}
                      </td>

                      {/* Yayınevi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400">
                        {book.publisher || '—'}
                      </td>

                      {/* Eklenme Tarihi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400">
                        {formatDate(book.dateAdded)}
                      </td>

                      {/* Action: Detail & Delete buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              audioEngine.playPageTurn();
                              onOpenDetailModal(book);
                            }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors active:scale-95 cursor-pointer"
                            title="Kitap Detaylarını İncele"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDelete(book);
                            }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-95 cursor-pointer"
                            title="Kitabı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
