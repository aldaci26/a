import { Book } from '../types';
import { INITIAL_BOOKS } from '../data/initialBook';

export const CURRENT_STORAGE_KEY = 'kitaplik_books_v11';
export const LEGACY_STORAGE_KEYS = ['kitaplik_books_v10', 'kitaplik_books_v9', 'kitaplik_books'];

/**
 * Validates and sanitizes a raw object into a well-formed Book instance
 */
function sanitizeBook(raw: any, fallbackIndex: number): Book | null {
  if (!raw || typeof raw !== 'object') return null;

  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'İsimsiz Eser';
  const author = typeof raw.author === 'string' && raw.author.trim() ? raw.author.trim() : 'Bilinmeyen Yazar';
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `book-healed-${Date.now()}-${fallbackIndex}`;
  const totalPages = typeof raw.totalPages === 'number' && raw.totalPages > 0 ? raw.totalPages : 240;

  // Restore coverImage from INITIAL_BOOKS if missing or invalid
  let coverImage = typeof raw.coverImage === 'string' ? raw.coverImage.trim() : '';
  if (!coverImage) {
    const matched = INITIAL_BOOKS.find(
      (ib) => ib.id === id || ib.title.toLowerCase() === title.toLowerCase()
    );
    if (matched && matched.coverImage) {
      coverImage = matched.coverImage;
    }
  }

  // Ensure safe dateAdded timestamp
  let dateAdded = raw.dateAdded;
  if (!dateAdded || isNaN(new Date(dateAdded).getTime())) {
    dateAdded = new Date(Date.now() - fallbackIndex * 60000).toISOString();
  }

  const quotes = Array.isArray(raw.quotes)
    ? raw.quotes.filter((q: unknown) => typeof q === 'string' && q.trim().length > 0)
    : [];

  return {
    id,
    title,
    author,
    totalPages,
    originalYear: typeof raw.originalYear === 'number' ? raw.originalYear : undefined,
    publisher: typeof raw.publisher === 'string' ? raw.publisher.trim() : undefined,
    isbn: typeof raw.isbn === 'string' ? raw.isbn.trim() : undefined,
    coverImage,
    description: typeof raw.description === 'string' ? raw.description.trim() : `${title} - ${author}`,
    quotes,
    dateAdded
  };
}

/**
 * Loads books with automatic legacy key migration and schema healing
 */
export function loadBooks(): Book[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return sortBooksByDateAddedDesc([...INITIAL_BOOKS]);
  }

  let rawJson: string | null = null;
  let sourceKey = CURRENT_STORAGE_KEY;

  try {
    rawJson = localStorage.getItem(CURRENT_STORAGE_KEY);

    // Check legacy keys if current key not found
    if (!rawJson) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          rawJson = legacyData;
          sourceKey = legacyKey;
          console.info(`[Storage] Eski veri anahtarından (${legacyKey}) veriler bulundu, v11'e migrate ediliyor...`);
          break;
        }
      }
    }

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitizedList: Book[] = [];
        parsed.forEach((item, idx) => {
          const sanitized = sanitizeBook(item, idx);
          if (sanitized) sanitizedList.push(sanitized);
        });

        if (sanitizedList.length > 0) {
          // If we migrated from an old key, save to current key and clean old keys
          if (sourceKey !== CURRENT_STORAGE_KEY) {
            saveBooks(sanitizedList);
            LEGACY_STORAGE_KEYS.forEach((oldKey) => {
              try {
                localStorage.removeItem(oldKey);
              } catch {
                // ignore
              }
            });
          }

          return sortBooksByDateAddedDesc(sanitizedList);
        }
      }
    }
  } catch (err) {
    console.warn('[Storage] Yerel depolama okuma hatası, varsayılan kitaplara dönülüyor:', err);
  }

  // Fallback to default initial books
  return sortBooksByDateAddedDesc([...INITIAL_BOOKS]);
}

/**
 * Persists books to localStorage safely
 */
export function saveBooks(books: Book[]): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(books));
    return true;
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      console.error('[Storage] HATA: localStorage depolama kotası doldu! Kitaplar kaydedilemedi.', err);
    } else {
      console.error('[Storage] Yerel depolama yazma hatası:', err);
    }
    return false;
  }
}

/**
 * Sorts books descending by dateAdded (newest first) with robust date parsing
 */
export function sortBooksByDateAddedDesc(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    const timeA = new Date(a.dateAdded || 0).getTime();
    const timeB = new Date(b.dateAdded || 0).getTime();
    const validA = isNaN(timeA) ? 0 : timeA;
    const validB = isNaN(timeB) ? 0 : timeB;
    return validB - validA;
  });
}
