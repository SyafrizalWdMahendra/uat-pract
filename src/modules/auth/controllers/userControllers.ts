import { Request, Response } from "express";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const getUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!getUsers) {
      throw new Error("No properties found");
    }

    return responses(res, 200, "Properties retrieved successfully", getUsers);
  } catch (error) {
    return responses(res, 500, "Error fetching properties", String(error));
  }
};
