const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./lib/db');
const { init: initSocket } = require('./lib/socket');
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/authRouter')
const gigRouter = require('./routers/gigRouter')
const bidRouter = require('./routers/bidRouter')
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000','http://localhost:5173']
}));

const PORT = process.env.PORT || 5000;
app.use('/api/auth',authRouter);
app.use('/api/gigs',gigRouter);
app.use('/api/bids',bidRouter);
const server = app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();

    // initialize real-time sockets
    initSocket(server);
});


