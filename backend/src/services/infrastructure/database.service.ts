import { User } from '../../models';
import bcrypt from 'bcryptjs';

/**
 * ===================================================================================
 * DATABASE SERVICE (SINGLETON DB INITIALIZER)
 * HỆ THỐNG QUẢN LÝ CĂNG TIN ĐẠI HỌC (UNI-CANTEEN APPLICATION)
 * ===================================================================================
 * Khởi tạo tài khoản phân quyền chuẩn (Admin, Staff, Student) khi server khởi động.
 */
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() { }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async ensureUserRolesAndDefaultAccounts(): Promise<void> {
    try {
      const seedPassword = process.env.SEED_PASSWORD || '123456';
      const defaultHash = bcrypt.hashSync(seedPassword, 10);

      const seedAccounts = [
        {
          id: 'user-admin-1',
          name: 'Quản Trị Viên Hệ Thống',
          email: 'admin@university.edu.vn',
          phone: '0909999888',
          role: 'ADMIN' as const,
          department: 'Ban Giám Hiệu - Phòng Quản Trị Căn Tin',
          walletBalance: 5000000,
        },
        {
          id: 'user-staff-1',
          name: 'Nguyễn Văn An (Trưởng Quầy Căng Tin A2)',
          email: 'staff.a@canteen.edu.vn',
          phone: '0901234567',
          role: 'STAFF' as const,
          department: 'Tổ Chế Biến Căn Tin A2',
          walletBalance: 0,
        },
        {
          id: 'user-stu-1',
          name: 'Đặng Hoàng Minh',
          email: 'minh.dh22@university.edu.vn',
          phone: '0912345678',
          role: 'STUDENT' as const,
          studentId: '20230012',
          faculty: 'Khoa Công Nghệ Thông Tin',
          walletBalance: 150000,
        },
      ];

      for (const acc of seedAccounts) {
        const existing = await User.findOne({ where: { email: acc.email } });
        if (!existing) {
          await User.create({
            id: acc.id,
            name: acc.name,
            email: acc.email,
            phone: acc.phone,
            role: acc.role,
            studentId: acc.studentId,
            faculty: acc.faculty,
            department: acc.department,
            walletBalance: acc.walletBalance,
            passwordHash: defaultHash,
            status: 'ACTIVE',
          });
        }
      }
      console.log('[Database Schema & Roles] Đã đảm bảo tài khoản mặc định!');
    } catch (e: any) {
      console.warn('[Database Schema Init Notice]:', e.message);
    }
  }
}

export const db = DatabaseService.getInstance();
