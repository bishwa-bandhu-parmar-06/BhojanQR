const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAllAsRead,
  markSingleAsRead,
  deleteSingleNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getNotifications).delete(deleteAllNotifications);

router.put("/read-all", markAllAsRead);

router.delete("/:id", deleteSingleNotification);

router.put("/:id/read", markSingleAsRead);

module.exports = router;
