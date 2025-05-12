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

 router.post('/register',upload.single('image'), async (req, res) => {
  
  const sql = `INSERT INTO users 
  (name,email,phone,password, role,type,dob, image) 
  VALUES (?)`;
  bcrypt.hash(req.body.password, 10, (err, hash) => {
      if(err)
       return res.json({Status: false, Error: "Hashing Error"})
       const image = req.file ? req.file.filename : null;
 const values = [
          req.body.name,
          req.body.email,
          req.body.phone,
          hash,
          req.body.role,
          req.body.type, 
          req.body.dob,
image      ]
      con.query(sql, [values], (err, result) => {
          if(err) return res.json({Status: false, Error: err.message})
          return res.json({Status: true,message:"user registered successfully"})
      })
  })
})



router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
   con.query('SELECT * FROM users WHERE email = ?', [email],async (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });

    if (result.length > 0) {
      const user=result[0]
      const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    return res.json({ user, token});
  }
    else {
      return res.json({ loginStatus: false, Error:"wrong email or password" });
  }
  } )
}
catch {
    res.status(500).json({ message: 'Server error' });
  }

});

export default router