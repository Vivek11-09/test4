const express = require('express');
const morgan = require('morgan');
const initialPath = require('initial-path');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
// Basic middleware
app.use(express.json());
app.use(morgan('dev'));
// initial-path is optional but harmless
app.use(initialPath());

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Not Found
app.use('*', notFound);

// Export app for tests; only listen when run directly
if (require.main === module) {
	app.listen(port, () => console.log('Backend running on http://localhost:' + port));
}

module.exports = app;