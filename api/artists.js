const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const artistRouter = express.Router();

artistRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1',
    (err, artists) => {
        if(err){
            next(err);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});

artistRouter.param('artistId', (req, res, next, artistId) => {
    const sql = `SELECT * FROM Artist WHERE Artist.id = $artistId`;
    const values = {$artistId: artistId};

    db.get(sql, values, (error, artist) => {
        if(error){
            next(error);
        } else if (artist){
            req.artist = artist;
            next();
        } else {
            res.status(404).send('not a valid artist');
        }
    })
});

artistRouter.get('/:artistId', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

artistRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;

    if(!name || !dateOfBirth || !biography){
        return res.status(400).send();
    }

    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    const sql = 'INSERT INTO Artist ' +
    '(name, date_of_birth, biography, is_currently_employed) ' +
    'VALUES ($name, $dateOfBirth, $biography, $isCurrentylyEmployed)';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentylyEmployed: isCurrentlyEmployed,
    };
    db.run(sql, values, function(error){
        if(error){
            next(error);
        }
        db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (error, artist) => {
            if(error){
                next(error);
            } else {
            res.status(201).json({artist: artist});
            }
        });

    })
});

artistRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;

    if(!name || !dateOfBirth || !biography){
        return res.status(400).send();
    };

    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    const sql = 'UPDATE Artist SET name = $name, ' +
        'date_of_birth = $dateOfBirth, ' +
        'biography = $biography, ' +
        'is_currently_employed = $isCurrentlyEmployed ' +
        'WHERE Artist.id = $artistId';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $artistId: req.params.artistId,
    };

    db.run(sql, values, (error) => {
        if(error){
            next(error);
        } 

        db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (error, artist) => {
                if(error){
                    next(error);
                }
                res.status(200).json({artist: artist});
            
        })
    });

artistRouter.delete('/:artistId', (req, res, next) => {
    const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId';
    const values = {
        $artistId: req.params.artistId
    }
    db.run(sql, values, (error) => {
        if(error){
            next(error);
        }
        db.get(`SELECT * FROM Artist WHERE Artist.id = ${values.$artistId}`, (error, artist) => {
            if(error){
                next(error);
            }
            res.status(200).json({artist: artist})
        })
    })
});

})


module.exports = artistRouter;