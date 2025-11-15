"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 4000;
app_1.default.listen(Number(PORT), HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
