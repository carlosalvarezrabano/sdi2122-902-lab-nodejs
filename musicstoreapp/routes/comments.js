const {ObjectID} = require("mongodb");
module.exports = function(app, commentsRepository) {
    app.post('/comments/:song_id', function(req, res) {
        if(req.session.user == null) {
            res.send("Tienes que estar autenticado para realizar un comentario");
        }
        else {
            let comment = {
                author: req.session.user,
                text: req.body.text,
                song_id: ObjectID(req.params.song_id)
            }
            commentsRepository.insertComment(comment, function (commentId) {
                if (commentId == null) {
                    res.send("Error al insertar comentario");
                } else {
                    res.send("Agregado el comentario ID: " + commentId);
                }
            });
        }
    });
};