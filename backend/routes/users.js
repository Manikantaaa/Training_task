import express  from 'express';
import con from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {upload} from './auth.js'
const router = express.Router();


router.get('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  con.query(
    'SELECT id, name, email, phone, role, type, dob,image FROM users',
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(result);
    }
  );
});


router.get('/employees', authMiddleware,  (req, res) => {
  try {
    con.query(
      "SELECT id, name, email, phone, type, dob,image FROM users WHERE role = 'Employee'",
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(result);
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', authMiddleware,upload.single('image'),(req, res) => {

  const { name, phone,email, type } = req.body;
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.id != id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const image = req.file ? req.file.filename : null;

  const sql = image
    ? 'UPDATE users SET name = ?, phone = ?,email=?, type = ?, image = ? WHERE id = ?'
    : 'UPDATE users SET name = ?, phone = ?,email=?, type = ? WHERE id = ?';

  const values = image
    ? [name, phone,email, type, image, id]
    : [name, phone,email, type, id];

  con.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'User updated successfully' });
  });
});

router.delete('/:id', authMiddleware,  (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
     con.query('DELETE FROM users WHERE id = ?', [req.params.id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
     
    res.json({ message: 'User deleted successfully' });
  } )
}catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router