import express, { NextFunction, Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getCurrentMonth } from "../utils/getCurrentMonth";

const router: Router = express.Router();

router.post(
  "/usage",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, actions, usedUnits } = req.body;

      if (!userId || !actions || !usedUnits || typeof usedUnits !== "number") {
        return res
          .status(400)
          .json({ message: "userId, action and usedUnits is required" });
      }

      const isUserExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!isUserExist) {
        return res.status(404).json({ message: "User not found" });
      }

      const usage = await prisma.usageRecords.create({
        data: {
          userId,
          actions,
          usedUnits,
        },
      });

      return res.status(201).json({ message: "User created", data: usage });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

router.get(
  "/users/:id/current-usage",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "id(user) is required" });
      }

      const isUserExist = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!isUserExist) {
        return res.status(404).json({ message: "User not found" });
      }

      const userSubscription = await prisma.subscriptions.findFirst({
        where: { userId: Number(id), isActive: true },
        include: { plan: true },
      });

      if (!userSubscription) {
        return res
          .status(400)
          .json({ message: "User not subsscribe to any plan" });
      }

      const { start, end } = getCurrentMonth();

      const totalUnitsUsed = await prisma.usageRecords.aggregate({
        _sum: { usedUnits: true },
        where: { userId: Number(id), createdAt: { gte: start, lt: end } },
      });
      const remaingQuota = Number(userSubscription.plan.monthlyQuota) - Number(totalUnitsUsed._sum.usedUnits);
      const activePlan = userSubscription.plan;

      return res
        .status(200)
        .json({
          message: "Usage data fetched",
          data: { totalUnitsUsed: totalUnitsUsed._sum.usedUnits, remaingQuota, activePlan },
        });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);


router.get(
  "/users/:id/billing-summary",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "id(user) is required" });
      }

      const isUserExist = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!isUserExist) {
        return res.status(404).json({ message: "User not found" });
      }

      const userSubscription = await prisma.subscriptions.findFirst({
        where: { userId: Number(id), isActive: true },
        include: { plan: true },
      });

      if (!userSubscription) {
        return res
          .status(400)
          .json({ message: "User not subsscribe to any plan" });
      }

      const { start, end } = getCurrentMonth();

      const aggrUnits = await prisma.usageRecords.aggregate({
        _sum: { usedUnits: true },
        where: { userId: Number(id), createdAt: { gte: start, lt: end } },
      });

      const totalUnitsUsed = aggrUnits._sum.usedUnits
      
      const remaingQuota = Number(userSubscription.plan.monthlyQuota) - Number(totalUnitsUsed);

      const activePlan = userSubscription.plan;

      let extraCharge = 0
      let extraUnits = 0

      if(remaingQuota < 0){
        extraUnits = Math.abs(remaingQuota)
        extraCharge = Math.abs(remaingQuota) * Number(activePlan.extraChargePerUnit)
      }

      return res
        .status(200)
        .json({
          message: "Usage data fetched",
          data: { totalUnitsUsed, remaingQuota,extraUnits, extraCharge, activePlan },
        });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);



export default router;
