const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const knowledgeSchema = new Schema({
    title : {
        type : String,
        required : true
    },

    content: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    tags: {
        type: [String]   // optional
    },

    sourceUrl: {
        type: String     // optional
    },

    summary: {
        type: String     // AI generated summary
    },
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}

}, { timestamps: true });

module.exports = mongoose.model("Knowledge", knowledgeSchema);