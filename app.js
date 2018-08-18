var restify = require('restify');
var builder = require('botbuilder');
var https = require('https');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('Bot listening to %s', server.url); 
});

var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

var recognizer = new builder.LuisRecognizer(process.env.LuisUrl);
bot.recognizer(recognizer);

bot.dialog('None', function (session) {
    session.send('Desculpe, eu não entendi o que quer dizer... :-(');
    session.endDialog();
}).triggerAction({
    matches: 'None'
});

bot.dialog('BuscaPersonagem', function (session, args) {
    var entidades = args.intent.entities;

    if (entidades.length == 0) {
        session.send('Se você disse um personagem, acredito que não conheça este.. Ainda...');
    } else {
        session.send('Estou me conectando com a Força...');
        session.send('Meditando...');

        https.get('https://swapi.co/api/people/?search=' + entidades[0].resolution.values[0], function (swapiRes) {
            swapiRes.setEncoding('utf8');
            var swChar = '';

            swapiRes.on('data', data => {
                swChar += data;
            });

            swapiRes.on('end', () => {
                swChar = JSON.parse(swChar).results[0];

                var nome = swChar.name;
                var altura = (swChar.height != 'unknown') ? swChar.height / 100 : null;
                var peso = (swChar.mass != 'unknown') ? swChar.mass : null;
                var nascimento = (swChar.birth_year != 'unknown') ? swChar.birth_year : null;
                var numFilmes = swChar.films.length;

                var funs = [
                    'Se não me falha a memória (ram),',
                    'Se não me engano,',
                    'O que lembro:',
                    'Parece que'
                ];

                session.send(['Ah sim! **', nome, '**!'].join(' '));
                if (nascimento != null) {
                    session.send(['Nascido no ano de **', nascimento, '**'].join(' '));
                }
                if (nascimento != null) {
                    session.send([funs[Math.floor(Math.random() * funs.length)], 'tem **', altura, '** metros de altura'].join(' '));
                }
                if (nascimento != null) {
                    session.send([funs[Math.floor(Math.random() * funs.length)], 'pesa **', peso, '** Kg'].join(' '));
                }

                var filmes = '** filmes!';
                if (numFilmes == 1) {
                    filmes = '** filme apenas!';
                }

                session.send([funs[Math.floor(Math.random() * funs.length)], 'participou de **', numFilmes, filmes].join(' '));
                session.send('Espero ter ajudado! :-)');
                session.endDialog();

            });
        });

    }

    session.endDialog();
}).triggerAction({
    matches: 'BuscaPersonagem'
});

bot.dialog('SaberMais', function (session) {
    session.send('É só me falar o nome de um personagem do mundo de Star Wars que te trago diversas informações sobre ele!');
    session.endDialog();
}).triggerAction({
    matches: 'SaberMais'
});

bot.dialog('Saudacao', function (session) {
    var msgs = [
        'Olá padawan!',
        'E aí padawan!',
        'Oi padawan!'
    ];

    var msg = msgs[Math.floor(Math.random() * msgs.length)];

    session.send(msg);
    session.send('Eu sou o Master Jedi Bot e estou aqui para te ajudar a conhecer um pouco mais sobre os personagens dos filmes de Star Wars!');
    session.endDialog();
}).triggerAction({
    matches: 'Saudacao'
});
