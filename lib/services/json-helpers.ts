import type { Json } from '../supabase/database.types';

export const toJson = <T>(val: T): Json => val as unknown as Json;

export const fromJson = <T>(val: Json): T => val as unknown as T;
