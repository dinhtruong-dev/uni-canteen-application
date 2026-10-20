import { Request, Response } from 'express';
import { staffOrderService, orderService, socketService } from '../../services';
import { toPlain } from '../../utils/serialize';
import type { OrderStatus } from '../../types/order.types';

export class StaffOrderController {
    public async getOrders(req: Request, res: Response) {
        try {
            const {
                canteenId,
                receiveMethod,
                orderType,
                status,
                paymentStatus,
                search,
                page = '1',
                limit = '20',
            } = req.query;

            const result = await staffOrderService.getOrders({
                canteenId: canteenId as string,
                receiveMethod: receiveMethod as string,
                orderType: orderType as string,
                status: status as string,
                paymentStatus: paymentStatus as string,
                search: search as string,
                page: Math.max(1, parseInt(page as string, 10) || 1),
                limit: Math.max(1, parseInt(limit as string, 10) || 20),
            });

            return res.json({ success: true, ...result });
        } catch (err: any) {
            console.error('[StaffOrderController.getOrders]', err);
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi tải danh sách đơn hàng' });
        }
    }

    public async updateOrderStatus(req: Request, res: Response) {
        try {
            const orderId = req.params.id;
            const { status: targetStatus, reason } = req.body;

            if (!targetStatus) {
                return res.status(400).json({ success: false, message: 'Thiếu trạng thái cập nhật' });
            }

            const order = await orderService.getOrderById(orderId);
            if (!order) {
                return res
                    .status(404)
                    .json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }

            if (targetStatus === 'CANCELLED') {
                if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
                    return res.status(400).json({
                        success: false,
                        message: `Không thể hủy đơn hàng ở trạng thái hiện tại (${order.status})`,
                    });
                }
                await orderService.cancelOrder(order.id, reason);
                return res.json({
                    success: true,
                    message: `Đã hủy đơn hàng #${order.orderCode} thành công`,
                    data: toPlain(order),
                });
            }

            const check = staffOrderService.isTransitionAllowed(order, targetStatus);
            if (!check.ok) {
                return res.status(400).json({ success: false, message: check.message });
            }

            const updated = await orderService.updateStatus(
                order.id,
                targetStatus as OrderStatus,
                reason
            );

            return res.json({
                success: true,
                message: staffOrderService.buildStatusMessage(order, targetStatus),
                data: toPlain(updated) || toPlain(order),
            });
        } catch (err: any) {
            console.error('[StaffOrderController.updateOrderStatus]', err);
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi cập nhật trạng thái đơn hàng' });
        }
    }

    public async verifyPickup(req: Request, res: Response) {
        try {
            const { code, canteenId } = req.body;
            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp mã nhận món hoặc quét mã QR',
                });
            }

            const result = await staffOrderService.verifyPickup(String(code).trim(), canteenId);

            if (!result.ok) {
                return res.status(result.status).json({
                    success: false,
                    message: result.message,
                    data: result.order ? toPlain(result.order) : undefined,
                });
            }

            const order = result.order!;
            socketService.emitOrderStatus(order.userId, toPlain(order));

            return res.json({
                success: true,
                message: result.message,
                data: toPlain(order),
            });
        } catch (err: any) {
            console.error('[StaffOrderController.verifyPickup]', err);
            return res
                .status(500)
                .json({ success: false, message: 'Lỗi xác nhận mã nhận món' });
        }
    }
}

export const staffOrderController = new StaffOrderController();