import Dexie,{ type EntityTable} from 'dexie'
import { ProviderProps } from './types/appType'

// 定义数据库
export const db = new Dexie('vChatDatabse') as Dexie & {
  providers: EntityTable<ProviderProps, 'id'>
}

db.version(1).stores({
  providers: '++id, name'
})