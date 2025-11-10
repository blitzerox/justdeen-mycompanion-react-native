import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class HadithBook extends Model {
  static table = 'hadith_books'
  @field('collection_id') collectionId!: string
  @field('book_number') bookNumber!: number
  @field('name') name!: string
  @field('name_arabic') nameArabic!: string
  @field('total_hadiths') totalHadiths!: number
  @readonly @date('created_at') createdAt!: Date
}
