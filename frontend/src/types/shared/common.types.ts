export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
}

export type StaffApiResponse<T = any> = ApiResponse<T>;