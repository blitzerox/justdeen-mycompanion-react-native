/**
 * Achievements System
 * Defines all achievements, badges, and milestones
 */

export type AchievementCategory = "prayer" | "quran" | "tasbih" | "general" | "streak" | "level"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  iconColor: string
  category: AchievementCategory
  condition: (stats: any) => boolean
  points: number
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
}

/**
 * All achievements in the app
 */
export const ACHIEVEMENTS: Achievement[] = [
  // === PRAYER ACHIEVEMENTS ===
  {
    id: "first_prayer",
    title: "First Step",
    description: "Complete your first tracked prayer",
    icon: "person-praying",
    iconColor: "#8B5CF6",
    category: "prayer",
    condition: (stats) => stats.totalPrayersPrayed >= 1,
    points: 5,
    rarity: "common",
  },
  {
    id: "prayer_warrior_10",
    title: "Prayer Warrior",
    description: "Pray 10 prayers",
    icon: "person-praying",
    iconColor: "#8B5CF6",
    category: "prayer",
    condition: (stats) => stats.totalPrayersPrayed >= 10,
    points: 10,
    rarity: "common",
  },
  {
    id: "prayer_warrior_50",
    title: "Dedicated Worshipper",
    description: "Pray 50 prayers",
    icon: "person-praying",
    iconColor: "#8B5CF6",
    category: "prayer",
    condition: (stats) => stats.totalPrayersPrayed >= 50,
    points: 25,
    rarity: "uncommon",
  },
  {
    id: "prayer_warrior_100",
    title: "Prayer Champion",
    description: "Pray 100 prayers",
    icon: "person-praying",
    iconColor: "#8B5CF6",
    category: "prayer",
    condition: (stats) => stats.totalPrayersPrayed >= 100,
    points: 50,
    rarity: "rare",
  },
  {
    id: "prayer_master",
    title: "Prayer Master",
    description: "Pray 500 prayers",
    icon: "mosque",
    iconColor: "#8B5CF6",
    category: "prayer",
    condition: (stats) => stats.totalPrayersPrayed >= 500,
    points: 100,
    rarity: "epic",
  },
  {
    id: "prayer_legend",
    title: "Prayer Legend",
    description: "Pray 1000 prayers",
    icon: "kaaba",
    iconColor: "#FFD700",
    category: "prayer",
    condition: (stats) => stats.totalPrayersPrayed >= 1000,
    points: 200,
    rarity: "legendary",
  },

  // === QURAN ACHIEVEMENTS ===
  {
    id: "quran_reader",
    title: "Quran Reader",
    description: "Read your first page of Quran",
    icon: "book-quran",
    iconColor: "#3B82F6",
    category: "quran",
    condition: (stats) => stats.totalQuranPagesRead >= 1,
    points: 5,
    rarity: "common",
  },
  {
    id: "juz_complete",
    title: "Juz Complete",
    description: "Read 20 pages (1 Juz)",
    icon: "book-quran",
    iconColor: "#3B82F6",
    category: "quran",
    condition: (stats) => stats.totalQuranPagesRead >= 20,
    points: 20,
    rarity: "uncommon",
  },
  {
    id: "quran_scholar",
    title: "Quran Scholar",
    description: "Read 100 pages",
    icon: "book-quran",
    iconColor: "#3B82F6",
    category: "quran",
    condition: (stats) => stats.totalQuranPagesRead >= 100,
    points: 50,
    rarity: "rare",
  },
  {
    id: "hafiz_journey",
    title: "Hafiz Journey",
    description: "Read 300 pages",
    icon: "book-bookmark",
    iconColor: "#3B82F6",
    category: "quran",
    condition: (stats) => stats.totalQuranPagesRead >= 300,
    points: 100,
    rarity: "epic",
  },
  {
    id: "quran_master",
    title: "Quran Master",
    description: "Read 604 pages (Complete Quran)",
    icon: "book-atlas",
    iconColor: "#FFD700",
    category: "quran",
    condition: (stats) => stats.totalQuranPagesRead >= 604,
    points: 250,
    rarity: "legendary",
  },

  // === TASBIH ACHIEVEMENTS ===
  {
    id: "first_dhikr",
    title: "First Dhikr",
    description: "Complete your first tasbih",
    icon: "hand",
    iconColor: "#9C27B0",
    category: "tasbih",
    condition: (stats) => stats.tasbihSessionsCompleted >= 1,
    points: 5,
    rarity: "common",
  },
  {
    id: "dhikr_devotee",
    title: "Dhikr Devotee",
    description: "Complete 10 tasbih sessions",
    icon: "hand",
    iconColor: "#9C27B0",
    category: "tasbih",
    condition: (stats) => stats.tasbihSessionsCompleted >= 10,
    points: 15,
    rarity: "uncommon",
  },
  {
    id: "counter_100",
    title: "Century Counter",
    description: "Count 100 tasbihs",
    icon: "hand",
    iconColor: "#9C27B0",
    category: "tasbih",
    condition: (stats) => stats.totalTasbihCount >= 100,
    points: 10,
    rarity: "common",
  },
  {
    id: "counter_1000",
    title: "Millennium Counter",
    description: "Count 1000 tasbihs",
    icon: "hands-praying",
    iconColor: "#9C27B0",
    category: "tasbih",
    condition: (stats) => stats.totalTasbihCount >= 1000,
    points: 50,
    rarity: "rare",
  },
  {
    id: "dhikr_master",
    title: "Dhikr Master",
    description: "Count 10,000 tasbihs",
    icon: "sparkles",
    iconColor: "#FFD700",
    category: "tasbih",
    condition: (stats) => stats.totalTasbihCount >= 10000,
    points: 200,
    rarity: "legendary",
  },

  // === STREAK ACHIEVEMENTS ===
  {
    id: "streak_3",
    title: "Getting Started",
    description: "Maintain a 3-day prayer streak",
    icon: "fire",
    iconColor: "#FF6B35",
    category: "streak",
    condition: (stats) => stats.prayersStreakDays >= 3,
    points: 10,
    rarity: "common",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day prayer streak",
    icon: "fire",
    iconColor: "#FF6B35",
    category: "streak",
    condition: (stats) => stats.prayersStreakDays >= 7,
    points: 25,
    rarity: "uncommon",
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "Maintain a 30-day prayer streak",
    icon: "fire-flame-curved",
    iconColor: "#FF6B35",
    category: "streak",
    condition: (stats) => stats.prayersStreakDays >= 30,
    points: 75,
    rarity: "rare",
  },
  {
    id: "streak_100",
    title: "Consistency Champion",
    description: "Maintain a 100-day prayer streak",
    icon: "fire-flame-curved",
    iconColor: "#FF6B35",
    category: "streak",
    condition: (stats) => stats.prayersStreakDays >= 100,
    points: 150,
    rarity: "epic",
  },
  {
    id: "streak_365",
    title: "Unwavering Faith",
    description: "Maintain a 365-day prayer streak",
    icon: "circle-radiation",
    iconColor: "#FFD700",
    category: "streak",
    condition: (stats) => stats.prayersStreakDays >= 365,
    points: 500,
    rarity: "legendary",
  },

  // === LEVEL ACHIEVEMENTS ===
  {
    id: "level_5",
    title: "Rising Star",
    description: "Reach Level 5",
    icon: "star",
    iconColor: "#FFD700",
    category: "level",
    condition: (stats) => stats.level >= 5,
    points: 25,
    rarity: "common",
  },
  {
    id: "level_10",
    title: "Spiritual Seeker",
    description: "Reach Level 10",
    icon: "trophy",
    iconColor: "#FFD700",
    category: "level",
    condition: (stats) => stats.level >= 10,
    points: 100,
    rarity: "rare",
  },

  // === GENERAL ACHIEVEMENTS ===
  {
    id: "points_100",
    title: "Century Club",
    description: "Earn 100 total points",
    icon: "coins",
    iconColor: "#FFD700",
    category: "general",
    condition: (stats) => stats.totalPoints >= 100,
    points: 10,
    rarity: "common",
  },
  {
    id: "points_500",
    title: "Point Collector",
    description: "Earn 500 total points",
    icon: "coins",
    iconColor: "#FFD700",
    category: "general",
    condition: (stats) => stats.totalPoints >= 500,
    points: 25,
    rarity: "uncommon",
  },
  {
    id: "points_1000",
    title: "Point Master",
    description: "Earn 1000 total points",
    icon: "sack-dollar",
    iconColor: "#FFD700",
    category: "general",
    condition: (stats) => stats.totalPoints >= 1000,
    points: 50,
    rarity: "rare",
  },
  {
    id: "points_5000",
    title: "Point Legend",
    description: "Earn 5000 total points",
    icon: "gem",
    iconColor: "#FFD700",
    category: "general",
    condition: (stats) => stats.totalPoints >= 5000,
    points: 200,
    rarity: "epic",
  },
  {
    id: "all_rounder",
    title: "All-Rounder",
    description: "Pray 50 times, read 50 pages, and count 500 tasbihs",
    icon: "circle-check",
    iconColor: "#10B981",
    category: "general",
    condition: (stats) =>
      stats.totalPrayersPrayed >= 50 &&
      stats.totalQuranPagesRead >= 50 &&
      stats.totalTasbihCount >= 500,
    points: 100,
    rarity: "epic",
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete all 5 prayers in a day",
    icon: "check-double",
    iconColor: "#10B981",
    category: "general",
    condition: (stats) => stats.totalPrayersPrayed >= 5, // This would need day-specific logic
    points: 20,
    rarity: "uncommon",
  },
]

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  return ACHIEVEMENTS.filter((a) => a.category === category)
}

