import { QueryTypes } from 'sequelize';
import sequelize from '../../db/sequelize';

export class AdminDashboardService {
  public async getOverview() {
    const [rawRevenue]: any = await sequelize.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN is_paid = 1 AND status != 'CANCELLED' THEN final_amount ELSE 0 END), 0) as totalRevenue,
        COALESCE(SUM(CASE WHEN is_paid = 1 AND status != 'CANCELLED' AND DATE(created_at) = CURDATE() THEN final_amount ELSE 0 END), 0) as todayRevenue,
        COUNT(id) as totalOrders,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN status IN ('CONFIRMED', 'PREPARING') THEN 1 END) as cookingOrders,
        COUNT(CASE WHEN status IN ('READY', 'SERVED', 'DELIVERING') THEN 1 END) as deliveringOrders,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelledOrders
      FROM orders`,
      { type: QueryTypes.SELECT }
    );

    const revData = rawRevenue || {
      totalRevenue: 0,
      todayRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      cookingOrders: 0,
      deliveringOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };

    const orderTypeRows = await sequelize.query(
      `SELECT order_type, COUNT(id) as count FROM orders GROUP BY order_type`,
      { type: QueryTypes.SELECT }
    );

    const statusRows = await sequelize.query(
      `SELECT status, COUNT(id) as count FROM orders GROUP BY status`,
      { type: QueryTypes.SELECT }
    );

    const trendRows = await sequelize.query(
      `SELECT 
        DATE_FORMAT(created_at, '%d/%m') as date,
        COALESCE(SUM(CASE WHEN is_paid = 1 AND status != 'CANCELLED' THEN final_amount ELSE 0 END), 0) as revenue,
        COUNT(id) as orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%d/%m')
      ORDER BY DATE(created_at) ASC`,
      { type: QueryTypes.SELECT }
    );

    const [rawUserStats]: any = await sequelize.query(
      `SELECT 
        COUNT(CASE WHEN role = 'STUDENT' THEN 1 END) as totalStudents,
        COUNT(CASE WHEN role = 'STAFF' THEN 1 END) as totalStaff,
        COUNT(id) as totalUsers
      FROM users`,
      { type: QueryTypes.SELECT }
    );

    const [rawTableStats]: any = await sequelize.query(
      `SELECT 
        COUNT(id) as totalTables,
        COUNT(CASE WHEN status = 'OCCUPIED' THEN 1 END) as occupiedTables,
        COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as availableTables
      FROM dining_tables`,
      { type: QueryTypes.SELECT }
    );

    return {
      kpis: {
        totalRevenue: Number(revData.totalRevenue) || 0,
        todayRevenue: Number(revData.todayRevenue) || 0,
        totalOrders: Number(revData.totalOrders) || 0,
        pendingOrders: Number(revData.pendingOrders) || 0,
        cookingOrders: Number(revData.cookingOrders) || 0,
        deliveringOrders: Number(revData.deliveringOrders) || 0,
        completedOrders: Number(revData.completedOrders) || 0,
        cancelledOrders: Number(revData.cancelledOrders) || 0,
        totalStudents: Number(rawUserStats?.totalStudents) || 0,
        totalStaff: Number(rawUserStats?.totalStaff) || 5,
        totalTables: Number(rawTableStats?.totalTables) || 0,
        occupiedTables: Number(rawTableStats?.occupiedTables) || 0,
      },
      orderTypes: Array.isArray(orderTypeRows) ? orderTypeRows : [],
      statuses: Array.isArray(statusRows) ? statusRows : [],
      revenueTrends: Array.isArray(trendRows) ? trendRows : [],
    };
  }

  public async getStatistics() {
    const canteenStats = await sequelize.query(
      `SELECT 
        c.id as id,
        c.name as name,
        COALESCE(COUNT(o.id), 0) as orders,
        COALESCE(SUM(CASE WHEN o.is_paid = 1 AND o.status != 'CANCELLED' THEN o.final_amount ELSE 0 END), 0) as revenue,
        ROUND(COALESCE(COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) * 100.0 / NULLIF(COUNT(o.id), 0), 0), 1) as cancelRate
      FROM canteens c
      LEFT JOIN orders o ON c.id = o.canteen_id
      GROUP BY c.id, c.name`,
      { type: QueryTypes.SELECT }
    );

    const hourlyStats = await sequelize.query(
      `SELECT HOUR(created_at) as hourNum, COUNT(id) as orders
      FROM orders
      GROUP BY HOUR(created_at)
      ORDER BY hourNum ASC`,
      { type: QueryTypes.SELECT }
    );

    const formattedHours = [
      { hour: '07h-08h', orders: 0 },
      { hour: '08h-09h', orders: 0 },
      { hour: '11h-12h', orders: 0 },
      { hour: '12h-13h', orders: 0 },
      { hour: '13h-14h', orders: 0 },
      { hour: '17h-18h', orders: 0 },
      { hour: '18h-19h', orders: 0 },
      { hour: '19h-20h', orders: 0 },
    ];

    if (Array.isArray(hourlyStats)) {
      hourlyStats.forEach((h: any) => {
        const hn = Number(h.hourNum);
        if (hn >= 7 && hn < 8) formattedHours[0].orders += Number(h.orders);
        else if (hn >= 8 && hn < 9) formattedHours[1].orders += Number(h.orders);
        else if (hn >= 11 && hn < 12) formattedHours[2].orders += Number(h.orders);
        else if (hn >= 12 && hn < 13) formattedHours[3].orders += Number(h.orders);
        else if (hn >= 13 && hn < 14) formattedHours[4].orders += Number(h.orders);
        else if (hn >= 17 && hn < 18) formattedHours[5].orders += Number(h.orders);
        else if (hn >= 18 && hn < 19) formattedHours[6].orders += Number(h.orders);
        else if (hn >= 19 && hn < 20) formattedHours[7].orders += Number(h.orders);
      });
    }

    return {
      canteens: Array.isArray(canteenStats)
        ? canteenStats.map((c: any) => ({
          name: c.name,
          revenue: Number(c.revenue) || 0,
          orders: Number(c.orders) || 0,
          cancelRate: Number(c.cancelRate) || 0,
        }))
        : [],
      hourly: formattedHours,
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
