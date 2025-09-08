import express from "express"
import { forgetPassword,  login, logout, recoverPassword, register, resetPassword } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login)
router.route("/logout").get(isAuthenticated,logout)
router.route("/forget").post(forgetPassword)
router.route("/reset").post(resetPassword)
router.route("/recover").post(recoverPassword)







export default router;