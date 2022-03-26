module.exports = function(app) {
    app.get("/songs", function(req, res) {
        let response="";
        if(req.query.title != null && typeof(req.query.title) != "undefined")
            response='Título: ' + req.query.title + '<br>';
        if(req.query.author != null && typeof(req.query.author) != "undefined")
            response='Título: ' + req.query.title + '<br>';
        res.send(response);
    });

    app.get('/songs/add', function(req, res) {
        let response = "Canción agregada: " + req.body.title + "<br>"
            + " género: " + req.body.kind + "<br>"
            + " precio: " + req.body.price + "<br>";
        res.send(response);
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