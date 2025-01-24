import app from "./src/app";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
