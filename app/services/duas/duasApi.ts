/**
 * Duas API Service
 * Provides access to Islamic supplications (duas) and dhikr
 *
 * Note: For production, this should integrate with a comprehensive Duas database
 * or API with audio recitations
 */

export interface DuaCategory {
  id: string
  name: string
  arabicName: string
  description: string
  icon: string
  duasCount: number
}

export interface Dua {
  id: string
  categoryId: string
  name: string
  arabicName: string
  arabicText: string
  transliteration: string
  englishTranslation: string
  reference?: string
  audioUrl?: string
  occasion?: string
  benefits?: string
}

// Dua Categories
export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: "morning",
    name: "Morning Adhkar",
    arabicName: "أذكار الصباح",
    description: "Supplications to be recited in the morning",
    icon: "bell",
    duasCount: 15,
  },
  {
    id: "evening",
    name: "Evening Adhkar",
    arabicName: "أذكار المساء",
    description: "Supplications to be recited in the evening",
    icon: "moon",
    duasCount: 15,
  },
  {
    id: "daily",
    name: "Daily Duas",
    arabicName: "الأدعية اليومية",
    description: "Everyday supplications for various occasions",
    icon: "heart",
    duasCount: 25,
  },
  {
    id: "prayer",
    name: "Prayer Duas",
    arabicName: "أدعية الصلاة",
    description: "Supplications related to prayer",
    icon: "components",
    duasCount: 12,
  },
  {
    id: "quran",
    name: "Quranic Duas",
    arabicName: "الأدعية القرآنية",
    description: "Supplications from the Quran",
    icon: "book",
    duasCount: 20,
  },
  {
    id: "prophetic",
    name: "Prophetic Duas",
    arabicName: "الأدعية النبوية",
    description: "Supplications from the Prophet's traditions",
    icon: "star",
    duasCount: 30,
  },
]

// Sample Duas (Famous ones)
const SAMPLE_DUAS: Dua[] = [
  {
    id: "morning_1",
    categoryId: "morning",
    name: "Morning Protection",
    arabicName: "دعاء الصباح للحماية",
    arabicText: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku walahul-hamdu wahuwa 'ala kulli shay'in qadir",
    englishTranslation: "We have entered a new day and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner. To Allah belongs the dominion, and to Him is the praise, and He has power over all things.",
    reference: "Abu Dawud 4/317",
    occasion: "Morning",
  },
  {
    id: "evening_1",
    categoryId: "evening",
    name: "Evening Protection",
    arabicName: "دعاء المساء للحماية",
    arabicText: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku walahul-hamdu wahuwa 'ala kulli shay'in qadir",
    englishTranslation: "We have entered the evening and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone, Who has no partner. To Allah belongs the dominion, and to Him is the praise, and He has power over all things.",
    reference: "Abu Dawud 4/317",
    occasion: "Evening",
  },
  {
    id: "daily_1",
    categoryId: "daily",
    name: "Before Eating",
    arabicName: "دعاء قبل الأكل",
    arabicText: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    englishTranslation: "In the name of Allah",
    reference: "Bukhari 7/99, Muslim 3/1599",
    occasion: "Before eating",
  },
  {
    id: "daily_2",
    categoryId: "daily",
    name: "After Eating",
    arabicName: "دعاء بعد الأكل",
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alhamdu lillahil-ladhi at'amani hadha, wa razaqanihi min ghayri hawlin minni wa la quwwah",
    englishTranslation: "Praise is to Allah Who has given me this food and sustained me with it though I have no power or might.",
    reference: "Abu Dawud 4/406, At-Tirmidhi 5/507",
    occasion: "After eating",
  },
  {
    id: "quran_1",
    categoryId: "quran",
    name: "Dua for Guidance",
    arabicName: "دعاء الهداية",
    arabicText: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    transliteration: "Rabbana la tuzigh quloobana ba'da idh hadaytana wahab lana mil-ladunka rahmah, innaka antal-Wahhab",
    englishTranslation: "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.",
    reference: "Quran 3:8",
    occasion: "Seeking guidance",
  },
  {
    id: "quran_2",
    categoryId: "quran",
    name: "Dua for Paradise",
    arabicName: "دعاء الجنة",
    arabicText: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    englishTranslation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
    reference: "Quran 2:201",
    occasion: "General supplication",
  },
]

/**
 * Duas API Service
 * For production, integrate with a Duas database or API with audio
 */
export class DuasApi {
  /**
   * Get all Dua categories
   */
  getCategories(): DuaCategory[] {
    return DUA_CATEGORIES
  }

  /**
   * Get a specific category
   */
  getCategory(categoryId: string): DuaCategory | undefined {
    return DUA_CATEGORIES.find((c) => c.id === categoryId)
  }

  /**
   * Get Duas from a category
   * In production, this would fetch from API or database
   */
  async getDuasFromCategory(categoryId: string): Promise<Dua[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return sample duas for the category
    return SAMPLE_DUAS.filter((d) => d.categoryId === categoryId)
  }

  /**
   * Get a specific Dua
   */
  async getDua(duaId: string): Promise<Dua | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return SAMPLE_DUAS.find((d) => d.id === duaId)
  }

  /**
   * Search Duas
   * In production, this would use full-text search
   */
  async searchDuas(query: string, categoryId?: string): Promise<Dua[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const lowerQuery = query.toLowerCase()
    let results = SAMPLE_DUAS.filter((d) => {
      const matchesQuery =
        d.name.toLowerCase().includes(lowerQuery) ||
        d.englishTranslation.toLowerCase().includes(lowerQuery) ||
        d.transliteration.toLowerCase().includes(lowerQuery) ||
        (d.occasion && d.occasion.toLowerCase().includes(lowerQuery))
      const matchesCategory = !categoryId || d.categoryId === categoryId
      return matchesQuery && matchesCategory
    })

    return results
  }

  /**
   * Get random Dua (Dua of the Day)
   */
  async getRandomDua(): Promise<Dua> {
    const randomIndex = Math.floor(Math.random() * SAMPLE_DUAS.length)
    return SAMPLE_DUAS[randomIndex]
  }

  /**
   * Get all sample duas (for development/testing)
   */
  getAllSampleDuas(): Dua[] {
    return SAMPLE_DUAS
  }
}

// Export singleton instance
export const duasApi = new DuasApi()
