import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class Hadith extends Model {
  static table = 'hadiths'
  @field('hadith_id') hadithId!: string
  @field('collection_id') collectionId!: string
  @field('book_number') bookNumber!: number
  @field('hadith_number') hadithNumber!: number
  @field('text_arabic') textArabic!: string
  @field('text_english') textEnglish!: string
  @field('narrator') narrator?: string
  @field('grade') grade?: string
  @readonly @date('created_at') createdAt!: Date
}
