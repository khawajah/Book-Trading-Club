var app = angular.module('bookClub', ['ngRoute']).run(function($http, $rootScope) {
    $rootScope.authenticated = false;
    $rootScope.current_user = 'Guest';

    $rootScope.signout = function() {
        $http.get('auth/signout');
        $rootScope.authenticated = false;
        $rootScope.current_user = 'Guest';
    };
});

//
//  ROUTER
//
app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main.html'
        })
        .when('/allbooks', {
            templateUrl: 'partials/allbooks.html',
            controller: 'allBooksController'
        })
        .when('/mybooks', {
            templateUrl: 'partials/mybooks.html',
            controller: 'myBooksController'
        })
        .when('/myprofile', {
            templateUrl: 'partials/myprofile.html',
            controller: 'profileController'
        })
        .when('/trade', {
            templateUrl: 'partials/trade.html',
            controller: 'tradeController'
        })
        .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'authController'
        })
        .when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'authController'
        });

});

//
//  AUTHENTICATION CONTROLLER
//
app.controller('authController', function($scope, $http, $rootScope, $location) {
    $scope.login = function() {
        $http.post('/auth/login', $scope.user).success(function(data) {
            if (data.state == 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            }
        });
    };

    $scope.signup = function() {
        $http.post('/auth/signup', $scope.user).success(function(data) {
            if (data.state == 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            }
        });
    };

});
//
// ALL BOOKS CONTROLLER
//
app.controller('allBooksController', function($scope, bookService, $rootScope, $location) {
    bookService.list_all().success(function(books) {
        $scope.books = books;
    });
    $scope.request_book = function(book) {
        book.request.user= $rootScope.current_user;
        book.request.accepted= false;

        bookService.request(book).success(function(book) {
            toastr.success("You requested this book: " + book.name);
        });
        $location.path('/trade/');
    }
});
//
// MY BOOKS CONTROLLER
//
app.controller('myBooksController', function($scope, $location, bookService, $rootScope) {
    $scope.book = {
        name: '',
        url_img: '',
        created_by: '',
        request: {user: '', accepted: false}
    };

    bookService.list($rootScope.current_user).success(function(books) {
        $scope.books = books;
    });

    $scope.add_book = function() {
        bookService.create($scope.book).success(function(book) {
            $scope.books.push(book);
        });
    }

    $scope.delete_book = function(book) {
        toastr.warning(book.name + "was deleted!");
        bookService.delete(book._id).success(function(books) {
            $scope.books = books;
        });

    }
});
//
// PROFILE CONTROLLER
//
app.controller('profileController', function($scope, bookService, $location, $rootScope) {
    bookService.list_user($rootScope.current_user).success(function(user) {
        $scope.user = user;
    });

    $scope.update = function() {
        bookService.update_profile($scope.user);
        toastr.success('Your profile was updated');
        $location.path('/mybooks');
    }

});
//
// TRADE BOOK CONTROLLER
//
app.controller('tradeController', function($scope, bookService, $rootScope) {
    $scope.yours_request = [];
    $scope.others_request = [];
    get_requests();

    function get_requests() {
        bookService.requested_books($rootScope.current_user).success(function(books) {
            for (var i = 0; i < books.length; i++) {
                if (books[i].created_by !== $rootScope.current_user) {
                    $scope.yours_request.push(books[i]);
                } else if (books[i].created_by == $rootScope.current_user && books[i].request.user != '' ) {
                    $scope.others_request.push(books[i]);
                }
            }
        });
    }

    $scope.delete_trade = function(book) {
        book.request.user = '';

        bookService.request(book).success(function(book) {
            toastr.success("You deleted the request for this book: " + book.name);
            $scope.yours_request = [];
            $scope.others_request = [];
            get_requests();
        });
    }
    $scope.accept_trade = function(book) {
        book.request.accepted = true;
        bookService.request(book).success(function(book) {
            toastr.success("You accepted the request for this book: " + book.name);
            $scope.yours_request = [];
            $scope.others_request = [];
            get_requests();
        });
    }
});
//
// POLL SERVICE
//
app.factory('bookService', function($http, $rootScope) {
    return {
        create: function(book) {
            return $http.post('api/book/' + $rootScope.current_user, book);
        },
        delete: function(id) {
            $http.delete('api/book/' + id);
            return this.list($rootScope.current_user);
        },
        list: function(username) {
            return $http.get('api/book/' + username);
        },
        list_all: function() {
            return $http.get('api/books/');
        },
        request: function(book) {
            return $http.put('api/book/' + book._id, book);
        },
        list_user: function(username) {
            return $http.get('api/user/' + username);
        },
        update_profile: function(user) {
            return $http.put('api/user/' + user.username, user);
        },
        requested_books: function(user) {
            return $http.get('api/books/' + user);
        }
    };
});