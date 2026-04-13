export interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
  revelation_place: string;
  verses_count: number;
}

export interface Verse {
  id: number;
  verse_number: number;
  arabic: string;
  translation: string;
}