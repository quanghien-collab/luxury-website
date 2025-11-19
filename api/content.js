const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const filePath = path.join(__dirname, "../content.json");

  if (req.method === "GET") {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      res.status(200).json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ error: "Không đọc được content.json" });
    }
  }

  if (req.method === "POST") {
    const buffers = [];
    req.on("data", x => buffers.push(x));
    req.on("end", () => {
      try {
        const body = JSON.parse(Buffer.concat(buffers).toString());
        fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
        res.status(200).json({ message: "OK" });
      } catch (err) {
        res.status(500).json({ error: "Không ghi content.json" });
      }
    });
  }
};
