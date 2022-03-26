module.exports = function(app, swig) {
    app.get("/songs", function(req, res) {
        let songs = [{
            "title": "Blank Space",
            "price": 1.2
        },
        {
            "title": "See You Again",
            "price": 1.3
        },
        {
            "title": "Uptown Funk",
            "price": 1.1
        }];

        let response = {
            seller : 'Tienda de canciones',
            songs : songs
        };
        res.sender("shop.twig", response);
    });

    app.get('/songs/add', function(req, res) {
        res.render("add.twig");
    });

    app.get('/songs/:id', function(req, res) {
        let response = 'id: ' + req.params.id;
        res.send(response);
    });

    app.get('/songs/:kind/:id', function(req, res) {
        let response = 'id: ' + req.params.id + '<br>'
            + 'Tipo de música: ' + req.params.kind;
        res.send(response);
    });
};