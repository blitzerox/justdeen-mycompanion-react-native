import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export class OfflineBookmark extends Model {
  static table = 'offline_bookmarks'
  @field('bookmark_id') bookmarkId!: string
  @field('content_type') contentType!: string
  @field('content_id') contentId!: string
  @field('note') note?: string
  @field('tags') tags?: string
  @field('synced') synced!: boolean
  @readonly @date('created_at') createdAt!: Date
}
