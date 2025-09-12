import { Request, Response } from "express";
const responses = require("../../../utils/responses");
const prisma = require("../../../prisma/client");

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
