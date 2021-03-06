var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

exports.index = function(req, res) {   
    async.parallel({
        book_count: function(callback) {
            console.log(callback)
            Book.count(callback);
        },
        book_instance_count: function(callback) {
            BookInstance.count(callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.count(callback);
        },
        genre_count: function(callback) {
            Genre.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all books
exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
    .populate('author')
    .exec(function(err, list_book){
        if(err) {return next(err);}
        res.render('book_list', {title: 'Book List', book_list: list_book});
    })
};

// Display detail page for a specific book
exports.book_detail = function(req, res, next) {
    async.parallel({
        book: function(callback){
            Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback)
        },

        book_instance: function(callback){
            BookInstance.find({'book' : req.params.id})
            .exec(callback)
        },
    }, function(err, results){
        if(err) {return next(err);}
        res.render('book_detail', {title: 'Title', book: results.book, book_instance: result.book_instance})
    })
};

// Display book create form on GET
exports.book_create_get = function(req, res, next) {
    async.parallel({
        authors: function(callback){
            Author.find(callback);
        },
        genres: function(callbacl){
            Genre.find(callback);
        },
    }, function(err, results){
        if (err) {return next(err);}

        res.render('book_form', {title: 'Create Books', authors: results.authors, genres: results.genres});
    });
};

// Handle book create on POST
exports.book_create_post = function(req, res) {
    req.checkBody('title', 'Title must not be empty').notEmpty();
    req.checkBody('author', 'Author must not be empty').notEmpty();
    req.checkBody('summary', 'Summary must not be empty').notEmpty();
    req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

    req.sanitize('title').escape();
    req.sanitize('author').escape();
    req.sanitize('summary').escape();
    req.sanitize('isbn').escape();
    req.sanitize('title').trim();
    req.sanitize('author').trim();
    req.sanitize('summary').trim();
    req.sanitize('isbn').trim();

    var book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: (typeof req.body.genre==='undefined')? [] : req.body.genre.split(",")
    });

    var errors = req.validationErrors();

    if(errors){
        async.parallel({
            author: function(callback){
                Author.find(callback)
            },
            genres: function(callback){
                Genre.find(callbacl)
            },
        }, function(err, results){
            if(err) {return next(err);}

            for(i=0; i < results.genres.length; i++){
                if(book.genre.indexOf(result.genres[i]._id) > -1){
                    result.genres[i].checked='true';
                }
            }
            res.render('book_form', {title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors});
        });
    }else{
        book.save(function(err){
            res.redirect(book.url);
        });
    }
};

// Display book delete form on GET
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};