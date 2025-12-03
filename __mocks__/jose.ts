export class SignJWT {
  private payload: Record<string, unknown>;

  constructor(payload: Record<string, unknown>) {
    this.payload = payload;
  }

  setProtectedHeader(): this {
    return this;
  }

  setExpirationTime(): this {
    return this;
  }

  sign(): Promise<string> {
    return Promise.resolve("mocked.jwt.token");
  }
}

export const jwtVerify = jest.fn().mockResolvedValue({
  payload: {
    id: 1,
    email: "test@example.com",
  },
});
