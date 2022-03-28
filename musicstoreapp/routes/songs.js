const {ObjectID} = require("mongodb");
module.exports = function(app, songsRepository) {
    app.get("/shop", function(req, res) {
        let filter = {};
        let options = {sort: { title: 1}};
        if(req.query.search != null && typeof(req.query.search) != "undefined" && req.query.search != ""){
            filter = {"title": {$regex: ".*" + req.query.search + ".*"}};
        }
        songsRepository.getSongs(filter, options).then(songs => {
            res.render("shop.twig", {songs: songs})
        }).catch(error => {
           res.send("Se ha producido un error al listar las canciones: " + error);
        });
    });

    app.get('/songs/add', function(req, res) {
        if ( req.session.user == null){
            res.redirect("/shop");
            return;
        }
        res.render("songs/add.twig");
    });

    app.post('/songs/add', function(req, res) {
        if ( req.session.user == null){
            res.redirect("/shop");
            return;
        }
        let song = {
            title: req.body.title,
            kind: req.body.kind,
            price: req.body.price,
            author: req.session.user
        }
        songsRepository.insertSong(song, function (songId) {
            if (songId == null) {
                res.send("Error al insertar canción");
            }
            else {
                if (req.files != null) {
                    let imagen = req.files.cover;
                    imagen.mv(app.get("uploadPath") + '/public/covers/' + songId + '.png', function (err) {
                        if (err) {
                            res.send("Error al subir la portada de la canción");
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv(app.get("uploadPath") + '/public/audios/' + songId + '.mp3', function (err) {
                                    if (err) {
                                        res.send("Error al subir el audio");
                                    } else {
                                        res.send("Agregada la canción ID: " + songId);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.send("Agregada la canción ID: " + songId);
                }
            }
        });
    });

    app.get('/songs/:id', function(req, res) {
        let filter = {_id: ObjectID(req.params.id)};
        let options = {};
        songsRepository.findSong(filter, options).then(song => {
            res.render("songs/song.twig", {song: song});
        }).catch(error => {
            res.send("Se ha producido un error al buscar la canción " + error)
        });
    });

    app.get('/songs/:kind/:id', function(req, res) {
        let response = 'id: ' + req.params.id + '<br>'
            + 'Tipo de música: ' + req.params.kind;
        res.send(response);
    });
};