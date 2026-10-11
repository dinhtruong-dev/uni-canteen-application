import { apiClient } from './apiClient';
import type { FoodItem } from '../../types/food.types';
import type { Category } from '../../types/canteen.types';


export const adaptProductToFood = (p: any): FoodItem => ({
  id: p.id,
  name: p.name,
  canteenId: p.canteenId || 'cant-a',
  canteenName: p.canteenName || 'Căng tin A2',
  categoryId: p.categoryId || 'cat-1',
  categoryName: p.categoryName || 'Cơm Sinh Viên',
  price: Number(p.price) || 0,
  originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
  image: p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
  description: p.description || '',
  ingredients: p.ingredients || ['Gia vị truyền thống', 'Thực phẩm tươi trong ngày'],
  isBestSeller: Boolean(p.isBestSeller || p.isBestseller),
  isNew: Boolean(p.isNew),
  isVegetarian: Boolean(p.isVegetarian),
  isAvailable: p.isAvailable !== false,
  rating: Number(p.rating) || 4.9,
  reviewCount: Number(p.reviewCount) || 120,
  soldCount: Number(p.soldCount) || 250,
  preparationTime: Number(p.preparationTime) || 10,
  sizes: p.options
    ?.filter((o: any) => o.type === 'SIZE')
    .flatMap((o: any) =>
      o.items?.map((item: any) => ({ name: item.name, price: Number(item.extraPrice) || 0 }))
    ) || [
      { name: 'Suất vừa (Tiêu chuẩn)', price: 0 },
      { name: 'Suất lớn (+ Thêm đồ)', price: 10000 },
    ],
  toppings: p.options
    ?.filter((o: any) => o.type === 'TOPPING')
    .flatMap((o: any) =>
      o.items?.map((item: any) => ({ id: item.id, name: item.name, price: Number(item.extraPrice) || 0 }))
    ) || [
      { id: 'top-1', name: 'Trứng ốp la lòng đào', price: 5000 },
      { id: 'top-2', name: 'Canh rong biển thịt bằm', price: 5000 },
    ],
});

export class MenuService {
  public async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/menu/categories');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || 'Utensils',
        slug: c.slug || c.id,
        image: c.image,
        description: c.description,
      }));
    }
    return [];
  }

  public async getProducts(params?: Record<string, any>): Promise<FoodItem[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/menu/products', params);
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(adaptProductToFood);
    }
    return [];
  }

  public async getProductById(id: string): Promise<FoodItem | null> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/menu/products/${id}`);
    if (res?.success && res.data) {
      return adaptProductToFood(res.data);
    }
    return null;
  }

  public async getBestsellers(): Promise<FoodItem[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/menu/bestsellers');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(adaptProductToFood);
    }
    return [];
  }

  public async createProduct(foodData: any): Promise<FoodItem | null> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/menu/products', foodData);
    if (res?.success && res.data) {
      return adaptProductToFood(res.data);
    }
    return null;
  }

  public async updateProduct(id: string, foodData: any): Promise<FoodItem | null> {
    const res = await apiClient.put<{ success: boolean; data: any }>(`/menu/products/${id}`, foodData);
    if (res?.success && res.data) {
      return adaptProductToFood(res.data);
    }
    return null;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ success: boolean }>(`/menu/products/${id}`);
    return Boolean(res?.success);
  }

  public async toggleAvailability(id: string): Promise<boolean> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(`/menu/products/${id}/availability`);
    return Boolean(res?.success);
  }
}

export const menuService = new MenuService();
