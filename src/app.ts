import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import businessRoutes from "./routes/businessRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentLinkRoutes from "./routes/paymentLinkRoutes";
import "./realtime/subscriptions";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/", (req, res) => {
//   res.send("Hello World");
// });

app.use("/api/users", userRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment-link", paymentLinkRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
