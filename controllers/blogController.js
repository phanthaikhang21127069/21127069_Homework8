const controller = {};
const { create } = require('express-handlebars');
const models = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const ITEMS_PER_PAGE = 2; // Adjust this based on your desired number of items per page


controller.showList = async (req, res) => {
    const page = req.query.page || 1;
    const searchQuery = req.query.query || '';

    let whereCondition = {};
    if (searchQuery) {
        whereCondition = {
            title: {
                [Op.iLike]: `%${searchQuery}%`,
            },
        };
    }

    // Use COUNT(DISTINCT "title") to get the count of distinct titles
    const totalCount = await models.Blog.count({
        distinct: true,
        col: 'title',
        where: whereCondition,
    });

    const { count, rows: blogs } = await models.Blog.findAndCountAll({
        attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
        include: [{ 
            model: models.Comment
        }],
        where: whereCondition,
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const hasItems = blogs.length > 0;

    res.locals.blogs = blogs;
    res.locals.currentPage = page;
    res.locals.totalPages = totalPages;
    res.locals.hasItems = hasItems;
    res.locals.query = searchQuery;

    res.render('index', { totalPages, hasItems });
}

//old pagination

/*
controller.showList = async (req, res) => {
  const page = req.query.page || 1;

  // Fetch the count of all blogs (without limit and offset)
  const totalCount = await models.Blog.count();

  const { count, rows: blogs } = await models.Blog.findAndCountAll({
      attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
      include: [{ 
          model: models.Comment
      }],
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Redirect to the last page if the requested page is greater than the total pages
  if (page > totalPages && totalPages > 0) {
      return res.redirect(`/blogs?page=${totalPages}`);
  }

  const hasItems = blogs.length > 0; // Check if the page has items

  res.locals.blogs = blogs;
  res.locals.currentPage = page;
  res.locals.totalPages = totalPages;

  console.log(totalPages);

  res.render('index', { totalPages});
}
*/

controller.showDetails = async(req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    res.locals.blog = await models.Blog.findOne({
        attributes: ['id', 'title', 'description', 'createdAt'],
        where: { id: id },
        include: [
            { model: models.Category },
            { model: models.User },
            { model: models.Tag },
            { model: models.Comment }
        ]
    })
    res.render('details');
}


// const Category = models.Category;

// //browser by category
// controller.showByCategory = async (req, res) => {
//     const categoryId = parseInt(req.params.categoryId);
//     const page = req.query.page || 1;
  
//     try {
//       // Fetch the count of all blogs for a specific category
//       const totalCount = await models.Blog.count({
//         include: [{
//           model: Category,
//           where: { id: categoryId }
//         }]
//       });
  
//       const { count, rows: blogs } = await models.Blog.findAndCountAll({
//         attributes: ['id', 'title', 'imagePath', 'summary', 'createdAt'],
//         include: [{
//           model: models.Comment
//         }],
//         where: {
//           '$Categories.id$': categoryId
//         },
//         limit: ITEMS_PER_PAGE,
//         offset: (page - 1) * ITEMS_PER_PAGE,
//       });
  
//       const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
//       // Redirect to the last page if the requested page is greater than the total pages
//       if (page > totalPages && totalPages > 0) {
//         return res.redirect(`/blogs/category/${categoryId}?page=${totalPages}`);
//       }
  
//       const hasItems = blogs.length > 0;
  
//       res.locals.blogs = blogs;
//       res.locals.currentPage = page;
//       res.locals.totalPages = totalPages;
//       res.locals.categoryId = categoryId;
//       res.locals.hasItems = hasItems;
  
//       res.render('index', { totalPages, hasItems });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };

module.exports = controller;