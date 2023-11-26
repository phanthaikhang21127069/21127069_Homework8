const express = require('express');
const app = express();
const port = 3800;
const expressHbs = require('express-handlebars');
const helpers = require('handlebars-helpers')();

app.use(express.static(__dirname + '/html'));

app.engine('hbs', expressHbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    defaultLayout: 'layout',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    }, 
    helpers: {
        ...helpers,
    //     showDate: (date) => {
    //         return date.toLocaleDateString('en-US', {
    //             year: 'numeric',
    //             month: 'long',
    //             day: 'numeric'
    //         });
    //     }
    }
}));

app.set('view engine', 'hbs');
app.get('/', (req, res) => res.redirect('/blogs?page=1'));
app.use('/blogs', require('./routes/blogRouter'));

app.get('/createTables', (req, res) => {
    let models = require('./models');
    models.sequelize.sync().then(() => {
        res.send('Tables created!');
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));