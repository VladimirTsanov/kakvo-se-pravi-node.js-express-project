const express = require('express');
const cookieParser = require('cookie-parser');
const loginRoutes = require('./routes/login');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const validator = require('validator');
const Article = require('./models/article');
const path = require('path');
let mongo = require('mongoose');
const cors = require('cors');
const adminRouter = require('./routes/admin');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(cookieParser('ключ'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, "public")));

app.use('/login', loginRoutes);
app.use('/admin', requireAuth, adminRouter);

const port = 3000;


const url = 'mongodb+srv://myuser:qwertyqwerty@cluster0.bcxfop9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const connectDB = async () => {
    try {
        await mongo.connect(url, {
            dbName: "test"
        });
        console.log('MongoDB connected!');

        const categoryRoutes = require('./routes/categories');
        app.use('/category', categoryRoutes);

        const articleRoutes = require('./routes/articles');
        app.use('/article', articleRoutes);

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`)
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
    }
};

connectDB();

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

app.use((req, res, next) => {
  res.locals.search = req.query.search || "";
  next();
});


app.get('/', async (req, res) => {

    let views_list = await Article.aggregate([
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$articleViews" }
            }
        }
    ]);

    let top_three_Categories = await Article.aggregate([
        {
            $group: {
                _id: "$categorySlug",
                totalViews: { $sum: "$articleViews" }
            }
        },
        { $sort: { totalViews: -1 } },
        { $limit: 3 }
    ]);

    let articles_top_five = await Article.find().sort({ articleViews: -1 }).limit(5);

    let total_views = views_list[0]?.totalViews || 0;

    let topCategoriesDisplay = top_three_Categories.map(cat => {
        let match = allCategories.find(c => c.slug === cat._id);
        return {
            name: match?.name || cat._id,
            views: cat.totalViews,
            percentage: Math.round((cat.totalViews / total_views) * 100)
        };
    });

    res.render('homepage', {
        allCategories,
        articles_top_five,
        topCategoriesDisplay, 
        total_views,
    });

});

function requireAuth(req, res, next) {
    if (req.signedCookies.auth === 'admin') {
        return next();
    }
    res.redirect('/login');
}

app.get('/all-categories', (req, res) => {
    res.render('all_categories', { allCategories });
});

app.get('/feedback', (req, res) => {
    res.render('feedback', { allCategories, errors: [] });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

app.post('/feedback', async (req, res) => {

    const { errors = [], name = '', email = '', message = '' } = req.body;

    if (!name.trim()) errors.push("Трябва да попълните полето за име!");
    if (name && /[`!@#$%^&*()\[\]{};':"\\|,.<>\/?~]/.test(name))
        errors.push("Името съдържа недопустими символи.");

    if (!email.trim()) errors.push("Трябва да попълните полето за имейл!");
    if (email && !validator.isEmail(email))
        errors.push("Невалиден имейл адрес.");

    if (!message.trim()) errors.push("Полето за съобщение е задължително.");

    if (errors.length) {
        return res.render("feedback", { errors });
    }


    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.SMTP_USER,
        subject: 'Новo съобщение от формата на уебсайт \"Какво се прави\" ',
        text: `Име: ${name}\nИмейл на подателя: ${email}\nСъобщение:\n${message}`,
        html: `
            <p><strong>Име:</strong> ${name}</p>
            <p><strong>Имейл на подателя:</strong> ${email}</p>
            <p><strong>Съобщение:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (err) {
        console.error('Email send error:', err);
        res.json({ success: false, error: 'Имейлът не бе изпратен! Възникна проблем.' });
    }
});

app.get('/about-page', (req, res) => {
    res.render('about', { allCategories });
});

app.get('/search_results', async(req, res) => {
    const { search } = req.query;

    let searchQuery = await Article.find({
        $or: [
            {title: { $regex: search, $options: 'i' }},
            {content: { $regex: search, $options: 'i' }}
        ]
    });

    res.render('search_results', { articles: searchQuery, search, allCategories });
});



