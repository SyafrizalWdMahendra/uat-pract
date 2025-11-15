"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUsers = void 0;
const responses_1 = require("../../../utils/responses");
const client_1 = require("../../../prisma/client");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getUsers = yield client_1.prisma.user.findMany({
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
    return (0, responses_1.responses)(res, 200, "Properties retrieved successfully", getUsers);
});
exports.getUsers = getUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return (0, responses_1.responses)(res, 400, "Invalid user ID", null);
    }
    const existingUser = yield client_1.prisma.user.findUnique({
        where: { id },
    });
    if (!existingUser) {
        return (0, responses_1.responses)(res, 404, "User not found", null);
    }
    yield client_1.prisma.user.delete({
        where: { id },
    });
    return (0, responses_1.responses)(res, 200, "User deleted successfully", []);
});
exports.deleteUser = deleteUser;
