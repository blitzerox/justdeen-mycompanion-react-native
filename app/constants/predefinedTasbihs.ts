/**
 * Predefined Tasbihs
 * Common Islamic dhikr and tasbih phrases
 */

export interface PredefinedTasbih {
  id: string
  name: string
  arabicText: string
  transliteration: string
  translation: string
  defaultCount: number
  category: "after_prayer" | "morning_evening" | "general" | "special"
}

export const PREDEFINED_TASBIHS: PredefinedTasbih[] = [
  // After Prayer Tasbihs
  {
    id: "subhanallah",
    name: "SubhanAllah",
    arabicText: "سُبْحَانَ اللّٰهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    defaultCount: 33,
    category: "after_prayer",
  },
  {
    id: "alhamdulillah",
    name: "Alhamdulillah",
    arabicText: "الْحَمْدُ لِلّٰهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    defaultCount: 33,
    category: "after_prayer",
  },
  {
    id: "allahu_akbar",
    name: "Allahu Akbar",
    arabicText: "اللّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    defaultCount: 34,
    category: "after_prayer",
  },

  // General Dhikr
  {
    id: "la_ilaha_illallah",
    name: "La ilaha illallah",
    arabicText: "لَا إِلٰهَ إِلَّا اللّٰهُ",
    transliteration: "La ilaha illallah",
    translation: "There is no deity except Allah",
    defaultCount: 100,
    category: "general",
  },
  {
    id: "istighfar",
    name: "Astaghfirullah",
    arabicText: "أَسْتَغْفِرُ اللّٰهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    defaultCount: 100,
    category: "general",
  },
  {
    id: "subhanallah_wa_bihamdihi",
    name: "SubhanAllah wa bihamdihi",
    arabicText: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllah wa bihamdihi",
    translation: "Glory be to Allah and praise Him",
    defaultCount: 100,
    category: "general",
  },
  {
    id: "subhanallah_al_azim",
    name: "SubhanAllah al-Azim",
    arabicText: "سُبْحَانَ اللّٰهِ الْعَظِيمِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllah al-Azim wa bihamdihi",
    translation: "Glory be to Allah, the Magnificent, and praise Him",
    defaultCount: 100,
    category: "general",
  },

  // Morning/Evening Adhkar
  {
    id: "la_ilaha_illallah_wahdahu",
    name: "Tahlil (Complete)",
    arabicText: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallah wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
    translation: "There is no deity except Allah, alone without partner. To Him belongs the dominion and to Him belongs all praise, and He is over all things competent",
    defaultCount: 10,
    category: "morning_evening",
  },
  {
    id: "salawat",
    name: "Durood Sharif",
    arabicText: "اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammad wa 'ala ali Muhammad",
    translation: "O Allah, send blessings upon Muhammad and upon the family of Muhammad",
    defaultCount: 10,
    category: "general",
  },

  // Special Tasbihs
  {
    id: "tasbih_fatima",
    name: "Tasbih of Fatimah",
    arabicText: "سُبْحَانَ اللّٰهِ • الْحَمْدُ لِلّٰهِ • اللّٰهُ أَكْبَرُ",
    transliteration: "SubhanAllah (33x) • Alhamdulillah (33x) • Allahu Akbar (34x)",
    translation: "Complete set of 100 after each prayer",
    defaultCount: 100,
    category: "special",
  },
  {
    id: "la_hawla",
    name: "La hawla wa la quwwata",
    arabicText: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    translation: "There is no power and no strength except with Allah",
    defaultCount: 100,
    category: "general",
  },
  {
    id: "hasbi_allah",
    name: "Hasbiyallah",
    arabicText: "حَسْبِيَ اللّٰهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbiyallahu wa ni'mal wakil",
    translation: "Sufficient for me is Allah, and He is the best Disposer of affairs",
    defaultCount: 7,
    category: "general",
  },
]

/**
 * Get tasbih by ID
 */
export const getTasbihById = (id: string): PredefinedTasbih | undefined => {
  return PREDEFINED_TASBIHS.find((t) => t.id === id)
}

/**
 * Get tasbihs by category
 */
export const getTasbihsByCategory = (category: PredefinedTasbih["category"]): PredefinedTasbih[] => {
  return PREDEFINED_TASBIHS.filter((t) => t.category === category)
}

/**
 * Get after prayer tasbihs (SubhanAllah, Alhamdulillah, Allahu Akbar)
 */
export const getAfterPrayerTasbihs = (): PredefinedTasbih[] => {
  return getTasbihsByCategory("after_prayer")
}
