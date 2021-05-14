const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

const app = express ();

//view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'test'));
var session = driver.session();

app.get('/', function(req, res){
    session
        .run('MATCH(n:competicion) RETURN n LIMIT 25')
        .then(function(result){
            var movieArr = [];
            result.records.forEach(function(record){
                movieArr.push({
                    id: record._fields[0].identity.low,
                    nombre: record._fields[0].properties.nombre
                });
            });

            session
                .run('MATCH(n:equipo) RETURN n LIMIT 25')
                .then(function(result2){
                    var actorArr = [];
                    result2.records.forEach(function(record){
                        actorArr.push({
                            id: record._fields[0].identity.low,
                            nombre: record._fields[0].properties.nombre
                        });
                    });
                    res.render('index', {
                        movies: movieArr,
                        actors: actorArr
                    });
                })
                .catch(function(err){
                    console.log(err);
                });
        })
        .catch(function(err){
            console.log({err});
        });
});



//Para agregar un equipo
var session2 = driver.session();
app.post('/equipo/add',function(req, res){
    var nombreEquipo = req.body.nombre;

    session2
        .run('CREATE(n:equipo {nombre:{nombreEquipoParam}}) RETURN n.nombre', {nombreEquipoParam:nombreEquipo})
        .then(function(result){
            res.redirect('/');
            session2.close();
        })
        .catch(function(err){
            console.log(err);
        });

    res.redirect('/');
})


//Para agregar una competición
var session3 = driver.session();
app.post('/competicion/add',function(req, res){
    var nombreCompeticion = req.body.nombre;

    session3
        .run('CREATE(n:competicion {nombre:{nombreCompeticionParam}}) RETURN n.nombre', {nombreCompeticionParam:nombreCompeticion})
        .then(function(result){
            res.redirect('/');
            session3.close();
        })
        .catch(function(err){
            console.log(err);
        });

    res.redirect('/');
})

//Para relacionar los nodos
var session4 = driver.session();
app.post('/competicion/equipo/add',function(req, res){
    var nombreCompeticion = req.body.nombre;
    var nombreEquipo = req.body.nombre;

    session4
        .run('MATCH(a:equipo {nombre:{nombreEquipoParam}}), (b:competicion{nombre:{nombreCompeticionParam}}) MERGE (a)-[r:COMPITE]-(b) RETURN a,b', {nombreEquipoParam: nombreEquipo, nombreCompeticionParam :nombreCompeticion})
        .then(function(result){
            res.redirect('/');
            session4.close();
        })
        .catch(function(err){
            console.log(err);
        });

    res.redirect('/');
})


app.listen(3300);
console.log('Server on port 3300');

module.exports = app;
