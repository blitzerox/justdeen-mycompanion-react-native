import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class AudioDownload extends Model {
  static table = 'audio_downloads'
  @field('surah_number') surahNumber!: number
  @field('reciter_id') reciterId!: string
  @field('file_path') filePath!: string
  @field('file_size') fileSize!: number
  @field('downloaded_at') downloadedAt!: number
}
