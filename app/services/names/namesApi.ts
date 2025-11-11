/**
 * Allah's 99 Names API Service
 * Provides access to the Beautiful Names of Allah (Asma ul-Husna)
 *
 * Each name includes Arabic, transliteration, and meaning
 */

export interface AllahName {
  id: number
  name: string // Arabic name
  transliteration: string
  meaning: string
  description?: string
}

// The 99 Beautiful Names of Allah (Asma ul-Husna)
export const ALLAH_NAMES: AllahName[] = [
  {
    id: 1,
    name: "الرَّحْمَنُ",
    transliteration: "Ar-Rahman",
    meaning: "The Most Merciful",
    description: "The One who has plenty of mercy for the believers and the blasphemers in this world and especially for the believers in the hereafter.",
  },
  {
    id: 2,
    name: "الرَّحِيمُ",
    transliteration: "Ar-Raheem",
    meaning: "The Bestower of Mercy",
    description: "The One who has plenty of mercy for the believers.",
  },
  {
    id: 3,
    name: "الْمَلِكُ",
    transliteration: "Al-Malik",
    meaning: "The King",
    description: "The One with the complete Dominion, the One Whose Dominion is clear from imperfection.",
  },
  {
    id: 4,
    name: "الْقُدُّوسُ",
    transliteration: "Al-Quddus",
    meaning: "The Most Sacred",
    description: "The One who is pure from any imperfection and clear from children and adversaries.",
  },
  {
    id: 5,
    name: "السَّلاَمُ",
    transliteration: "As-Salam",
    meaning: "The Source of Peace",
    description: "The One who is free from every imperfection.",
  },
  {
    id: 6,
    name: "الْمُؤْمِنُ",
    transliteration: "Al-Mu'min",
    meaning: "The Giver of Security",
    description: "The One who witnessed for Himself that no one is God but Him. And He witnessed for His believers that they are truthful in their belief that no one is God but Him.",
  },
  {
    id: 7,
    name: "الْمُهَيْمِنُ",
    transliteration: "Al-Muhaymin",
    meaning: "The Guardian",
    description: "The One who witnesses the saying and deeds of His creatures.",
  },
  {
    id: 8,
    name: "الْعَزِيزُ",
    transliteration: "Al-Aziz",
    meaning: "The Almighty",
    description: "The Defeater who is not defeated.",
  },
  {
    id: 9,
    name: "الْجَبَّارُ",
    transliteration: "Al-Jabbar",
    meaning: "The Compeller",
    description: "The One that nothing happens in His Dominion except that which He willed.",
  },
  {
    id: 10,
    name: "الْمُتَكَبِّرُ",
    transliteration: "Al-Mutakabbir",
    meaning: "The Supreme",
    description: "The One who is clear from the attributes of the creatures and from resembling them.",
  },
  {
    id: 11,
    name: "الْخَالِقُ",
    transliteration: "Al-Khaliq",
    meaning: "The Creator",
    description: "The One who brings everything from non-existence to existence.",
  },
  {
    id: 12,
    name: "الْبَارِئُ",
    transliteration: "Al-Bari",
    meaning: "The Evolver",
    description: "The Maker, the Creator who has the Power to turn the entities.",
  },
  {
    id: 13,
    name: "الْمُصَوِّرُ",
    transliteration: "Al-Musawwir",
    meaning: "The Fashioner",
    description: "The One who forms His creatures in different pictures.",
  },
  {
    id: 14,
    name: "الْغَفَّارُ",
    transliteration: "Al-Ghaffar",
    meaning: "The Repeatedly Forgiving",
    description: "The One who forgives the sins of His slaves time and time again.",
  },
  {
    id: 15,
    name: "الْقَهَّارُ",
    transliteration: "Al-Qahhar",
    meaning: "The Subduer",
    description: "The Dominant One over His creatures, nothing can overcome Him.",
  },
  {
    id: 16,
    name: "الْوَهَّابُ",
    transliteration: "Al-Wahhab",
    meaning: "The Bestower",
    description: "The One who is Generous in giving plenty without any return.",
  },
  {
    id: 17,
    name: "الرَّزَّاقُ",
    transliteration: "Ar-Razzaq",
    meaning: "The Provider",
    description: "The One who provides all of creation with sustenance.",
  },
  {
    id: 18,
    name: "الْفَتَّاحُ",
    transliteration: "Al-Fattah",
    meaning: "The Opener",
    description: "The One who opens for His slaves the closed worldly and religious matters.",
  },
  {
    id: 19,
    name: "اَلْعَلِيْمُ",
    transliteration: "Al-Alim",
    meaning: "The All-Knowing",
    description: "The Knowledgeable; The One nothing is absent from His knowledge.",
  },
  {
    id: 20,
    name: "الْقَابِضُ",
    transliteration: "Al-Qabid",
    meaning: "The Withholder",
    description: "The One who constricts provision and expands it.",
  },
  {
    id: 21,
    name: "الْبَاسِطُ",
    transliteration: "Al-Basit",
    meaning: "The Extender",
    description: "The One who expands provision and withholds it.",
  },
  {
    id: 22,
    name: "الْخَافِضُ",
    transliteration: "Al-Khafid",
    meaning: "The Reducer",
    description: "The One who lowers whoever He willed by His Destruction.",
  },
  {
    id: 23,
    name: "الرَّافِعُ",
    transliteration: "Ar-Rafi",
    meaning: "The Exalter",
    description: "The One who raises whoever He willed by His Endowment.",
  },
  {
    id: 24,
    name: "الْمُعِزُّ",
    transliteration: "Al-Mu'izz",
    meaning: "The Honourer",
    description: "The One who gives honor to whoever He willed.",
  },
  {
    id: 25,
    name: "المُذِلُّ",
    transliteration: "Al-Mudhill",
    meaning: "The Dishonourer",
    description: "The One who gives dishonor to whoever He willed.",
  },
  {
    id: 26,
    name: "السَّمِيعُ",
    transliteration: "As-Sami",
    meaning: "The All-Hearing",
    description: "The One who Hears all things that are heard by His Eternal Hearing without an ear or instrument.",
  },
  {
    id: 27,
    name: "الْبَصِيرُ",
    transliteration: "Al-Basir",
    meaning: "The All-Seeing",
    description: "The One who Sees all things that are seen by His Eternal Seeing without a pupil or any other instrument.",
  },
  {
    id: 28,
    name: "الْحَكَمُ",
    transliteration: "Al-Hakam",
    meaning: "The Judge",
    description: "The One who decides, there is none to reverse His judgment and He never wrongs in His judgment.",
  },
  {
    id: 29,
    name: "الْعَدْلُ",
    transliteration: "Al-Adl",
    meaning: "The Just",
    description: "The One who is entitled to do what He does.",
  },
  {
    id: 30,
    name: "اللَّطِيفُ",
    transliteration: "Al-Latif",
    meaning: "The Subtle One",
    description: "The Most Gentle, the Gracious; The One who is kind to His slaves and endows upon them.",
  },
  {
    id: 31,
    name: "الْخَبِيرُ",
    transliteration: "Al-Khabir",
    meaning: "The Aware",
    description: "The One who knows the truth of things.",
  },
  {
    id: 32,
    name: "الْحَلِيمُ",
    transliteration: "Al-Halim",
    meaning: "The Forbearing",
    description: "The One who delays the punishment for those who deserve it and then He might forgive them.",
  },
  {
    id: 33,
    name: "الْعَظِيمُ",
    transliteration: "Al-Azim",
    meaning: "The Magnificent",
    description: "The One deserving the attributes of Exaltment, Glory, Extolment, and Purity from all imperfection.",
  },
  {
    id: 34,
    name: "الْغَفُورُ",
    transliteration: "Al-Ghafur",
    meaning: "The Much-Forgiving",
    description: "The One who forgives the sins of His slaves cover their sins and does not expose them.",
  },
  {
    id: 35,
    name: "الشَّكُورُ",
    transliteration: "Ash-Shakur",
    meaning: "The Appreciative",
    description: "The One who gives a lot of reward for a little obedience.",
  },
  {
    id: 36,
    name: "الْعَلِيُّ",
    transliteration: "Al-Ali",
    meaning: "The Most High",
    description: "The One who is higher than the status of the creation in every manner.",
  },
  {
    id: 37,
    name: "الْكَبِيرُ",
    transliteration: "Al-Kabir",
    meaning: "The Great",
    description: "The One who is greater than everything in status.",
  },
  {
    id: 38,
    name: "الْحَفِيظُ",
    transliteration: "Al-Hafiz",
    meaning: "The Preserver",
    description: "The One who protects whatever and whoever He willed to protect.",
  },
  {
    id: 39,
    name: "المُقيِت",
    transliteration: "Al-Muqit",
    meaning: "The Sustainer",
    description: "The One who has the Power and creates the Power in His creatures.",
  },
  {
    id: 40,
    name: "الْحسِيبُ",
    transliteration: "Al-Hasib",
    meaning: "The Reckoner",
    description: "The One who gives the satisfaction and is sufficient for whatever is needed.",
  },
  {
    id: 41,
    name: "الْجَلِيلُ",
    transliteration: "Al-Jalil",
    meaning: "The Majestic",
    description: "The One who is attributed with greatness of Power and Glory of status.",
  },
  {
    id: 42,
    name: "الْكَرِيمُ",
    transliteration: "Al-Karim",
    meaning: "The Generous",
    description: "The One who is clear from the abjectness and humiliation.",
  },
  {
    id: 43,
    name: "الرَّقِيبُ",
    transliteration: "Ar-Raqib",
    meaning: "The Watchful",
    description: "The One that nothing is absent from Him.",
  },
  {
    id: 44,
    name: "الْمُجِيبُ",
    transliteration: "Al-Mujib",
    meaning: "The Responsive",
    description: "The One who answers the one in need if he asks Him and rescues the yearner if he calls upon Him.",
  },
  {
    id: 45,
    name: "الْوَاسِعُ",
    transliteration: "Al-Wasi",
    meaning: "The All-Encompassing",
    description: "The Ample Giving Whose Ample Giving embraces all things.",
  },
  {
    id: 46,
    name: "الْحَكِيمُ",
    transliteration: "Al-Hakim",
    meaning: "The Wise",
    description: "The One who is correct in His doings.",
  },
  {
    id: 47,
    name: "الْوَدُودُ",
    transliteration: "Al-Wadud",
    meaning: "The Loving",
    description: "The One who loves His believing slaves and His believing slaves love Him.",
  },
  {
    id: 48,
    name: "الْمَجِيدُ",
    transliteration: "Al-Majid",
    meaning: "The Glorious",
    description: "The One who is with perfect Power, High Status, Compassion, Generosity and Kindness.",
  },
  {
    id: 49,
    name: "الْبَاعِثُ",
    transliteration: "Al-Ba'ith",
    meaning: "The Resurrector",
    description: "The One who resurrects His slaves after death for reward and/or punishment.",
  },
  {
    id: 50,
    name: "الشَّهِيدُ",
    transliteration: "Ash-Shahid",
    meaning: "The Witness",
    description: "The One who nothing is absent from Him.",
  },
  {
    id: 51,
    name: "الْحَقُّ",
    transliteration: "Al-Haqq",
    meaning: "The Truth",
    description: "The One who truly exists and His Existence is obvious and well-known.",
  },
  {
    id: 52,
    name: "الْوَكِيلُ",
    transliteration: "Al-Wakil",
    meaning: "The Trustee",
    description: "The One who gives the satisfaction and is relied upon.",
  },
  {
    id: 53,
    name: "الْقَوِيُّ",
    transliteration: "Al-Qawiyy",
    meaning: "The Strong",
    description: "The One with the complete Power and is not unable over anything.",
  },
  {
    id: 54,
    name: "الْمَتِينُ",
    transliteration: "Al-Matin",
    meaning: "The Firm",
    description: "The One with extreme Power which is un-interrupted and He does not get tired.",
  },
  {
    id: 55,
    name: "الْوَلِيُّ",
    transliteration: "Al-Waliyy",
    meaning: "The Protecting Friend",
    description: "The One who supports and gives victory to His believing slaves.",
  },
  {
    id: 56,
    name: "الْحَمِيدُ",
    transliteration: "Al-Hamid",
    meaning: "The Praiseworthy",
    description: "The praised One who deserves to be praised.",
  },
  {
    id: 57,
    name: "الْمُحْصِي",
    transliteration: "Al-Muhsi",
    meaning: "The Reckoner",
    description: "The One who counts the things He created and knows their details.",
  },
  {
    id: 58,
    name: "الْمُبْدِئُ",
    transliteration: "Al-Mubdi",
    meaning: "The Originator",
    description: "The One who started the human being.",
  },
  {
    id: 59,
    name: "الْمُعِيدُ",
    transliteration: "Al-Mu'id",
    meaning: "The Restorer",
    description: "The One who brings back the creatures after death.",
  },
  {
    id: 60,
    name: "الْمُحْيِي",
    transliteration: "Al-Muhyi",
    meaning: "The Giver of Life",
    description: "The One who took out a living human from semen that does not have a soul.",
  },
  {
    id: 61,
    name: "اَلْمُمِيتُ",
    transliteration: "Al-Mumit",
    meaning: "The Bringer of Death",
    description: "The One who renders the living dead.",
  },
  {
    id: 62,
    name: "الْحَيُّ",
    transliteration: "Al-Hayy",
    meaning: "The Ever-Living",
    description: "The One attributed with a life that is unlike our life and is not that of a combination of soul, flesh or blood.",
  },
  {
    id: 63,
    name: "الْقَيُّومُ",
    transliteration: "Al-Qayyum",
    meaning: "The Self-Sustaining",
    description: "The One who remains and does not end.",
  },
  {
    id: 64,
    name: "الْوَاجِدُ",
    transliteration: "Al-Wajid",
    meaning: "The Finder",
    description: "The Rich who is never poor.",
  },
  {
    id: 65,
    name: "الْمَاجِدُ",
    transliteration: "Al-Majid",
    meaning: "The Noble",
    description: "The One who is Majid, noble and generous.",
  },
  {
    id: 66,
    name: "الْواحِدُ",
    transliteration: "Al-Wahid",
    meaning: "The Unique",
    description: "The One without a partner.",
  },
  {
    id: 67,
    name: "اَلاَحَدُ",
    transliteration: "Al-Ahad",
    meaning: "The One",
    description: "The One.",
  },
  {
    id: 68,
    name: "الصَّمَدُ",
    transliteration: "As-Samad",
    meaning: "The Eternal",
    description: "The Master who is relied upon in matters and is resorted to in one's needs.",
  },
  {
    id: 69,
    name: "الْقَادِرُ",
    transliteration: "Al-Qadir",
    meaning: "The Capable",
    description: "The One attributed with Power over everything.",
  },
  {
    id: 70,
    name: "الْمُقْتَدِرُ",
    transliteration: "Al-Muqtadir",
    meaning: "The Powerful",
    description: "The One with the perfect Power that nothing is withheld from Him.",
  },
  {
    id: 71,
    name: "الْمُقَدِّمُ",
    transliteration: "Al-Muqaddim",
    meaning: "The Expediter",
    description: "The One who puts forward who He wills.",
  },
  {
    id: 72,
    name: "الْمُؤَخِّرُ",
    transliteration: "Al-Mu'akhkhir",
    meaning: "The Delayer",
    description: "The One who delays who He wills.",
  },
  {
    id: 73,
    name: "الأوَّلُ",
    transliteration: "Al-Awwal",
    meaning: "The First",
    description: "The One whose Existence is without a beginning.",
  },
  {
    id: 74,
    name: "الآخِرُ",
    transliteration: "Al-Akhir",
    meaning: "The Last",
    description: "The One whose Existence is without an end.",
  },
  {
    id: 75,
    name: "الظَّاهِرُ",
    transliteration: "Az-Zahir",
    meaning: "The Manifest",
    description: "The One that nothing is above Him and nothing is underneath Him, hence He exists without a place.",
  },
  {
    id: 76,
    name: "الْبَاطِنُ",
    transliteration: "Al-Batin",
    meaning: "The Hidden",
    description: "The One that nothing is above Him and nothing is underneath Him, hence He exists without a place.",
  },
  {
    id: 77,
    name: "الْوَالِي",
    transliteration: "Al-Wali",
    meaning: "The Governor",
    description: "The One who owns things and manages them.",
  },
  {
    id: 78,
    name: "الْمُتَعَالِي",
    transliteration: "Al-Muta'ali",
    meaning: "The Most Exalted",
    description: "The One who is clear from the attributes of the creation.",
  },
  {
    id: 79,
    name: "الْبَرُّ",
    transliteration: "Al-Barr",
    meaning: "The Source of Goodness",
    description: "The One who is kind to His creatures and who is righteous.",
  },
  {
    id: 80,
    name: "التَّوَابُ",
    transliteration: "At-Tawwab",
    meaning: "The Acceptor of Repentance",
    description: "The One who grants repentance to whoever He willed among His creatures and accepts his repentance.",
  },
  {
    id: 81,
    name: "الْمُنْتَقِمُ",
    transliteration: "Al-Muntaqim",
    meaning: "The Avenger",
    description: "The One who victoriously prevails over His enemies and punishes them for their sins.",
  },
  {
    id: 82,
    name: "العَفُوُّ",
    transliteration: "Al-Afuww",
    meaning: "The Pardoner",
    description: "The One with wide forgiveness.",
  },
  {
    id: 83,
    name: "الرَّؤُوفُ",
    transliteration: "Ar-Ra'uf",
    meaning: "The Most Kind",
    description: "The One with extreme Mercy.",
  },
  {
    id: 84,
    name: "مَالِكُ الْمُلْكِ",
    transliteration: "Malik-ul-Mulk",
    meaning: "Master of the Kingdom",
    description: "The One who controls the Dominion and gives dominion to whoever He wills.",
  },
  {
    id: 85,
    name: "ذُوالْجَلاَلِ وَالإكْرَامِ",
    transliteration: "Dhul-Jalali wal-Ikram",
    meaning: "Possessor of Glory and Honour",
    description: "The One who deserves to be Exalted and not denied.",
  },
  {
    id: 86,
    name: "الْمُقْسِطُ",
    transliteration: "Al-Muqsit",
    meaning: "The Equitable",
    description: "The One who is Just in His judgment.",
  },
  {
    id: 87,
    name: "الْجَامِعُ",
    transliteration: "Al-Jami",
    meaning: "The Gatherer",
    description: "The One who gathers the creatures in the Day of Resurrection.",
  },
  {
    id: 88,
    name: "الْغَنِيُّ",
    transliteration: "Al-Ghani",
    meaning: "The Self-Sufficient",
    description: "The One who does not need the creation.",
  },
  {
    id: 89,
    name: "الْمُغْنِي",
    transliteration: "Al-Mughni",
    meaning: "The Enricher",
    description: "The One who satisfies the necessities of the creatures.",
  },
  {
    id: 90,
    name: "اَلْمَانِعُ",
    transliteration: "Al-Mani'",
    meaning: "The Preventer",
    description: "The Preventer who decides to prevent whatever He wills.",
  },
  {
    id: 91,
    name: "الضَّارَّ",
    transliteration: "Ad-Darr",
    meaning: "The Distresser",
    description: "The One who makes harm reach to whoever He wills.",
  },
  {
    id: 92,
    name: "النَّافِعُ",
    transliteration: "An-Nafi'",
    meaning: "The Benefactor",
    description: "The One who gives benefits to whoever He wills.",
  },
  {
    id: 93,
    name: "النُّورُ",
    transliteration: "An-Nur",
    meaning: "The Light",
    description: "The One who guides.",
  },
  {
    id: 94,
    name: "الْهَادِي",
    transliteration: "Al-Hadi",
    meaning: "The Guide",
    description: "The One whom with His Guidance His believers were guided, and with His Guidance the living beings have been guided to what is beneficial for them.",
  },
  {
    id: 95,
    name: "الْبَدِيعُ",
    transliteration: "Al-Badi",
    meaning: "The Incomparable",
    description: "The One who created the creation and formed it without any preceding example.",
  },
  {
    id: 96,
    name: "اَلْبَاقِي",
    transliteration: "Al-Baqi",
    meaning: "The Everlasting",
    description: "The One that the state of non-existence is impossible for Him.",
  },
  {
    id: 97,
    name: "الْوَارِثُ",
    transliteration: "Al-Warith",
    meaning: "The Inheritor",
    description: "The One whose Existence remains after the extinction of all creation.",
  },
  {
    id: 98,
    name: "الرَّشِيدُ",
    transliteration: "Ar-Rashid",
    meaning: "The Guide to the Right Path",
    description: "The One who guides.",
  },
  {
    id: 99,
    name: "الصَّبُورُ",
    transliteration: "As-Sabur",
    meaning: "The Patient",
    description: "The One who does not quickly punish the sinners.",
  },
]

/**
 * Allah's Names API Service
 */
export class NamesApi {
  /**
   * Get all 99 Names of Allah
   */
  getNames(): AllahName[] {
    return ALLAH_NAMES
  }

  /**
   * Get a specific name by ID
   */
  getName(id: number): AllahName | undefined {
    return ALLAH_NAMES.find((n) => n.id === id)
  }

  /**
   * Search names by transliteration or meaning
   */
  searchNames(query: string): AllahName[] {
    const lowerQuery = query.toLowerCase()
    return ALLAH_NAMES.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(lowerQuery) ||
        n.meaning.toLowerCase().includes(lowerQuery) ||
        (n.description && n.description.toLowerCase().includes(lowerQuery)),
    )
  }

  /**
   * Get a random name (Name of the Day)
   */
  getRandomName(): AllahName {
    const randomIndex = Math.floor(Math.random() * ALLAH_NAMES.length)
    return ALLAH_NAMES[randomIndex]
  }
}

// Export singleton instance
export const namesApi = new NamesApi()
