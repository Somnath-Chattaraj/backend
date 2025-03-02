import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/userRoutes";
import eventRouter from "./routes/eventRoutes";

const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/user",router);
app.use("/api/user",eventRouter);

app.listen(PORT || 3000, () => {
  console.log(`Server is running on port ${PORT || 3000}`);
});