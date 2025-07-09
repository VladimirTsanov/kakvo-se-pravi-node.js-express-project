const express = require('express');
const path = require('path');
const app = express();
let mongo = require('mongoose');
let Article = require('./models/article');
const cors = require('cors');

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

mongo.connect('mongodb+srv://myuser:qwertyqwerty@cluster0.bcxfop9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        console.log('MongoDB connected');
    })

const categoriesRouter = require('./routes/categories');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('homepage', { allCategories });
});

app.use('/category', categoriesRouter);

app.get('/all-categories', (req, res) => {
    res.render('all_categories', { allCategories });
});

app.get('/frequently-asked-questions', (req, res) => {
    res.render('asked_questions', { allCategories });
});

app.get('/feedback', (req, res) => {
    res.render('feedback', { allCategories });
});

app.get('/about-page', (req, res) => {
    res.render('about', { allCategories });
});

app.get('/admin', (req, res) => {
    res.render('admin', { allCategories });
});

app.post('/admin', (req, res) => {
    const {title, slug, categorySlug, content} = req.body;

    if (!title || !slug || !categorySlug) {
        return res.status(400).json({message: 'Попълни всички задължителни полета!'});
    }

    const newArticle = new Article({ title, slug, categorySlug, content });

    newArticle.save()
        .then(() => {
            res.json({ message: 'Статията е записана успешно.' })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Грешка при записване.' });
        });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});