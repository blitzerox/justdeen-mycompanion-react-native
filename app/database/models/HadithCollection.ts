import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class HadithCollection extends Model {
  static table = 'hadith_collections'
  @field('collection_id') collectionId!: string
  @field('name') name!: string
  @field('name_arabic') nameArabic!: string
  @field('total_hadiths') totalHadiths!: number
  @field('description') description?: string
  @readonly @date('created_at') createdAt!: Date
}
