import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class Surah extends Model {
  static table = 'surahs'

  @field('surah_number') surahNumber!: number
  @field('name_arabic') nameArabic!: string
  @field('name_transliteration') nameTransliteration!: string
  @field('name_translation') nameTranslation!: string
  @field('revelation_place') revelationPlace!: string
  @field('total_verses') totalVerses!: number

  @readonly @date('created_at') createdAt!: Date
}
