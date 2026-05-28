import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import todosRouter from "./todos";
import contactRouter from "./contact";
import productsRouter from "./products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(todosRouter);
router.use(contactRouter);
router.use(productsRouter);

export default router;
