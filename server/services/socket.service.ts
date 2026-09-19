/**
 * Socket.IO Service Adapter
 * Chuyển tiếp các thao tác tới Module Socket chuẩn trong 'server/socket'
 */
import { socketManager } from '../socket';

export const socketService = socketManager;
export default socketService;
