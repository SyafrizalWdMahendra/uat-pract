import { Request, Response } from "express";
import { responses } from "../../../utils/responses";
import { prisma } from "../../../prisma/client";

const getUsers = async (req: Request, res: Response) => {
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
};

const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return responses(res, 400, "Invalid user ID", null);
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });
  if (!existingUser) {
    return responses(res, 404, "User not found", null);
  }

  await prisma.user.delete({
    where: { id },
  });

  return responses(res, 200, "User deleted successfully", []);
};

export { getUsers, deleteUser };
