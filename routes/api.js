var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Book = mongoose.model('Book');
var User = mongoose.model('User');

function isAuthenticated(req, res, next) {
    // if(req.method === "GET"){
    //     return next();
    // }
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/#login');
};
router.use('/books/', isAuthenticated);
router.use('/books/:created_by', isAuthenticated);
router.use('/books/:created_by/:id', isAuthenticated);

router.route('/books/')
    .get(function(req, res) {
        Book.find({
                "request.accepted": false
        }, function(err, books) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(books);
        });
    });
router.route('/books/:created_by')
    .get(function(req, res) {
        Book.find({
            $or: [{
                "request.user":req.params.created_by
            }, {
                "created_by": req.params.created_by
            }]
        }, function(err, books) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(books);
        });
    });

router.route('/book/:created_by')
    .post(function(req, res) {
        var book = new Book();
        book.name = req.body.name;
        book.url_img = req.body.url_img;
        book.created_by = req.params.created_by;
        book.request = req.body.request;

        book.save(function(err, book) {
            if (err) {
                return res.send(500, err);
            }
            return res.json(book);
        });
    })
    .get(function(req, res) {
        Book.find({
            'created_by': req.params.created_by
        }, function(err, book) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(book);
        });
    });

router.route('/book/:id')
    .get(function(req, res) {
        Book.findById(req.params.id, function(err, book) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(book);
        });
    })
    .put(function(req, res) {
        Book.findById(req.params.id, function(err, book) {
            if (err) res.send(err);

            book.request = req.body.request;
            book.save(function(err, book) {
                if (err) res.send(err);
                res.json(book);
            });
        });
    })
    .delete(function(req, res) {
        Book.remove({
            _id: req.params.id
        }, function(err) {
            if (err) res.send(err);
            res.json("deleted :" + req.params.id);
        });
    });

router.route('/user/:username')
    .get(function(req, res) {
        User.findOne({
            'username': req.params.username
        }, function(err, user) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(user);
        });
    })
    .put(function(req, res) {
        User.findOne({
            'username': req.params.username
        }, function(err, user) {
            if (err) res.send(err);
            user.name = req.body.name;
            user.city = req.body.city;
            user.state = req.body.state;


            user.save(function(err, user) {
                if (err) return(err);
                res.json(user);
            });
        });
    });

module.exports = router;