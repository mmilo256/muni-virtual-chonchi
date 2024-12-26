import e from "express";
import { callback, login, logout, protectedRoute } from "../../controllers/portal/authController.js";
import { verifyToken } from "../../middlewares/authMIddleware.js";

const router = e.Router()

router.get("/login", login)
router.post("/logout", logout)
router.get("/inicio", callback)
router.get("/protected", verifyToken, protectedRoute)


export default router