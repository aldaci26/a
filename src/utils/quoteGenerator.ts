/**
 * Automatic Quote Generator for newly added books
 * Provides context-aware or author/genre-tailored profound literary quotes.
 */

const FAMOUS_AUTHOR_QUOTES: Record<string, string[]> = {
  'stefan zweig': [
    'İnsan dünyada tek başına hiçbir şey yapamaz; ruhu besleyecek bir yankı arar.',
    'Bütün bir hayat, bir tek ana sığabilir.',
    'Tutku, insanın kendi içine akıttığı bir ırmaktır.'
  ],
  'franz kafka': [
    'Bir kitap, içimizdeki donmuş denizi parçalayacak bir balta olmalıdır.',
    'Sakin olmak, hem de son derece sakin olmak gerekirdi.',
    'Kendine inanmak, insanın en güç sınavıdır.'
  ],
  'dostoyevski': [
    'Aşırı bilinç bir hastalıktır, gerçek ve tam bir hastalık.',
    'İnsana en çok acı veren şey, geçmişte kaçırdığı fırsatlardır.',
    'Ruhun yaraları ancak sevgiyle ve zamanla iyileşir.'
  ],
  'tolstoy': [
    'Öğrendim ki insan kendi kaygılarıyla değil, kalbindeki sevgiyle yaşar.',
    'Tüm mutlu aileler birbirine benzer; her mutsuz ailenin ise kendine özgü bir mutsuzluğu vardır.',
    'Hayatın tek anlamı, insanlığa hizmet etmektir.'
  ],
  'george orwell': [
    'Geçmişi denetleyen geleceği de denetler; şimdiyi denetleyen geçmişi de denetler.',
    'Evrensel aldatmaca dönemlerinde gerçeği söylemek devrimci bir eylemdir.',
    'Özgürlük, iki kere ikinin dört ettiğini söyleyebilmektir.'
  ],
  'wilbur smith': [
    'Deniz asla affetmez oğlum; ama cesur olanlara hazinelerini açar.',
    'Afrika toprağı insanı bir kez çağırdı mı, sesini asla unutamazsın.',
    'Kader sert bir fırtınadır, ancak kılıcını sağlam tutanlar şafağı görür.'
  ],
  'montaigne': [
    'Dünyanın en büyük şeyi, insanın kendisi olabilmeyi bilmesidir.',
    'Başkalarının bilgisiyle bilgin olsak da ancak kendi aklımızla bilge oluruz.',
    'En güzel hayat, sade ve gösterişsiz olandır.'
  ],
  'albert camus': [
    'Kışın tam ortasında, içimde yenilmez bir yaz olduğunu öğrendim.',
    'Hayatın anlamsızlığı karşısında insanın en asil tavrı başkaldırmaktır.',
    'İnsan ne ise o olmayı reddeden tek yaratıktır.'
  ],
  'victor hugo': [
    'Gelecek, güçsüzler için imkansız, korkaklar için bilinmez, cesurlar içinse bir fırsattır.',
    'Kitap okumak, bilinmeyen denizlere yelken açmaktır.',
    'Sevmek, bir insanı Tanrı\'nın gördüğü gibi görebilmektir.'
  ]
};

const GENRE_QUOTES: Record<string, string[]> = {
  'Macera & Tarih': [
    'Ufkun ötesinde ne olduğunu merak etmeyenler asla yeni limanlar keşfedemez.',
    'Cesaret, korkusuz olmak değil; korkuya rağmen yola devam edebilmektir.',
    'Tarih sadece kralları değil, fırtınaya göğüs geren cesur yürekleri yazar.'
  ],
  'Klasik Edebiyat': [
    'Büyük kitaplar insanı kendi derinlikleriyle yüzleştiren sessiz aynalardır.',
    'Zaman her şeyi aşındırır, fakat kelimelerin ruhunu asla silemez.',
    'Her okuma, başka bir zihnin odalarında yapılmış derin bir yolculuktur.'
  ],
  'Felsefe & Düşünce': [
    'Düşünmek, ruhun kendi kendisiyle sessizce konuşmasıdır.',
    'Cevapları bulmaktan daha zoru, doğru soruları sormayı bilmektir.',
    'Aydınlanma, insanın kendi aklını kullanma cesaretini göstermesidir.'
  ],
  'Bilim Kurgu & Düşünce': [
    'Gelecek, bugünün hayalperestlerinin zihninde inşa edilir.',
    'Yıldızlar arasındaki mesafe ne kadar uzaksa, insanın kendi içine olan mesafesi o kadar derindir.',
    'Teknoloji ne kadar ilerlerse ilerlesin, insan kalbinin pusulası sevgi kalacaktır.'
  ]
};

const DEFAULT_QUOTES = [
  'Bir kitap okumak, geçmiş yüzyılların en değerli insanlarıyla sohbet etmektir.',
  'Kelimelerin gücü, kalbin kapılarını aralayan en zarif anahtardır.',
  'Sayfalar arasında kaybolmak, aslında insanın kendi kendini bulmasıdır.'
];

export function generateQuotesForBook(title: string, author: string, category: string = ''): string[] {
  const authorLower = author.toLowerCase();
  
  for (const [key, quotes] of Object.entries(FAMOUS_AUTHOR_QUOTES)) {
    if (authorLower.includes(key)) {
      return quotes;
    }
  }

  for (const [catKey, quotes] of Object.entries(GENRE_QUOTES)) {
    if (category.toLowerCase().includes(catKey.toLowerCase()) || catKey.toLowerCase().includes(category.toLowerCase())) {
      return quotes;
    }
  }

  return DEFAULT_QUOTES;
}
