import express, {Request, Response, Router} from 'express';
import rateLimit from 'express-rate-limit';
import cors from "cors";

import config from "./config";
import routes from './routes';

var db = require('./database');
const {PORT} = config;

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 100 request per 15 mins
	max: 100, 
	standardHeaders: true, 
	legacyHeaders: false,
})

// API Rate limiting
app.use(limiter)

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));    

app.use('/health', function (req: Request, res: Response) {
    return res.send({
        status: "success",
        message: "API Working !"
    });
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});

export {
    app
};