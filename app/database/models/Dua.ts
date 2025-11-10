import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class Dua extends Model {
  static table = 'duas'
  @field('dua_id') duaId!: string
  @field('title') title!: string
  @field('title_arabic') titleArabic!: string
  @field('category') category!: string
  @field('text_arabic') textArabic!: string
  @field('text_transliteration') textTransliteration!: string
  @field('text_translation') textTranslation!: string
  @field('reference') reference?: string
  @field('audio_url') audioUrl?: string
  @readonly @date('created_at') createdAt!: Date
}
