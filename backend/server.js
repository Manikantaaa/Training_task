import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import con from './db.js';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import dotenv from 'dotenv';
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();


const Banners = path.join(__dirname, "Banners"); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, Banners);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploads = multer({ storage });

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

app.use("/Images", express.static(path.join(__dirname, "Images")));
app.use("/Banners", express.static("Banners")); 

app.use(authRoutes);
app.use(userRoutes);

app.post("/upload-multiple-banners", uploads.array("files"), (req, res) => {
  const { existingIds = [], existingVisibility = [], deletedIds = [], existingOrder = [] } = req.body;
  const files = req.files;
  const { order = [] } = req.body;

  const existingIdArray = Array.isArray(existingIds) ? existingIds : [existingIds];
  const visibilityArray = Array.isArray(existingVisibility) ? existingVisibility : [existingVisibility];
  const orderArray = Array.isArray(order) ? order : [order];
  const existingOrderArray = Array.isArray(existingOrder) ? existingOrder : [existingOrder];
  const deletedIdArray = Array.isArray(deletedIds) ? deletedIds : [deletedIds];

  const insertNewBanners = files.map((file, index) => {
    const visibility = visibilityArray[index] || "visible";
    const orderIndex = parseInt(orderArray[index]) || 0;
    return new Promise((resolve, reject) => {
      con.query(
        "INSERT INTO banners (filename, visibility, order_index) VALUES (?, ?, ?)",
        [file.filename, visibility, orderIndex],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });

  const updateExistingBanners = existingIdArray.map((id, index) => {
    const visibility = visibilityArray[index] || "visible";
    const orderIndex = parseInt(existingOrderArray[index]) || 0;
    return new Promise((resolve, reject) => {
      con.query(
        "UPDATE banners SET visibility = ?, order_index = ? WHERE id = ?",
        [visibility, orderIndex, id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });

  const deleteBanners = deletedIdArray.map((id) => {
    return new Promise((resolve, reject) => {
      con.query("SELECT filename FROM banners WHERE id = ?", [id], (err, results) => {
        if (err) return reject(err);
        if (results.length > 0) {
          const filePath = path.join(__dirname, "Banners", results[0].filename);
          fs.unlink(filePath, (fsErr) => {
            if (fsErr && fsErr.code !== "ENOENT") {
              return reject(fsErr); 
            }
            con.query("DELETE FROM banners WHERE id = ?", [id], (deleteErr) => {
              if (deleteErr) return reject(deleteErr);
              resolve();
            });
          });
        } else {
          resolve(); 
        }
      });
    });
  });

  Promise.all([...insertNewBanners, ...updateExistingBanners, ...deleteBanners])
    .then(() => res.json({ message: "Banners updated successfully" }))
    .catch((error) => {
      console.error("Banner processing error:", error);
      res.status(500).json({ error: "Banner update failed" });
    });
});




app.get("/banners", (req, res) => {
  const query = "SELECT filename FROM banners WHERE visibility = 'visible' ORDER BY order_index ASC";

  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching banners:", err);
      return res.status(500).json({ error: "Failed to load banners" });
    }

    res.json(results); 
  });
});

app.get("/allbanners", (req, res) => {
  const query = "SELECT * FROM banners ORDER BY order_index ASC";


  con.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching banners:", err);
      return res.status(500).json({ error: "Failed to load banners" });
    }

    res.json(results); 
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
