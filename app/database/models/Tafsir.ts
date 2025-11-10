import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class Tafsir extends Model {
  static table = 'tafsir'
  @field('surah_number') surahNumber!: number
  @field('ayah_number') ayahNumber!: number
  @field('tafsir_id') tafsirId!: string
  @field('text') text!: string
  @field('language') language!: string
  @readonly @date('created_at') createdAt!: Date
}
