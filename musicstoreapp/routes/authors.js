module.exports = function (app, swig) {
    app.get("/authors", function(req, res) {
        let authors = [{
            "name": "Antonio",
            "group": "Los Ramones",
            "rol": "Bajista"
        },
            {
                "name": "Paco",
                "group": "Los Berrones",
                "rol": "Cantante"
            },
            {
                "name": "Manolo",
                "group": "Los Chichos",
                "rol": "Guitarrista"
            }];

        let response = {
            seller : 'Lista de autores',
            authors : authors
        };
        res.sender("authors.twig", response);
    });

    app.get('/authors/add', function(req, res) {
        res.render("authors/add.twig");
    });

    app.post('/authors/add', function(req, res) {
        if(req.query.name == null || typeof(req.query.name) == "undefined")
            res.send("Nombre no enviado en la petición");
        if(req.query.group == null || typeof(req.query.group) == "undefined")
            res.send("Grupo no enviado en la petición");
        if(req.query.rol == null || typeof(req.query.rol) == "undefined")
            res.send("Rol no enviado en la petición");
        else {
            let response = 'Autor agregado: ' + req.body.name + '<br>'
                + 'Grupo: ' + req.body.group
                + 'Rol: ' + req.body.rol;
            res.send(response);
        }
    });

    app.get('/authors/*', function (req, res) {
        res.redirect("/authors");
    });
}