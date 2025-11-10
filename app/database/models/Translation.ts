import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class Translation extends Model {
  static table = 'translations'

  @field('surah_number') surahNumber!: number
  @field('ayah_number') ayahNumber!: number
  @field('language') language!: string
  @field('translator_id') translatorId!: string
  @field('text') text!: string
  @field('footnotes') footnotes?: string

  @readonly @date('created_at') createdAt!: Date
}
