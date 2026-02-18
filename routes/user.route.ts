import express, { NextFunction, Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router: Router = express.Router();

router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;

      if (!name || typeof name != "string") {
        return res.status(400).json({ message: "Name is required" });
      }

      const user = await prisma.user.create({ data: { name } });
      return res.status(201).json({ message: "User created", data: user });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

export default router;
