const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",

  // Current Vercel deployment
  "https://it-service-desk-ticket-management-snowy.vercel.app",

  // Previous Vercel deployments
  "https://it-service-desk1.vercel.app",
  "https://it-service-desk1-llj6.vercel.app",
  "https://it-service-desk1-1kya.vercel.app",
  "https://it-service-desk1-bzsf.vercel.app",

  // Add any new Vercel URL here, e.g.:
  // "https://your-new-deployment.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, curl, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Origin not allowed"));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Tenant-Id",
    ],
  })
);

app.use(express.json());

/* =========================
   DATABASE
========================= */

const dbPath = path.join(__dirname, "db.json");

function getDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch (error) {
    console.error("Database read error:", error);
    throw error;
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(
      dbPath,
      JSON.stringify(db, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Database write error:", error);
    throw error;
  }
}

// Filters an array of records against req.query, e.g. GET /users?email=a@b.com
// Comparison is case-insensitive and trims whitespace so "Email" vs "email"
// casing differences (and stray spaces) never break a lookup.
function applyQueryFilters(records, query) {
  const filterKeys = Object.keys(query || {});
  if (filterKeys.length === 0) return records;

  return records.filter((record) =>
    filterKeys.every((key) => {
      if (!(key in record)) return false;
      const recordValue = String(record[key]).trim().toLowerCase();
      const queryValue = String(query[key]).trim().toLowerCase();
      return recordValue === queryValue;
    })
  );
}

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IT Service Desk API is running",
  });
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "IT Service Desk server is running",
  });
});

/* =========================
   LOGIN
   POST /api/login
========================= */

app.post("/api/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const db = getDB();

    const user = db.users.find(
      (item) =>
        String(item.email).trim().toLowerCase() ===
        String(email).trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (
      String(user.status).toLowerCase() !==
      "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive",
      });
    }

    // Never send password back to frontend
    const { password: removedPassword, ...userData } = user;

    return res.json({
      success: true,
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================
   LOGIN WITHOUT /api
   POST /login
========================= */

app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const db = getDB();

    const user = db.users.find(
      (item) =>
        String(item.email).trim().toLowerCase() ===
        String(email).trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (
      String(user.status).toLowerCase() !==
      "active"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive",
      });
    }

    const { password: removedPassword, ...userData } = user;

    return res.json({
      success: true,
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================
   GET ALL
   /api/users
   /api/tickets
   /api/comments
   /api/categories
   /api/activities
========================= */

app.get("/api/:resource", (req, res) => {
  try {
    const db = getDB();
    const resource = req.params.resource;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    return res.json(applyQueryFilters(db[resource], req.query));
  } catch (error) {
    console.error("GET error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load data",
    });
  }
});

/* =========================
   GET ALL WITHOUT /api
   /users
   /tickets
   /comments
   /categories
   /activities
========================= */

app.get("/:resource", (req, res) => {
  try {
    const db = getDB();
    const resource = req.params.resource;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    return res.json(applyQueryFilters(db[resource], req.query));
  } catch (error) {
    console.error("GET error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load data",
    });
  }
});

/* =========================
   GET BY ID
   /api/users/:id
   /api/tickets/:id
========================= */

app.get("/api/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const item = db[resource].find(
      (item) => String(item.id) === String(id)
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    return res.json(item);
  } catch (error) {
    console.error("GET BY ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load item",
    });
  }
});

/* =========================
   GET BY ID WITHOUT /api
========================= */

app.get("/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const item = db[resource].find(
      (item) => String(item.id) === String(id)
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    return res.json(item);
  } catch (error) {
    console.error("GET BY ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load item",
    });
  }
});

/* =========================
   CREATE
   POST /api/tickets
   POST /api/users
   POST /api/categories
   POST /api/comments
========================= */

app.post("/api/:resource", (req, res) => {
  try {
    const db = getDB();
    const resource = req.params.resource;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const newItem = {
      ...req.body,
    };

    if (!newItem.id) {
      newItem.id = `${resource.toUpperCase()}_${Date.now()}`;
    }

    db[resource].push(newItem);

    saveDB(db);

    return res.status(201).json(newItem);
  } catch (error) {
    console.error("POST error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create item",
    });
  }
});

/* =========================
   CREATE WITHOUT /api
========================= */

app.post("/:resource", (req, res) => {
  try {
    const db = getDB();
    const resource = req.params.resource;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const newItem = {
      ...req.body,
    };

    if (!newItem.id) {
      newItem.id = `${resource.toUpperCase()}_${Date.now()}`;
    }

    db[resource].push(newItem);

    saveDB(db);

    return res.status(201).json(newItem);
  } catch (error) {
    console.error("POST error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create item",
    });
  }
});

/* =========================
   UPDATE
   PUT /api/tickets/:id
========================= */

app.put("/api/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const index = db[resource].findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    db[resource][index] = {
      ...db[resource][index],
      ...req.body,
      id: db[resource][index].id,
    };

    saveDB(db);

    return res.json(db[resource][index]);
  } catch (error) {
    console.error("PUT error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
});

/* =========================
   UPDATE WITHOUT /api
========================= */

app.put("/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const index = db[resource].findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    db[resource][index] = {
      ...db[resource][index],
      ...req.body,
      id: db[resource][index].id,
    };

    saveDB(db);

    return res.json(db[resource][index]);
  } catch (error) {
    console.error("PUT error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
});

/* =========================
   PATCH
========================= */

app.patch("/api/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const index = db[resource].findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    db[resource][index] = {
      ...db[resource][index],
      ...req.body,
    };

    saveDB(db);

    return res.json(db[resource][index]);
  } catch (error) {
    console.error("PATCH error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
});

/* =========================
   PATCH WITHOUT /api
========================= */

app.patch("/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const index = db[resource].findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    db[resource][index] = {
      ...db[resource][index],
      ...req.body,
    };

    saveDB(db);

    return res.json(db[resource][index]);
  } catch (error) {
    console.error("PATCH error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
});

/* =========================
   DELETE
   DELETE /api/tickets/:id
========================= */

app.delete("/api/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const index = db[resource].findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    const deletedItem = db[resource].splice(index, 1)[0];

    saveDB(db);

    return res.json({
      success: true,
      message: "Item deleted successfully",
      data: deletedItem,
    });
  } catch (error) {
    console.error("DELETE error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
});

/* =========================
   DELETE WITHOUT /api
========================= */

app.delete("/:resource/:id", (req, res) => {
  try {
    const db = getDB();

    const resource = req.params.resource;
    const id = req.params.id;

    if (!Object.prototype.hasOwnProperty.call(db, resource)) {
      return res.status(404).json({
        success: false,
        message: `Resource '${resource}' not found`,
      });
    }

    const index = db[resource].findIndex(
      (item) => String(item.id) === String(id)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `${resource} with id ${id} not found`,
      });
    }

    const deletedItem = db[resource].splice(index, 1)[0];

    saveDB(db);

    return res.json({
      success: true,
      message: "Item deleted successfully",
      data: deletedItem,
    });
  } catch (error) {
    console.error("DELETE error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
});

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error.message && error.message.startsWith("CORS:")) {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================
   SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `IT Service Desk API running on port ${PORT}`
  );
});