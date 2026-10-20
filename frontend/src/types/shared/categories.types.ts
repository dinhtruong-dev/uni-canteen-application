export interface Category {
    id: string;
    name: string;
    slug?: string;
    icon: string;
    image?: string;
    description?: string;
    canteenId?: string;
    parentId?: string;
    sortOrder?: number;
    isActive?: boolean;
    foodCount?: number;
    createdAt?: string;
    updatedAt?: string;
}