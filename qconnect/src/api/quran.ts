import type { Surah, Verse } from "../types/types";

const BASE_URL = "https://api.quran.com/api/v4";

// ✅ Get all Surahs
export async function getSurahs(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/chapters`);

  if (!res.ok) {
    throw new Error(`Failed to fetch Surahs: ${res.status}`);
  }

  const data = await res.json();
  return data.chapters;
}

// ✅ Get verses (Arabic + English translation)
export async function getVerses(chapterId: number): Promise<Verse[]> {
  const res = await fetch(
    `${BASE_URL}/verses/by_chapter/${chapterId}?translations=131&fields=text_uthmani`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch Verses: ${res.status}`);
  }

  const data = await res.json();

  // ✅ Return clean structured data
  return data.verses.map((verse: any) => ({
    id: verse.id,
    verse_number: verse.verse_number,
    arabic: verse.text_uthmani,
    translation: verse.translations?.[0]?.text || "",
  }));
}