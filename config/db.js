const mongoose = require("mongoose");

// const MONGO_URL = "mongodb://127.0.0.1:27017/secondBrain";
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
};

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

module.exports = main;


