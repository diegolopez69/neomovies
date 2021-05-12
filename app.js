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
                console.log(record._fields[0].properties);
            });
            res.render('index', {
                movies: movieArr
            });
        })
        .catch(function(err){
            console.log({err});
        });
});

app.listen(3000);
console.log('Server on port 3000');

module.exports = app;
