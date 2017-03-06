var express = require('express'),
    bodyParser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectId,
    fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(multiparty());

var port = 3000;

//teste

app.listen(port);


var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);


console.log('Servidor http esta escutando na porta ' + port);

app.get('/', function(req,  res){
    res.send({msg: 'teste'});
});

 

app.post('/api', function(req, res){
    
    res.setHeader("Access-Control-Allow-Origin", "*");

    var date = new Date();
    time_stamp = date.getTime();

    console.log(req.files.arquivo.originalFilename);

    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;

    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + req.files.arquivo.originalFilename;

    

    fs.rename(path_origem, path_destino, function(err){
        if(err){
            res.status(500).json({error: err});
            return;
        }

        var dados = {
            url_imagem: url_imagem,
            titulo: req.body.titulo
        }
        

        db.open( function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.insert(dados, function(err, records){
                if(err){
                    res.json(err);
                }else{
                    res.json(records);
                }
                mongoclient.close();
            });
        })
    });
    
    res.send(dados);
    });

    console.log(req.files);
    
    
});

app.get('/api', function(req, res){
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    db.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.find().toArray(function(err, results){
                if(err){
                    res.json(err);
                }else{
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});


app.get('/api/:id', function(req, res){
    db.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.find(objectId(req.params.id)).toArray(function(err, results){
                if(err){
                    res.json(err);
                }else{
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});



app.get('/uploads/:imagem', function(req, res){
    var img = req.params.imagem;
    fs.readFile('./uploads/' + img, function(err, content){
        if(err){
            res.status(400).json(err);
            return;
        }
        res.writeHead(200, {'' : '', '' : '', '' : '', '' : ''})
        res.end(content);
    });
})



app.put('/api/:id', function(req, res){
    db.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.update(
                {_id: objectId(req.params.id)},
                { $set: {titulo: req.body.titulo}},
                {},
                function(err, records){
                    if(err){
                        res.json(err);
                    }else{
                        res.json(records);
                    }
                    mongoclient.close();
                }
            );
        });
    });
});


app.delete('/api/:id', function(req, res){
    db.open(function(err, mongoclient){
        mongoclient.collection('postagens', function(err, collection){
            collection.remove(
                {_id: objectId(req.params.id)}, 
                    function(err, records){
                        if(err){
                            res.json(err);
                        }else{
                            res.json(records);
                        }
                        mongoclient.close();
            });
        });
    });
});


