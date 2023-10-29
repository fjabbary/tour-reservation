
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(con => {
        console.log('DB connection successful');
    })



// 4) START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running at port ${port}`);
})       