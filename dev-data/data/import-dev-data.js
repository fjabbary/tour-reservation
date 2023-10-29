const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(con => {
        console.log('DB connection successful');
    })


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours)
    } catch (err) {
        console.log(err)
    }
    process.exit();
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err)
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData();
    console.log('Data successfully added!');

} else if (process.argv[2] === '--delete') {
    deleteData()
}
console.log(process.argv);