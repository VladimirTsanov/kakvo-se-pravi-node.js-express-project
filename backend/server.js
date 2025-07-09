const express = require('express');
const path = require('path');

let mongo = require('mongoose');
const { MongoClient} = require('mongodb');
let Article = require('./models/article');
const cors = require('cors');

const port = 3000;
const app = express();

const url = 'mongodb+srv://myuser:qwertyqwerty@cluster0.bcxfop9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const client = new MongoClient(url);

client.connect()
    .then(() => {
        console.log("MongoDb connected");
        const db = client.db('test');
        app.locals.db = db;

        const categoryRoutes = require('./routes/categories');
        app.use('/category', categoryRoutes);

        const articleRoutes = require('./routes/articles');
        app.use('/article', articleRoutes);

        app.listen(port, ()=> {
            console.log(`Server running at http://localhost:${port}`)
        });
    })
    .catch(err => {
        console.log('Error connecting to MongoD:', err);
    });

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('homepage', { allCategories });
});



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

