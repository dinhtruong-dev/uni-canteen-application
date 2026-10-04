/**
 * ==============================================================================
 * UNIEAT CAMPUS - FRONTEND CONFIGURATION & CONSTANTS
 * ==============================================================================
 * All business and dynamic data is fetched live from the Express/MySQL Backend API.
 * Hardcoded mock data has been purged.
 * ==============================================================================
 */

import {
  Canteen,
  Category,
  FoodItem,
  Promotion,
  TimeSlot,
  User,
  Order,
  Notification,
  WalletTransaction,
  CampusLocationNode,
  TableInfo,
} from '../types';

export const MOCK_CANTEENS: Canteen[] = [];
export const MOCK_CATEGORIES: Category[] = [];
export const MOCK_FOODS: FoodItem[] = [];
export const MOCK_TABLES: TableInfo[] = [];
export const MOCK_TIME_SLOTS: TimeSlot[] = [];
export const MOCK_PROMOTIONS: Promotion[] = [];
export const MOCK_CAMPUS_LOCATIONS: CampusLocationNode[] = [];
export const MOCK_USERS: User[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [];
