import 'dotenv/config';
import { createApp } from './app.js';
import { safeLogger } from './utils/logger.js';

const PORT = Number(process.env.PORT || 4000);
const app = createApp();

app.listen(PORT, () => {
  safeLogger.info(`Chitthi API listening on port ${PORT}`, {
    demoMode: process.env.USE_DEMO_MODE !== 'false',
  });
});
