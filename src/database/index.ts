import mongoose from "mongoose";

import config from "../config"; 
import { addUserRoles } from "../utils/initialScript";

console.log("manoj");
const {MONGO_URI, DB_NAME, MONGO_QUERY_OPTIONS} = config;

mongoose.connect(`${MONGO_URI}/${DB_NAME}?${MONGO_QUERY_OPTIONS}`).then(
    () => { 
        console.log("Successfully connected to MongoDB.");
        addUserRoles();
    },
    err => {
        console.error("MongoDB Connection error", err);
        process.exit();
    }
);

const database = mongoose.connection;

export default database;