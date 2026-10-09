// src/services/staff.service.ts
import { Op, fn, col, literal } from 'sequelize';
import {
    Order,
    OrderDetail,
    Product,
    Category,
    Voucher,
    PickupSlot,
    DiningTable,
    Review,
} from '../models';
import { orderService } from './order.service';
import { tableService } from './table.service';
import { menuService } from './menu.service';
import { interactionService } from './interaction.service';
import { marketingService } from './marketing.service';
import { canteenService } from './canteen.service';
import { redisService } from './redis.service';
import type { OrderStatus } from '../types/order.types';

export class StaffService {
    // ===========================================================================
    // DASHBOARD
    // ===========================================================================

    public async getDashboard(canteenId: string) {
        const orders = await orderService.getAllOrders(undefined, canteenId);

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = startOfToday - 7 * 24 * 3600 * 1000;
        const startOfMonth = startOfToday - 30 * 24 * 3600 * 1000;

        let todayRevenue = 0;
        let weekRevenue = 0;
        let monthRevenue = 0;
        let completedToday = 0;
        let newOrdersCount = 0;
        let preparingCount = 0;
        let readyOrPickupCount = 0;
        let deliveringCount = 0;

        orders.forEach((o) => {
            const orderTime = o.createdAt.getTime();

            if (o.status === 'PENDING') newOrdersCount++;
            else if (o.status === 'PREPARING') preparingCount++;
            else if (o.status === 'READY' || o.status === 'WAITING_PICKUP') readyOrPickupCount++;
            else if (o.status === 'DELIVERING') deliveringCount++;

            if (o.status === 'COMPLETED' || o.isPaid) {
                if (orderTime >= startOfToday) {
                    todayRevenue += o.finalAmount;
                    if (o.status === 'COMPLETED') completedToday++;
                }
                if (orderTime >= startOfWeek) weekRevenue += o.finalAmount;
                if (orderTime >= startOfMonth) monthRevenue += o.finalAmount;
            }
        });

        const sorted = [...orders].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        const recentOrders = this.enrichWithElapsed(sorted.slice(0, 10));
        const pendingOrders = this.enrichWithElapsed(
            sorted.filter((o) => o.status === 'PENDING')
        );

        const canteen = await canteenService.getCanteenById(canteenId);

        return {
            canteen: canteen || null,
            kpis: {
                newOrders: newOrdersCount,
                preparing: preparingCount,
                waitingPickup: readyOrPickupCount,
                delivering: deliveringCount,
                completedToday,
                todayRevenue,
                weekRevenue,
                monthRevenue,
            },
            recentOrders,
            pendingOrders,
        };
    }

    public async getStatistics(canteenId: string) {
        const orders = await orderService.getAllOrders(undefined, canteenId);

        const daysMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            daysMap[key] = { date: key, revenue: 0, ordersCount: 0 };
        }

        const methodBreakdown = {
            DINE_IN: { count: 0, revenue: 0 },
            TAKEAWAY: { count: 0, revenue: 0 },
            DELIVERY: { count: 0, revenue: 0 },
        };

        const productSales: Record<
            string,
            { id: string; name: string; image: string; quantity: number; revenue: number }
        > = {};

        let totalRevenue = 0;
        let totalOrders = 0;
        let completedOrders = 0;
        let cancelledOrders = 0;

