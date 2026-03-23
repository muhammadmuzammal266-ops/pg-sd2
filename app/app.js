const express = require("express");
const session = require("express-session");
const app = express();
const db = require("./services/db");

app.set("view engine", "pug");
app.set("views", "./app/views");

app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "info-games-secret-key",
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

app.get("/", (req, res) => {
  res.render("index", {
    title: "Info Games"
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    error: null,
    message: null
  });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (users.length === 0) {
      return res.render("login", {
        title: "Login",
        error: "Invalid email or password.",
        message: null
      });
    }

    req.session.user = users[0];
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Sign Up",
    error: null,
    message: null
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    const existing = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.render("signup", {
        title: "Sign Up",
        error: "This email is already registered.",
        message: null
      });
    }

    await db.query(
      "INSERT INTO users (username, email, password, bio, profile_image) VALUES (?, ?, ?, ?, ?)",
      [username, email, password, bio || "New gamer on Info Games", "/default-avatar.svg"]
    );

    res.render("signup", {
      title: "Sign Up",
      error: null,
      message: "Account created successfully. Please log in."
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.render("logout", { title: "Logout" });
  });
});

app.get("/tips", async (req, res) => {
  try {
    const tips = await db.query(`
      SELECT tips.*, users.username, users.profile_image
      FROM tips
      JOIN users ON tips.user_id = users.id
      ORDER BY tips.id DESC
    `);

    let savedIds = [];
    if (req.session.user) {
      const saved = await db.query(
        "SELECT tip_id FROM saved_tips WHERE user_id = ?",
        [req.session.user.id]
      );
      savedIds = saved.map(item => item.tip_id);
    }

    res.render("all-tips", {
      title: "All Tips",
      data: tips,
      savedIds
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/tips/:id", async (req, res) => {
  try {
    const tipId = req.params.id;

    const tipRows = await db.query(
      `SELECT tips.*, users.username, users.profile_image
       FROM tips
       JOIN users ON tips.user_id = users.id
       WHERE tips.id = ?`,
      [tipId]
    );

    if (tipRows.length === 0) {
      return res.status(404).send("Tip not found");
    }

    const commentRows = await db.query(
      `SELECT comments.*, users.username, users.profile_image
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.tip_id = ?
       ORDER BY comments.id DESC`,
      [tipId]
    );

    let isSaved = false;
    if (req.session.user) {
      const saved = await db.query(
        "SELECT id FROM saved_tips WHERE user_id = ? AND tip_id = ?",
        [req.session.user.id, tipId]
      );
      isSaved = saved.length > 0;
    }

    res.render("single-tip", {
      title: "Tip Details",
      tip: tipRows[0],
      comments: commentRows,
      isSaved
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/add-tip", requireLogin, (req, res) => {
  res.render("add-tip", {
    title: "Add Tip",
    message: null,
    error: null
  });
});

app.post("/add-tip", requireLogin, async (req, res) => {
  try {
    const { title, game_name, content } = req.body;

    await db.query(
      "INSERT INTO tips (title, game_name, content, user_id) VALUES (?, ?, ?, ?)",
      [title, game_name, content, req.session.user.id]
    );

    res.render("add-tip", {
      title: "Add Tip",
      message: "Tip added successfully.",
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/tips/:id/edit", requireLogin, async (req, res) => {
  try {
    const tipId = req.params.id;
    const tips = await db.query("SELECT * FROM tips WHERE id = ?", [tipId]);

    if (tips.length === 0) return res.status(404).send("Tip not found");
    if (tips[0].user_id !== req.session.user.id) {
      return res.status(403).send("You can only edit your own tip.");
    }

    res.render("edit-tip", {
      title: "Edit Tip",
      tip: tips[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/tips/:id/edit", requireLogin, async (req, res) => {
  try {
    const tipId = req.params.id;
    const { title, game_name, content } = req.body;

    const tips = await db.query("SELECT * FROM tips WHERE id = ?", [tipId]);

    if (tips.length === 0) return res.status(404).send("Tip not found");
    if (tips[0].user_id !== req.session.user.id) {
      return res.status(403).send("You can only edit your own tip.");
    }

    await db.query(
      "UPDATE tips SET title = ?, game_name = ?, content = ? WHERE id = ?",
      [title, game_name, content, tipId]
    );

    res.redirect(`/tips/${tipId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/tips/:id/delete", requireLogin, async (req, res) => {
  try {
    const tipId = req.params.id;
    const tips = await db.query("SELECT * FROM tips WHERE id = ?", [tipId]);

    if (tips.length === 0) return res.status(404).send("Tip not found");
    if (tips[0].user_id !== req.session.user.id) {
      return res.status(403).send("You can only delete your own tip.");
    }

    await db.query("DELETE FROM tips WHERE id = ?", [tipId]);
    res.redirect("/tips");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/tips/:id/comment", requireLogin, async (req, res) => {
  try {
    const tipId = req.params.id;
    const { content } = req.body;

    await db.query(
      "INSERT INTO comments (content, tip_id, user_id) VALUES (?, ?, ?)",
      [content, tipId, req.session.user.id]
    );

    res.redirect(`/tips/${tipId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/save-tip/:id", requireLogin, async (req, res) => {
  try {
    await db.query(
      "INSERT IGNORE INTO saved_tips (user_id, tip_id) VALUES (?, ?)",
      [req.session.user.id, req.params.id]
    );
    res.redirect(req.get("referer") || "/tips");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/unsave-tip/:id", requireLogin, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM saved_tips WHERE user_id = ? AND tip_id = ?",
      [req.session.user.id, req.params.id]
    );
    res.redirect(req.get("referer") || "/saved-tips");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/saved-tips", requireLogin, async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT tips.*, users.username, users.profile_image
       FROM saved_tips
       JOIN tips ON saved_tips.tip_id = tips.id
       JOIN users ON tips.user_id = users.id
       WHERE saved_tips.user_id = ?
       ORDER BY saved_tips.id DESC`,
      [req.session.user.id]
    );

    res.render("saved-tips", {
      title: "Saved Tips",
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";

    if (!q.trim()) {
      return res.render("search-results", {
        title: "Search Results",
        query: "",
        data: [],
        savedIds: []
      });
    }

    const rows = await db.query(
      `SELECT tips.*, users.username, users.profile_image
       FROM tips
       JOIN users ON tips.user_id = users.id
       WHERE tips.title LIKE ? OR tips.game_name LIKE ? OR tips.content LIKE ?
       ORDER BY tips.id DESC`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    let savedIds = [];
    if (req.session.user) {
      const saved = await db.query(
        "SELECT tip_id FROM saved_tips WHERE user_id = ?",
        [req.session.user.id]
      );
      savedIds = saved.map(item => item.tip_id);
    }

    res.render("search-results", {
      title: "Search Results",
      query: q,
      data: rows,
      savedIds
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/users", async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT users.*,
             COUNT(tips.id) AS tips_count
      FROM users
      LEFT JOIN tips ON users.id = tips.user_id
      GROUP BY users.id
      ORDER BY users.id DESC
    `);

    res.render("users-list", {
      title: "Users",
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/my-account", requireLogin, (req, res) => {
  res.redirect(`/users/${req.session.user.id}`);
});

app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const users = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (users.length === 0) return res.status(404).send("User not found");

    const tips = await db.query(
      "SELECT * FROM tips WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );

    const savedCount = await db.query(
      "SELECT COUNT(*) AS total FROM saved_tips WHERE user_id = ?",
      [userId]
    );

    res.render("user-profile", {
      title: "User Profile",
      user: users[0],
      tips,
      savedCount: savedCount[0].total
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    message: null
  });
});

app.post("/about", async (req, res) => {
  try {
    const { subject_type, name, email, message } = req.body;

    await db.query(
      "INSERT INTO feedback_messages (subject_type, name, email, message) VALUES (?, ?, ?, ?)",
      [subject_type, name, email, message]
    );

    res.render("about", {
      title: "About Us",
      message: "Thank you. Your message has been submitted."
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/help", (req, res) => {
  res.render("help", {
    title: "Help & Support"
  });
});

app.get("/tags", async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT tags.*, COUNT(tip_tags.tip_id) AS total_tips
      FROM tags
      LEFT JOIN tip_tags ON tags.id = tip_tags.tag_id
      GROUP BY tags.id
      ORDER BY tags.tag_name ASC
    `);

    res.render("tags", {
      title: "Tags",
      data: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/account-security", requireLogin, (req, res) => {
  res.render("account-security", {
    title: "Account Security",
    message: null,
    error: null
  });
});

app.post("/account-security", requireLogin, async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      return res.render("account-security", {
        title: "Account Security",
        message: null,
        error: "New passwords do not match."
      });
    }

    const users = await db.query(
      "SELECT * FROM users WHERE id = ? AND password = ?",
      [req.session.user.id, current_password]
    );

    if (users.length === 0) {
      return res.render("account-security", {
        title: "Account Security",
        message: null,
        error: "Current password is incorrect."
      });
    }

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [new_password, req.session.user.id]
    );

    res.render("account-security", {
      title: "Account Security",
      message: "Password updated successfully.",
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});