import { responses } from "../../../utils/responses.js";
import { prisma } from "../../../prisma/client.js";
const getUsers = async (req, res) => {
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
const deleteUser = async (req, res) => {
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
