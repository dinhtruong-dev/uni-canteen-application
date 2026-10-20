import { Router } from 'express';
import canteenRoutes from './canteen.routes';
import cartRoutes from './cart.routes';
import interactionRoutes from './interaction.routes';
import marketingRoutes from './marketing.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import searchRoutes from './search.routes';
import tableRoutes from './table.routes';
import foodRoutes from './food.routes';

const sharedRouter = Router();

sharedRouter.use('/canteens', canteenRoutes);
sharedRouter.use('/cart', cartRoutes);
sharedRouter.use('/interaction', interactionRoutes);
sharedRouter.use('/marketing', marketingRoutes);
sharedRouter.use('/menu', menuRoutes);
sharedRouter.use('/orders', orderRoutes);
sharedRouter.use('/payments', paymentRoutes);
sharedRouter.use('/search', searchRoutes);
sharedRouter.use('/tables', tableRoutes);
sharedRouter.use('/foods', foodRoutes);

export default sharedRouter;
export {
  canteenRoutes,
  cartRoutes,
  interactionRoutes,
  marketingRoutes,
  menuRoutes,
  orderRoutes,
  paymentRoutes,
  searchRoutes,
  tableRoutes,
  foodRoutes,
};
