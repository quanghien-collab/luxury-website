// server.js - bản dùng cho Render (Express + session + content.json)

const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();

// =============================
// CẤU HÌNH SESSION
// =============================
app.use(session({
  secret: "tientinh-secret-key",
  resave: false,
  saveUninitialized: true,
}));

// Đọc JSON + form (tăng limit để nhận base64)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Serve file tĩnh (index.html, admin.html, login.html, assets,…)
app.use(express.static(__dirname));

// =============================
// MIDDLEWARE CHẶN TRUY CẬP ADMIN
// =============================
function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.redirect("/login?msg=Bạn+phải+đăng+nhập+trước");
}

// =============================
// TRANG ĐĂNG NHẬP
// =============================
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "888888";

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
    return res.redirect("/admin");
  }

  return res.redirect("/login?msg=Sai+tên+đăng+nhập+hoặc+mật+khẩu");
});

// ĐĂNG XUẤT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login?msg=Đã+đăng+xuất");
  });
});

// =============================
// API LẤY / LƯU NỘI DUNG TRANG CHỦ
// Dùng content.json lưu: { title, description (HTML), image (base64) }
// =============================
const CONTENT_FILE = path.join(__dirname, "content.json");

// Lấy nội dung
app.get("/content", (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_FILE)) {
      // dữ liệu mặc định lần đầu
      return res.json({
        title: "Website du lịch đẳng cấp thế giới",
        description: "",
        image: "",
      });
    }
    const raw = fs.readFileSync(CONTENT_FILE, "utf8");
    const data = JSON.parse(raw || "{}");
    return res.json(data);
  } catch (err) {
    console.error("Lỗi đọc content.json:", err);
    return res.status(500).json({ error: "Không đọc được nội dung" });
  }
});

// Cập nhật nội dung (chỉ Admin)
app.post("/content", requireLogin, (req, res) => {
  try {
    const payload = {
      title: req.body.title || "",
      description: req.body.description || "",
      image: req.body.image || "",
    };
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(payload, null, 2), "utf8");
    return res.json({ message: "OK" });
  } catch (err) {
    console.error("Lỗi ghi content.json:", err);
    return res.status(500).json({ error: "Không lưu được nội dung" });
  }
});

// =============================
// TRANG ADMIN (YÊU CẦU LOGIN)
// =============================
app.get("/admin", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// =============================
// KHỞI ĐỘNG SERVER
// Render sẽ tự truyền PORT qua biến môi trường
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server đang chạy trên cổng:", PORT);
});
