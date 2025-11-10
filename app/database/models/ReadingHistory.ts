import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class ReadingHistory extends Model {
  static table = 'reading_history'
  @field('content_type') contentType!: string
  @field('content_id') contentId!: string
  @field('last_read_at') lastReadAt!: number
  @field('read_count') readCount!: number
  @readonly @date('created_at') createdAt!: Date
}
