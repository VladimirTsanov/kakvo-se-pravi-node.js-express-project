const express = require("express");
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

router.get('/', async (req, res) => {

    try {
        const articles = await Article.find({})

        if (!articles) {
            return res.status(404).send("Няма намерени статии");
        }

        return res.render('admin', { allCategories, articles, Article });

    } catch (err) {
        console.error(err);
        res.status(500).send("Грешка при заявка към базата")
    }
});

router.get('/add-article', (req, res) => {
    res.render("add_article", { allCategories });
});

router.post('/add-article', async (req, res) => {
    try {
        const { title, slug, categorySlug, content } = req.body;
        if (!title || !slug || !categorySlug) {
            return res.status(400).json({ message: 'Попълни всички задължителни полета!' });
        }
        const newArticle = new Article({ title, slug, categorySlug, content });
        await newArticle.save();
        res.json({ message: 'Статията е записана успешно.' });
    } catch (err) {
        console.error('Error saving article:', err);
        res.status(500).json({ message: 'Грешка при записване.' });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const post_to_edit = await Article.findOne({ _id: id })
        res.render('edit_article', { id, allCategories, post_to_edit });
    } catch (err) {
        console.error(err);
        res.status(500).send("DB error");
    }
});

router.post("/update-article", async (req, res) => {
    const { id, title, slug, content, categorySlug } = req.body;

    try {
        await Article.updateOne(
            { _id: id },
            { $set: { title, slug, content, categorySlug } }
        );
        res.redirect("/admin");
    } catch (err) {
        console.error(err);
        res.status(500).send("DB error");
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("auth", {
        httpOnly: true,
        signed: true,
        path: "/"
    });
    res.redirect("/");
});

module.exports = router;