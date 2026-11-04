import express from "express";
import { dataBase } from "./database/db.js";
import cors from "cors";

const app = express();
app.use(express.json)

const port = process.env.PORT || 3000 ;
app.listen (port)
dataBase();