/**
 * Get unlocked achievements for a user
 */
export const getUnlockedAchievements = (stats: any): Achievement[] => {
  return ACHIEVEMENTS.filter((achievement) => achievement.condition(stats))
}

/**
 * Get locked achievements for a user
 */
export const getLockedAchievements = (stats: any): Achievement[] => {
  return ACHIEVEMENTS.filter((achievement) => !achievement.condition(stats))
}

/**
 * Calculate achievement completion percentage
 */
export const getAchievementProgress = (stats: any): number => {
  const unlocked = getUnlockedAchievements(stats).length
  const total = ACHIEVEMENTS.length
  return Math.round((unlocked / total) * 100)
}

/**
 * Get newly unlocked achievements (to show notifications)
 * Compare current unlocked against previously unlocked
 */
export const getNewlyUnlockedAchievements = (
  stats: any,
  previouslyUnlockedIds: string[]
): Achievement[] => {
  const currentUnlocked = getUnlockedAchievements(stats)
  return currentUnlocked.filter((achievement) => !previouslyUnlockedIds.includes(achievement.id))
}

/**
 * Get rarity color
 */
export const getRarityColor = (rarity: Achievement["rarity"]): string => {
  switch (rarity) {
    case "common":
      return "#9CA3AF"
    case "uncommon":
      return "#10B981"
    case "rare":
      return "#3B82F6"
    case "epic":
      return "#8B5CF6"
    case "legendary":
      return "#FFD700"
    default:
      return "#9CA3AF"
  }
}
