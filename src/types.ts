export interface QuoteItem {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  text: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  originalYear?: number;
  publisher?: string;
  isbn?: string;
  coverImage: string;
  description: string;
  quotes: string[];
  dateAdded: string;
}

export type ViewMode = 'home' | 'list' | 'quotes';

export type AmbientSoundMode = 'off' | 'fireplace' | 'rain' | 'ocean' | 'forest';

export type SortField = 'dateAdded' | 'title' | 'author' | 'pages' | 'year' | 'publisher';
export type SortOrder = 'asc' | 'desc';
