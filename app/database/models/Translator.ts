import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class Translator extends Model {
  static table = 'translators'
  @field('translator_id') translatorId!: string
  @field('name') name!: string
  @field('language') language!: string
  @field('description') description?: string
  @readonly @date('created_at') createdAt!: Date
}
