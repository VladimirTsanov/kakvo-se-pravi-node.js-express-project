const express = require('express');
const Article = require('../models/article');
const router = express.Router();

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


router.get('/:slug', async (req, res) => {


    const { slug } = req.params;

    try {
        const articles = await Article.find({ categorySlug: slug });
        res.render('category', { slug, allCategories, list_of_TheCategory: articles });
    } catch (err) {
        console.error(err);
        res.status(500).send("DB error");
    }
});

module.exports = router;
