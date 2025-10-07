import { Response } from "express";

export const responses = (
  res: Response,
  stat: number,
  message: string,
  data: unknown
) => {
  res.status(stat).json({
    payload: {
      message: message,
      data: data,
    },
  });
};
