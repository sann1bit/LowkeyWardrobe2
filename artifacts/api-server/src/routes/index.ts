import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import newsletterRouter from "./newsletter";
import adminRouter from "./admin";
import ordersRouter from "./orders";
import storageRouter from "./storage";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(newsletterRouter);
router.use(adminRouter);
router.use(ordersRouter);
router.use(storageRouter);
router.use(settingsRouter);

export default router;
