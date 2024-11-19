import { IRepository } from './interfaces/IRepository';
import { SupabaseRepository } from './supabase/SupabaseRepository';

export class RepositoryFactory {
  constructor () { }
  static createRepository(databaseType: string): IRepository {
    switch (databaseType) {
      case 'supabase':
        return new SupabaseRepository();
      default:
        throw new Error('Unsupported database');
    }
  }
}
