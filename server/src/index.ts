import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import allocationsRouter from './routes/allocations';
import transfersRouter from './routes/transfers';
import maintenanceRouter from './routes/maintenance';
import bookingsRouter from './routes/bookings';
import usersRouter from './routes/users';
import aiRouter from './routes/ai';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/allocations', allocationsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AssetFlow server running on port ${PORT}`);
});