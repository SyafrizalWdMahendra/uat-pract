import app from "./app";

const HOST = process.env.HOST || "uat-pract.vercel.app";
const PORT = process.env.PORT || 4000;

app.listen(Number(PORT), () => {
  console.log(`Server running on http://${HOST}/`);
});
