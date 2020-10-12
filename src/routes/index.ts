import { Router } from "express";

import mongoProvider from "../data/infra/mongoProvider";
import guestRoutes from "./guestRoutes";
import hotelsRoutes from "./hotelsRoutes";

const router = Router();

mongoProvider
  .connect()
  .catch(error => {
    console.error(`${error.name}: ${error.message}`);
  });

router.use("/hotel", hotelsRoutes);
router.use("/guest", guestRoutes);

export const mainRouter: Router = router;
