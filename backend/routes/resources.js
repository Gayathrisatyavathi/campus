const router = require("express").Router();
const { authRequired } = require("../middleware/auth");
const { list, createAchievement, updateAchievement, deleteAchievement, applyPlacement } = require("../controllers/crudController");
const { submit, getMyResults } = require("../controllers/testController");

router.use(authRequired);

// Keep the fixed route before /:resource so it is not swallowed by the dynamic route.
router.get("/test-results", getMyResults);

// All read-only student resources use the resource name as a route parameter.
router.get("/:resource", list);

router.post("/placements/:id/apply", applyPlacement);
router.post("/achievements", createAchievement);
router.put("/achievements/:id", updateAchievement);
router.delete("/achievements/:id", deleteAchievement);
router.post("/tests/:id/submit", submit);

module.exports = router;
