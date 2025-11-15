"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responses = void 0;
const responses = (res, stat, message, data) => {
    res.status(stat).json({
        payload: {
            message: message,
            data: data,
        },
    });
};
exports.responses = responses;
