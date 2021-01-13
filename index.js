require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const app = express();



mongoose.connect(process.env.DATABASE_ATLAS, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoCreate : true,
    setDefaultsOnInsert: true
})
.then(() => {console.log("DB connected");

})
.catch((err)=> console.error("DB Connection errror", err));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');


// Applicationn Middelwares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors()); // allows all origins
// if ((process.env.NODE_ENV = 'development')) {
//     app.use(cors({ origin: `http://localhost:3000` }));
// }

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

 
// Middlewares
app.use('/api',authRoutes);
app.use('/api',userRoutes);





const port = process.env.PORT  || 8000;
app.listen(port, () => {
    console.log(`API is running on port ${port} - http://localhost:${port} - ${process.env.NODE_ENV}`);
});

