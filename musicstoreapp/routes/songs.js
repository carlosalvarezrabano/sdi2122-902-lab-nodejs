const {ObjectID} = require("mongodb");
module.exports = function(app, songsRepository, commentsRepository) {
    app.get("/shop", function(req, res) {
        let filter = {};
        let options = {sort: { title: 1}};
        if(req.query.search != null && typeof(req.query.search) != "undefined" && req.query.search != ""){
            filter = {"title": {$regex: ".*" + req.query.search + ".*"}};
        }
        let page = parseInt(req.query.page); // Es String !!!
        if (typeof req.query.page === "undefined" || req.query.page === null || req.query.page === "0") {
            //Puede no venir el param
            page = 1;
        }
        songsRepository.getSongsPg(filter, options, page).then(result => {
            let lastPage = result.total / 4;
            if (result.total % 4 > 0) { // Sobran decimales
                lastPage = lastPage + 1;
            }
            let pages = []; // paginas mostrar
            for (let i = page - 2; i <= page + 2; i++) {
                if (i > 0 && i <= lastPage) {
                    pages.push(i);
                }
            }
            let response = {
                songs: result.songs,
                pages: pages,
                currentPage: page
            }
            res.render("shop.twig", response);
        }).catch(error => {
           res.redirect("/shop"+"?message=Se ha producido un error al listar las canciones" +
               "&messageType=alert-danger");
        });
    });

    app.get('/publications', function (req, res) {
        let filter = {author : req.session.user};
        let options = {sort: {title: 1}};
        songsRepository.getSongs(filter, options).then(songs => {
            res.render("publications.twig", {songs: songs});
        }).catch(error => {
            res.redirect("/publications"+"?message=Se ha producido un error al listar las publicaciones" +
                "&messageType=alert-danger");
        });
    });

    app.get('/songs/add', function(req, res) {
        res.render("songs/add.twig");
    });

    app.post('/songs/add', function(req, res) {
        let song = {
            title: req.body.title,
            kind: req.body.kind,
            price: req.body.price,
            author: req.session.user
        }
        songsRepository.insertSong(song, function (songId) {
            if (songId == null) {
                res.redirect("/songs/add"+"?message=Se ha producido un error al añadir una canción" +
                    "&messageType=alert-danger");
            }
            else {
                if (req.files != null) {
                    let imagen = req.files.cover;
                    imagen.mv(app.get("uploadPath") + '/public/covers/' + songId + '.png', function (err) {
                        if (err) {
                            res.redirect("/songs/add"+"?message=Error al subir la portada de la canción" +
                                "&messageType=alert-danger");
                        } else {
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv(app.get("uploadPath") + '/public/audios/' + songId + '.mp3', function (err) {
                                    if (err) {
                                        res.redirect("/songs/add"+"?message=Error al subir el audio" +
                                            "&messageType=alert-danger");
                                    } else {
                                        res.redirect("/publications");
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.redirect("/publications");
                }
            }
        });
    });

    app.get('/songs/:id', function(req, res) {
        let filter = {_id: ObjectID(req.params.id)};
        let filterComments = {song_id: ObjectID(req.params.id)};
        let filterPurchase = {songId: ObjectID(req.params.id)};
        let options = {};
        songsRepository.findSong(filter, options).then(song => {
            commentsRepository.getComments(filterComments, options).then(comments => {
                songsRepository.findPurchase(filterPurchase, options). then(isComprada => {
                    if(song.author == req.session.user)
                        isComprada = true;
                    res.render("songs/song.twig", {song: song, comments : comments, comprada: isComprada});
                }).catch(error => {
                    res.redirect("/songs/:id"+"?message=Se ha producido un error al buscar la canción" +
                        "&messageType=alert-danger");
                })
            }).catch(error => {
                res.redirect("/songs/:id"+"?message=Se ha producido un error al buscar la canción" +
                    "&messageType=alert-danger");
            })
        }).catch(error => {
            res.redirect("/songs/:id"+"?message=Se ha producido un error al buscar la canción" +
                "&messageType=alert-danger");
        });
    });

    app.get('/songs/edit/:id', function(req, res) {
        let filter = {_id: ObjectID(req.params.id)};
        songsRepository.findSong(filter, {}).then(song => {
            res.render("songs/edit.twig", {song: song});
        }).catch(error => {
            res.redirect("/songs/edit/:id"+"?message=Se ha producido un error al buscar la canción" +
                "&messageType=alert-danger");
        })
    });

    app.post('/songs/edit/:id', function (req, res) {
        let song = {
            title: req.body.title,
            kind: req.body.kind,
            price: req.body.price,
            author: req.session.user
        }
        let songId = req.params.id;
        let filter = {_id: ObjectId(songId)};
        //que no se cree un documento nuevo, si no existe
        const options = {upsert: false}
        songsRepository.updateSong(song, filter, options).then(result => {
            step1UpdateCover(req.files, songId, function (result) {
                if (result == null) {
                    res.redirect("/songs/edit/:id"+"?message=Error al actualizar la portada o el audio de la canción" +
                        "&messageType=alert-danger");
                } else {
                    res.redirect("/publications");
                }
            });
        });
    });

    app.get('/songs/delete/:id', function (req, res) {
        let filter = {_id: ObjectID(req.params.id)};
        songsRepository.deleteSong(filter, {}).then(result => {
            if (result == null || result.deletedCount == 0) {
                res.redirect("/songs/delete/:id"+"?message=No se ha podido eliminar el registro" +
                    "&messageType=alert-danger");
            } else {
                res.redirect("/publications");
            }
        }).catch(error => {
            res.redirect("/songs/delete/:id"+"?message=Se ha producido un error al intentar eliminar la canción" +
                "&messageType=alert-danger");
        });
    });

    app.get('/songs/buy/:id', function (req, res) {
        let songId = ObjectID(req.params.id);
        let shop = {
            user: req.session.user,
            songId: songId
        }
        let cancion, compra = null;
        songsRepository.findSong({_id: songId}, {}).then(song => {
           cancion = song;
        });
        songsRepository.findPurchase({songId: songId}, {}).then(isComprada => {
           compra = isComprada;
        });
        songsRepository.buySong(shop, function (shopId) {
            if (shopId == null || cancion != null || compra == true) {
                res.redirect("/songs/buy/:id"+"?message=Error al realizar la compra" +
                    "&messageType=alert-danger");
            } else {
                res.redirect("/purchases");
            }
        })
    });

    app.get('/purchases', function (req, res) {
        let filter = {user: req.session.user};
        let options = {projection: {_id: 0, songId: 1}};
        songsRepository.getPurchases(filter, options).then(purchasedIds => {
            let purchasedSongs = [];
            for (let i = 0; i < purchasedIds.length; i++) {
                purchasedSongs.push(purchasedIds[i].songId)
            }
            let filter = {"_id": {$in: purchasedSongs}};
            let options = {sort: {title: 1}};
            songsRepository.getSongs(filter, options).then(songs => {
                res.render("purchase.twig", {songs: songs});
            }).catch(error => {
                res.redirect("/purchases"+"?message=Se ha producido un error al listar las publicaciones del usuario" +
                    "&messageType=alert-danger");
            });
        }).catch(error => {
            res.redirect("/purchases"+"?message=Se ha producido un error al listar las publicaciones del usuario" +
                "&messageType=alert-danger");
        });
    });

    //funciones auxiliares
    function step1UpdateCover(files, songId, callback) {
        if (files && files.cover != null) {
            let image = files.cover;
            image.mv(app.get("uploadPath") + '/public/covers/' + songId + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    step2UpdateAudio(files, songId, callback); // SIGUIENTE
                }
            });
        } else {
            step2UpdateAudio(files, songId, callback); // SIGUIENTE
        }
    };
    function step2UpdateAudio(files, songId, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv(app.get("uploadPath") + '/public/audios/' + songId + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };
    function isComprada(filter, callback) {
        let filterCancion = {songId: filter};
        songsRepository.getPurchases(filterCancion, {}).then(purchase => {
            if(purchase == null)
                callback(false);
            else
                callback(true);
        });
    };
};