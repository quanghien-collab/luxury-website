const jwt = require("jsonwebtoken");

module.exports = (req, res) => {
  try {
    const cookie = req.headers.cookie || "";
    const token = cookie.replace("token=", "").trim();
    jwt.verify(token, "tientinh-secret");
    res.status(200).json({ ok: true });
  } catch {
    res.status(401).json({ ok: false });
  }
};