        orders.forEach((o) => {
            totalOrders++;
            if (o.status === 'COMPLETED') completedOrders++;
            if (o.status === 'CANCELLED') cancelledOrders++;

            if (o.status === 'COMPLETED' || o.isPaid) {
                totalRevenue += o.finalAmount;

                const key = o.createdAt.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                });
                if (daysMap[key]) {
                    daysMap[key].revenue += o.finalAmount;
                    daysMap[key].ordersCount += 1;
                }

                const m = o.orderType || 'DINE_IN';
                if (methodBreakdown[m as keyof typeof methodBreakdown]) {
                    methodBreakdown[m as keyof typeof methodBreakdown].count += 1;
                    methodBreakdown[m as keyof typeof methodBreakdown].revenue += o.finalAmount;
                }

                o.orderDetails?.forEach((d) => {
                    if (!productSales[d.productId]) {
                        productSales[d.productId] = {
                            id: d.productId,
                            name: d.productName,
                            image: d.productImage,
                            quantity: 0,
                            revenue: 0,
                        };
                    }
                    productSales[d.productId].quantity += d.quantity;
                    productSales[d.productId].revenue += d.itemSubtotal;
                });
            }
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        return {
            totalRevenue,
            totalOrders,
            completedOrders,
            cancelledOrders,
            methodBreakdown,
            dailyChart: Object.values(daysMap),
            topProducts,
        };
    }

    // ===========================================================================
    // ORDER
    // ===========================================================================

    public async getOrders(params: {
        canteenId?: string;
        receiveMethod?: string;
        orderType?: string;
        status?: string;
        paymentStatus?: string;
        search?: string;
        page: number;
        limit: number;
    }) {
        let list = await orderService.getAllOrders(undefined, params.canteenId);

        const method = params.receiveMethod || params.orderType;
        if (method && method !== 'ALL') {
            if (method === 'PICKUP' || method === 'TAKEAWAY') {
                list = list.filter((o) => o.orderType === 'TAKEAWAY');
            } else {
                list = list.filter((o) => o.orderType === method);
            }
        }

        if (params.status && params.status !== 'ALL') {
            list = list.filter((o) => o.status === params.status);
        }

        if (params.paymentStatus && params.paymentStatus !== 'ALL') {
            if (params.paymentStatus === 'PAID') list = list.filter((o) => o.isPaid === true);
            else if (params.paymentStatus === 'PENDING') list = list.filter((o) => o.isPaid === false);
        }

        if (params.search) {
            const q = params.search.trim().toLowerCase();
            list = list.filter(
                (o) =>
                    o.orderCode.toLowerCase().includes(q) ||
                    o.userName.toLowerCase().includes(q) ||
                    o.userPhone.toLowerCase().includes(q) ||
                    (o.pickupCode && o.pickupCode.toLowerCase().includes(q)) ||
                    (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
                    (o.deliveryAddressText && o.deliveryAddressText.toLowerCase().includes(q))
            );
        }

        list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const total = list.length;
        const totalPages = Math.ceil(total / params.limit) || 1;
        const startIndex = (params.page - 1) * params.limit;
        const paginated = list.slice(startIndex, startIndex + params.limit);

        return {
            total,
            page: params.page,
            limit: params.limit,
            totalPages,
            data: this.enrichWithElapsed(paginated),
        };
    }

    public getValidOrderTransitions(order: Order): Record<string, string[]> {
        return {
            PENDING: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
            CONFIRMED: ['PREPARING', 'CANCELLED'],
            PREPARING: ['READY', 'SERVED', 'COMPLETED'],
            READY:
                order.orderType === 'TAKEAWAY'
                    ? ['WAITING_PICKUP', 'COMPLETED']
                    : order.orderType === 'DELIVERY'
                        ? ['DELIVERING', 'COMPLETED']
                        : ['SERVED', 'COMPLETED'],
            WAITING_PICKUP: ['COMPLETED'],
            DELIVERING: ['COMPLETED'],
            SERVED: ['COMPLETED'],
            COMPLETED: [],
            CANCELLED: [],
        };
    }

    public isTransitionAllowed(
        order: Order,
        targetStatus: string
    ): { ok: boolean; message?: string } {
        const current = order.status;
        const transitions = this.getValidOrderTransitions(order);
        const allowed = transitions[current] || [];

        if (!allowed.includes(targetStatus)) {
            return {
                ok: false,
                message: `Chuyển trạng thái không hợp lệ: không thể chuyển từ ${current} sang ${targetStatus}`,
            };
        }
        return { ok: true };
    }

    public buildStatusMessage(order: Order, targetStatus: string): string {
        switch (targetStatus) {
            case 'CONFIRMED':
                return `Đã duyệt đơn #${order.orderCode} thành công`;
            case 'PREPARING':
                return `Bếp đã nhận đơn #${order.orderCode} và đang nấu`;
            case 'SERVED':
                return `Đã phục vụ mang món ra bàn ${order.tableNumber || ''} cho khách`;
            case 'COMPLETED':
                return `Đơn hàng #${order.orderCode} đã hoàn tất thành công`;
            default:
                return `Đơn hàng #${order.orderCode} đã cập nhật sang trạng thái ${targetStatus}`;
        }
    }

    public async verifyPickup(code: string, canteenId?: string) {
        const order = await orderService.findOrderByIdOrCode(code);
        if (!order) {
            return { ok: false, status: 404, message: `Không tìm thấy đơn hàng với mã "${code}"!` };
        }
        if (canteenId && canteenId !== 'ALL' && order.canteenId !== canteenId) {
            return {
                ok: false,
                status: 404,
                message: `Đơn hàng không thuộc căn tin này!`,
            };
        }
        if (order.status === 'COMPLETED') {
            return {
                ok: false,
                status: 400,
                message: `Đơn hàng #${order.orderCode} đã được nhận trước đó rồi!`,
                order,
            };
        }
        if (order.status === 'CANCELLED') {
            return {
                ok: false,
                status: 400,
                message: `Đơn hàng #${order.orderCode} đã bị hủy, không thể giao món!`,
                order,
            };
        }

        // Cập nhật CẢ status VÀ isPaid trong 1 lần update
        await Order.update(
            { status: 'COMPLETED', isPaid: true },
            { where: { id: order.id } }
        );
        order.status = 'COMPLETED';
        order.isPaid = true;

        return {
            ok: true,
            status: 200,
            message: `Xác nhận khách nhận món thành công! Đơn hàng #${order.orderCode} đã hoàn thành.`,
            order,
        };
    }

    // ===========================================================================
    // PICKUP SLOTS
    // ===========================================================================

    public async getPickupSlots(canteenId?: string) {
        const where: any = {};
        if (canteenId) where.canteenId = canteenId;
        return PickupSlot.findAll({ where });
    }

    public async createPickupSlot(data: {
        canteenId?: string;
        timeRange: string;
        maxOrders?: number;
    }) {
        const id = `ps-${Date.now()}`;
        return PickupSlot.create({
            id,
            canteenId: data.canteenId || 'cant-a',
            timeRange: data.timeRange,
            maxOrders: Number(data.maxOrders) || 25,
            currentOrders: 0,
            status: 'AVAILABLE',
        });
    }

    public async updatePickupSlot(
        id: string,
        data: { timeRange?: string; maxOrders?: number; status?: string }
    ) {
        const updateData: any = {};
        if (data.timeRange) updateData.timeRange = data.timeRange;
        if (data.maxOrders !== undefined) updateData.maxOrders = Number(data.maxOrders);
        if (data.status) updateData.status = data.status;

        await PickupSlot.update(updateData, { where: { id } });
    }

    public async deletePickupSlot(id: string) {
        await PickupSlot.destroy({ where: { id } });
    }

    // ===========================================================================
    // TABLES
    // ===========================================================================

    public async getTables(canteenId?: string) {
        const rawTables = await tableService.getAllTables(canteenId);

        return Promise.all(
            rawTables.map(async (t: any) => {
                const item = typeof t?.toJSON === 'function' ? t.toJSON() : { ...t };
                if (item.currentOrderId) {
                    const ord = await orderService.getOrderById(item.currentOrderId);
                    if (ord) {
                        item.orderStatus = ord.status;
                        item.orderCode = ord.orderCode;
                    }
                }
                return item;
            })
        );
    }

    public async cleanTable(tableId: string) {
        const table = await tableService.getTableById(tableId);
        if (!table) {
            return { ok: false, status: 404, message: 'Không tìm thấy bàn ăn' };
        }

        if (table.currentOrderId) {
            await orderService.updateStatus(
                table.currentOrderId,
                'COMPLETED' as OrderStatus,
                'Đã dọn dẹp và làm sạch bàn'
            );
        }

        const updated = await tableService.updateTableStatus(table.id, 'AVAILABLE');
        return { ok: true, table, updated };
    }


    public async createCategory(data: {
        name: string;
        description?: string;
        icon?: string;
        image?: string;
        displayOrder?: number;
        slug?: string;
    }) {
        const baseSlug =
            data.slug ||
            data.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-');

        let slug = baseSlug;
        let counter = 1;
        while (await Category.findOne({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`;
        }

        const id = `cat-${Date.now()}`;
        const cat = await Category.create({
            id,
            name: data.name,
            icon: data.icon || 'Utensils',
            slug,
            image:
                data.image ||
                'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
            description: data.description || '',
            displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 1,
            isActive: true,
        });

        await redisService.delPrefix('categories');
        return cat;
    }

    public async updateCategory(
        id: string,
        data: {
            name?: string;
            description?: string;
            icon?: string;
            image?: string;
            displayOrder?: number;
        }
    ) {
        const cat = await menuService.getCategoryById(id);
        if (!cat) return null;

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description || '';
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.displayOrder !== undefined) updateData.displayOrder = Number(data.displayOrder);

        await Category.update(updateData, { where: { id: cat.id } });
        await redisService.delPrefix('categories');
        return cat;
    }

    public async deleteCategory(id: string) {
        const cat = await menuService.getCategoryById(id);
        if (!cat) return null;

        await Category.destroy({ where: { id: cat.id } });
        await redisService.delPrefix('categories');
        return cat;
    }


    public async createPromotion(data: {
        code: string;
        title: string;
        description?: string;
        discountType?: string;
        discountValue: number;
        minOrderAmount?: number;
        maxDiscount?: number;
        usageLimit?: number;
    }) {
        const isPercent =
            data.discountType === 'PERCENT' || data.discountType === 'PERCENTAGE';

        if (isPercent && (data.discountValue <= 0 || data.discountValue > 100)) {
            throw new Error('Phần trăm giảm phải từ 0 đến 100');
        }

        const id = `vouch-${Date.now()}`;
        const voucher = await Voucher.create({
            id,
            code: data.code.toUpperCase().trim(),
            title: data.title,
            description: data.description || '',
            discountType: isPercent ? 'PERCENTAGE' : 'FIXED',
            discountValue: Number(data.discountValue),
            minOrderAmount: Number(data.minOrderAmount) || 0,
            maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
            usageLimit: Number(data.usageLimit) || 500,
            usedCount: 0,
            isActive: true,
        });

        await redisService.delPrefix('vouchers');
        return voucher;
    }

    public async updatePromotion(
        id: string,
        data: {
            title?: string;
            description?: string;
            discountValue?: number;
            minOrderAmount?: number;
            maxDiscount?: number;
            usageLimit?: number;
            isActive?: boolean;
        }
    ) {
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.discountValue !== undefined) updateData.discountValue = Number(data.discountValue);
        if (data.minOrderAmount !== undefined)
            updateData.minOrderAmount = Number(data.minOrderAmount);
        if (data.maxDiscount !== undefined) updateData.maxDiscount = Number(data.maxDiscount);
        if (data.usageLimit !== undefined) updateData.usageLimit = Number(data.usageLimit);
        if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

        await Voucher.update(updateData, { where: { id } });
        await redisService.delPrefix('vouchers');
    }

    public async deletePromotion(id: string) {
        await Voucher.destroy({ where: { id } });
        await redisService.delPrefix('vouchers');
    }


    public async getReviews(canteenId?: string, rating?: string) {
        return interactionService.getAllReviewsForAdmin(canteenId, rating);
    }

    public async replyReview(id: string, replyText: string) {
        return interactionService.replyReview(id, replyText.trim());
    }


    private enrichWithElapsed(orders: Order[]): any[] {
        const now = Date.now();
        return orders.map((o) => {
            const json = typeof (o as any)?.toJSON === 'function' ? (o as any).toJSON() : o;
            const elapsedMinutes = Math.max(
                0,
                Math.floor((now - o.createdAt.getTime()) / 60000)
            );
            return { ...json, elapsedMinutes };
        });
    }
}

export const staffService = new StaffService();