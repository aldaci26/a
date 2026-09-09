import { Book } from '../types';

export interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  originalYear: number;
  publisher: string;
  coverImage: string;
  description: string;
  reason: string;
  quotes: string[];
}

const CATALOG_RECOMMENDATIONS: RecommendedBook[] = [
  {
    id: 'rec-suc-ve-ceza',
    title: 'Suç ve Ceza',
    author: 'Fyodor Dostoyevski',
    totalPages: 688,
    originalYear: 1866,
    publisher: 'Türkiye İş Bankası Kültür Yayınları',
    coverImage: 'https://covers.openlibrary.org/b/id/12836267-L.jpg',
    description: 'Raskolnikov\'un vicdan azabı, ahlak ve adalet üzerine Petersburg sokaklarındaki sarsıcı iç çatışması.',
    reason: 'Kütüphanenizdeki "Yeraltından Notlar" ile benzer derinlikte',
    quotes: ['İnsan bazen öyle bir acı çeker ki, bu acı tüm dünyadan daha büyüktür.', 'Her şey insanın kendi elindedir, ama o sadece korkusundan kaçırır fırsatları.']
  },
  {
    id: 'rec-hayvan-ciftligi',
    title: 'Hayvan Çiftliği',
    author: 'George Orwell',
    totalPages: 152,
    originalYear: 1945,
    publisher: 'Can Yayınları',
    coverImage: 'https://covers.openlibrary.org/b/id/11153215-L.jpg',
    description: 'Özgürlük, iktidar ve totalitarizmin unutulmaz bir alegorisi.',
    reason: 'Kütüphanenizdeki "1984" eseri ile aynı yazarın başyapıtı',
    quotes: ['Bütün hayvanlar eşittir, ama bazı hayvanlar diğerlerinden daha eşittir.']
  },
  {
    id: 'rec-olaganustu-bir-gece',
    title: 'Olağanüstü Bir Gece',
    author: 'Stefan Zweig',
    totalPages: 80,
    originalYear: 1922,
    publisher: 'Türkiye İş Bankası Kültür Yayınları',
    coverImage: 'https://covers.openlibrary.org/b/id/10419266-L.jpg',
    description: 'Duyarsızlaşmış bir aristokratın tek bir gecede tüm hayatını ve hislerini yeniden keşfetmesi.',
    reason: 'Kütüphanenizdeki "Satranç" eseri ile aynı yazarın klasiği',
    quotes: ['O an hissettim ki, insanın ruhu ancak başkalarıyla temas ettiğinde uyanır.']
  },
  {
    id: 'rec-dava-kafka',
    title: 'Dava',
    author: 'Franz Kafka',
    totalPages: 224,
    originalYear: 1925,
    publisher: 'Türkiye İş Bankası Kültür Yayınları',
    coverImage: 'https://covers.openlibrary.org/b/id/8307045-L.jpg',
    description: 'Josef K.\'nın nedenini bilmediği bir suçtan yargılanması ve bürokratik labirentteki çaresizliği.',
    reason: 'Kütüphanenizdeki "Dönüşüm" eseri ile aynı yazarın başyapıtı',
    quotes: ['Yalan, dünyanın düzeni haline gelmişti.', 'Doğru yol gergin bir ip üzerinde yürümek gibidir.']
  },
  {
    id: 'rec-yabanci-camus',
    title: 'Yabancı',
    author: 'Albert Camus',
    totalPages: 112,
    originalYear: 1942,
    publisher: 'Can Yayınları',
    coverImage: 'https://covers.openlibrary.org/b/id/10574646-L.jpg',
    description: 'Toplumsal normlara ve duygusal riyakarlığa yabancılaşmış Meursault\'nun hikayesi.',
    reason: 'Varoluşçu ve klasik edebiyat seçkinizle tam uyumlu',
    quotes: ['Hayatta bir kere bile yalan söylememek için ölümü göze almak.', 'İnsan ne ise o olmayı reddeden tek yaratıktır.']
  },
  {
    id: 'rec-nehir-tanrisi-wilbur',
    title: 'Nehir Tanrısı',
    author: 'Wilbur Smith',
    totalPages: 688,
    originalYear: 1993,
    publisher: 'Altın Kitaplar',
    coverImage: 'https://covers.openlibrary.org/b/id/240727-L.jpg',
    description: 'Antik Mısır\'ın büyüleyici çöllerinde Taita\'nın zekasıyla şekillenen destansı tarih ve macera.',
    reason: 'Kütüphanenizdeki "Yırtıcı Kuş" ile aynı yazarın görkemli macerası',
    quotes: ['Nil nasıl akıyorsa, kader de öyle akar; önüne duramazsın.']
  },
  {
    id: 'rec-beyaz-geceler',
    title: 'Beyaz Geceler',
    author: 'Fyodor Dostoyevski',
    totalPages: 96,
    originalYear: 1848,
    publisher: 'Türkiye İş Bankası Kültür Yayınları',
    coverImage: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    description: 'Petersburg\'un büyüleyici beyaz gecelerinde yalnız bir hayalperest ile Nastenka\'nın karşılaşması.',
    reason: 'Rus klasiklerine duyduğunuz ilgiye özel',
    quotes: ['Bütün bir hayat boyunca hissedilecek bir anlık mutluluk bile az şey midir?']
  },
  {
    id: 'rec-savas-ve-baris',
    title: 'Savaş ve Barış',
    author: 'Lev Tolstoy',
    totalPages: 1225,
    originalYear: 1869,
    publisher: 'İletişim Yayınları',
    coverImage: 'https://covers.openlibrary.org/b/id/10389332-L.jpg',
    description: 'Napolyon savaşları gölgesinde Rus aristokrasisinin, aşkın, inancın ve tarihin destansı tablosu.',
    reason: 'Kütüphanenizdeki Tolstoy külliyatı için önerildi',
    quotes: ['En güçlü iki savaşçı sabır ve zamandır.', 'Saf mutluluk, yalnızca başkaları için yaşandığında bulunur.']
  }
];

export function getRecommendations(existingBooks: Book[]): RecommendedBook[] {
  const existingTitles = new Set(existingBooks.map(b => b.title.toLowerCase().trim()));
  const existingAuthors = new Set(existingBooks.map(b => b.author.toLowerCase().trim()));

  const available = CATALOG_RECOMMENDATIONS.filter(rec => !existingTitles.has(rec.title.toLowerCase().trim()));

  return available.sort((a, b) => {
    const aAuthorMatches = existingAuthors.has(a.author.toLowerCase().trim()) ? 1 : 0;
    const bAuthorMatches = existingAuthors.has(b.author.toLowerCase().trim()) ? 1 : 0;
    return bAuthorMatches - aAuthorMatches;
  });
}
