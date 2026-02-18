import express, { NextFunction, Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, monthlyQuota, extraChargePerUnit } = req.body;

      if (
        !name ||
        typeof name != "string" ||
        !monthlyQuota ||
        typeof monthlyQuota != "number" ||
        !extraChargePerUnit
      ) {
        return res
          .status(400)
          .json({
            message: "Name,monthlyQuota and extraChargePerUnit is required",
          });
      }

      const plan = await prisma.plans.create({ data: { name, monthlyQuota, extraChargePerUnit } });
      return res.status(201).json({ message: "Plan created", data: plan });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

export default router;
