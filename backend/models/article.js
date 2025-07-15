const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');


const articleSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true
    },

    categorySlug: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: false
    }, 

    createdAt: {
        type: Date,
        default:() => moment().tz('Europe/Sofia').toDate()
    },

    articleViews: {
        type: Number
    },

    imageUrl: {
        type: String,
    }
});

const Article = mongoose.model('Article', articleSchema)
module.exports = Article;