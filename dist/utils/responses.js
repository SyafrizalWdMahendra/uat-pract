export const responses = (res, stat, message, data) => {
  res.status(stat).json({
    payload: {
      message: message,
      data: data,
    },
  });
};
