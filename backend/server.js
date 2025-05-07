import express from "express";
import cors from 'cors'
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import path from 'path';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true

  }));
app.use(express.json());

const __dirname = path.resolve(); 

app.use('/Images', express.static(path.join(__dirname, 'Images')));
app.use('/api', authRoutes);
app.use('/api', userRoutes);



const PORT=3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
