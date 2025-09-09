import express from "express"
import { createVideo, deleteVideo, getAllVideos, getSingleVideo, updateVideo } from "../controllers/video.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
const router = express.Router();


router.route("/video").post(createVideo)
router.route("/video").get(getAllVideos)
router.route("/video/:id").get(getSingleVideo)
router.route("/video/:id").put(isAuthenticated,updateVideo)
router.route("/video/:id").delete(isAuthenticated,deleteVideo)




export default router;
