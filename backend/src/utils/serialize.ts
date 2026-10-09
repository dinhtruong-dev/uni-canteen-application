// src/utils/serialize.ts
/**
 * Chuyển Sequelize instance hoặc plain object về plain object an toàn.
 */
export function toPlain<T>(obj: T | null | undefined): any {
    if (obj == null) return obj;
    return typeof (obj as any).toJSON === 'function' ? (obj as any).toJSON() : obj;
}

export function toPlainList<T>(arr: T[] | null | undefined): any[] {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.map((item) => toPlain(item));
}

