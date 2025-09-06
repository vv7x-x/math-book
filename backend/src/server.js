import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializeFirebaseAdmin } from './services/firebase.js';
import { router as apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

initializeFirebaseAdmin();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});

