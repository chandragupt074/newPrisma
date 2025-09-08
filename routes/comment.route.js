import express from "express"
import { createComments } from "../controllers/comment.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const  router = express.Router();

router.route('/comments').post(isAuthenticated,createComments)




export default router