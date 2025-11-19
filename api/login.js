const jwt = require("jsonwebtoken");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const buffers = [];
  req.on("data", x => buffers.push(x));
  req.on("end", () => {
    const { username, password } = JSON.parse(Buffer.concat(buffers).toString());

    if (username === "admin" && password === "888888") {
      const token = jwt.sign({ user: "admin" }, "tientinh-secret", { expiresIn: "2h" });
      res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly;`);
      res.status(200).json({ message: "OK" });
    } else {
      res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }
  });
};
