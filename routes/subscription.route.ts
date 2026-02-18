import express, { NextFunction, Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, planId } = req.body;

      if (!userId || !planId) {
        return res
          .status(400)
          .json({ message: "UserId and planId are required" });
      }

      const isUserExist = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!isUserExist) {
        return res.status(404).json({ message: "User not found" });
      }
      const isPlanExist = await prisma.plans.findUnique({
        where: {
          id: planId,
        },
      });

      if (!isPlanExist) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // am assuming (talked to mam) that one user can have a single plan only , so if he take a new plan , previos would be deactivated
      await prisma.subscriptions.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      const newSubs = await prisma.subscriptions.create({
        data: { userId, planId, isActive: true },
      });
      return res.status(201).json({ message: "Subscription added for the plan", data: newSubs });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

export default router;
