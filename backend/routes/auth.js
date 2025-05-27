import express from "express";
import con from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'
import multer from "multer";
import path from "path";

const JWT_SECRET = 'key123';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Images'),
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
 export const upload = multer({ storage });

router.post('/register', upload.single('image'), async (req, res) => {
  try {
    const { name, email, phone, password, role, type, dob } = req.body;
    const image = req.file ? req.file.filename : null;


    con.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database query error" });
      }

      if (result.length > 0) {
        return res.status(409).json({ error: "Email already registered" }); // 409 = Conflict
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `INSERT INTO users (name, email, phone, password, role, type, dob, image) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      con.query(
        sql,
        [name, email, phone, hashedPassword, role, type, dob, image],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error("Insert error:", insertErr);
            return res.status(500).json({ error: "Failed to register" });
          }

          res.status(201).json({ message: "User registered successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});





router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
   con.query('SELECT * FROM users WHERE email = ?', [email],async (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });

    if (result.length > 0) {
      const user=result[0]
      const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role.toLowerCase() }, JWT_SECRET, { expiresIn: '1d' });
    
    return res.json({ user, token});
  }
    else {
      return res.json({ loginStatus: false, message: 'Invalid credentials'  });
  }
  } )
}
catch {
    res.status(500).json({ message: 'Server error' });
  }

});

export default router