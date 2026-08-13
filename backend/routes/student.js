const router = require("express").Router();
const { authRequired } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getProfile, updateProfile, uploadResume, deleteResume } = require("../controllers/studentController");

router.use(authRequired);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/resume", upload.single("resume"), uploadResume);
router.delete("/resume", deleteResume);

module.exports = router;
