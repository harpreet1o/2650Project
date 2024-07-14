import express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const user = req.user
  console.log(user)
  res.render("index", { title: "Yay node!", user: user });
});

export default router;
