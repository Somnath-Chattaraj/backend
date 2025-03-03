import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/userRoutes";
import eventRouter from "./routes/eventRoutes";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/user", router);
app.use("/api/event", eventRouter);

import spotifyOauthRoutes from "./routes/spotifyOauthRouter";
app.use("/api/spotify", spotifyOauthRoutes);
import spotifyRoutes from "./routes/spotifyRoutes";
app.use("/api/spotify", spotifyRoutes);

app.listen(PORT || 3000, () => {
  console.log(`Server is running on port ${PORT || 3000}`);
});
