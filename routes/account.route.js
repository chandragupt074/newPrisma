import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { changePassword, getAccountDetails, updateAccount } from "../controllers/account.controller.js";

const router = express.Router();

router.route("/account").get(getAccountDetails)
router.route("/account").put(isAuthenticated,updateAccount)
router.route("/account/password").put(isAuthenticated,changePassword)

export default router 