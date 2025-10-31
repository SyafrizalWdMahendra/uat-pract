import app from "./app";

const HOST = process.env.HOST || "0.0.0.0"; // pake IP biar bisa diakses di mobile app
const PORT = process.env.PORT || 4000;

app.listen(Number(PORT), HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
