"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const directURL = process.env.DATABASE_URL;
const dataBaseName = process.env.DATABASE_NAME;
const mongoDbURL = `${directURL}/${dataBaseName}`;
mongoose_1.default.connect(mongoDbURL);
mongoose_1.default.connection.once("open", () => {
    console.log("connected to mongoDB");
});
