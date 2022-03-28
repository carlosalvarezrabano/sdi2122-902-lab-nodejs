module.exports = function (app) {
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
        res.render("authors/authors.twig", response);
    });

    app.get('/authors/add', function(req, res) {
        let roles = [{
            value: "Cantante"
        }, {
            value: "Bateria"
        }, {
            value: "Guitarrista"
        }, {
            value: "Bajista"
        }, {
            value: "Teclista"
        }];

        let response = {
            roles : roles
        }
        res.render("authors/add.twig", response);
    });

    app.post('/authors/add', function(req, res) {
        if(req.body.name != null && typeof(req.body.name) != "undefined") {
            if(req.body.group != null && typeof(req.body.group) != "undefined") {
                if(req.body.rol != null && typeof(req.body.rol) != "undefined") {
                    let response = 'Autor agregado: ' + req.body.name + '<br>'
                        + 'Grupo: ' + req.body.group + '<br>'
                        + 'Rol: ' + req.body.rol;
                    res.send(response);
                } else
                    res.send("Rol no enviado en la petición");
            } else
                res.send("Grupo no enviado en la petición");
        } else
            res.send("Nombre no enviado en la petición");
    });

    app.get('/authors/*', function (req, res) {
        res.redirect("/authors");
    });
}