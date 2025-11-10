import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class Ayah extends Model {
  static table = 'ayahs'

  @field('surah_number') surahNumber!: number
  @field('ayah_number') ayahNumber!: number
  @field('text_arabic') textArabic!: string
  @field('text_uthmani') textUthmani!: string
  @field('juz') juz!: number
  @field('page') page!: number
  @field('manzil') manzil!: number
  @field('ruku') ruku!: number
  @field('hizb') hizb!: number
  @field('sajda') sajda!: boolean

  @readonly @date('created_at') createdAt!: Date
}
