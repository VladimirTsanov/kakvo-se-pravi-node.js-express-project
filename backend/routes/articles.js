const express = require("express");
const PostView = require('../models/post_view')
const Article = require('../models/article');
const router = express.Router();
const moment = require('moment-timezone');

const allCategories = [
    {
        name: "Лична информация",
        slug: "personal-info",
        description: "Описание за лична информация",
    },
    {
        name: "Работа и осигуровки",
        slug: "works-insurances",
        description: "Описание за работа и осигуровки",
    },
    {
        name: "Данъци и финанси",
        slug: "tax-finances",
        description: "Описание за данъци и финанси",
    },
    {
        name: "Здравеопазване",
        slug: "healthcare",
        description: "Описание за здравеопазване",
    },
    {
        name: "Образование",
        slug: "education",
        description: "Описание за образование",
    },
    {
        name: "Транспорт и шофиране",
        slug: "transport-driving",
        description: "Описание за транспорт и шофиране",
    },
    {
        name: "Жилище и комунални",
        slug: "house",
        description: "Описание за жилище и комунални",
    },
    {
        name: "Граждански права",
        slug: "citizen-rights",
        description: "Описание за граждански права",
    },
    {
        name: "Пътуване в чужбина",
        slug: "foreign-trip",
        description: "Описание за пътуване в чужбина",
    },
    {
        name: "Електронни услуги",
        slug: "e-services",
        description: "Описание за електронни услуги",
    }
]

router.get("/:slug", async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { slug } = req.params;

    try {
        const posts = await Article.findOne({ slug: slug })

        if (!posts) return res.status(404).send('Not found');

        const view = await PostView.findOne({ postId: posts._id, ip });
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        if (!view) {
            await PostView.create({ postId: posts._id, ip, lastViewedAt: now })
            await Article.updateOne({ _id: posts._id }, { $inc: { articleViews: 1 } });
        } else if (view.lastViewedAt < oneHourAgo) {
            await PostView.updateOne({ _id: view._id }, { lastViewedAt: now });
            await Article.updateOne({ _id: posts._id }, { $inc: { articleViews: 1 } });
        }

        const formattedDate = moment(posts.createdAt).tz('Europe/Sofia').format('DD.MM.YYYY HH:mm');
        res.render('article', { slug, allCategories, the_article: posts, formattedDate });
    } catch (err) {
        console.error(err);
        res.status(500).send("DB error");
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Article.deleteOne({ _id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});



module.exports = router;