/**
 * HOOK USEAUTH - LẤY THÔNG TIN NGƯỜI DÙNG & QUYỀN TRUY CẬP
 */
import { useApp } from '../store/AppContext';

export function useAuth() {
  const { currentUser, login, logout, register, updateProfile } = useApp();

  return {
    user: currentUser,
    isAuthenticated: Boolean(currentUser),
    role: currentUser?.role || 'STUDENT',
    isStudent: currentUser?.role === 'STUDENT',
    isStaff: currentUser?.role === 'STAFF',
    isAdmin: currentUser?.role === 'ADMIN',
    login,
    logout,
    register,
    updateProfile,
  };
}
