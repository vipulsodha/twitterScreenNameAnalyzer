"use strict";
var Twit = require('twit'),
    sentiAnalyze = require('./modules/sentiment.js'),
    gender = require('./modules/gender.js'),
    consumerKey = "<key>",
    consumerSecret = "<secret>",
    myoauthAccessToken = "<token>",
    myoauthAccessTokenSecret = "<token_secret>",
    T = new Twit({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        access_token: myoauthAccessToken,
        access_token_secret: myoauthAccessTokenSecret
    }),
    express = require('express'),
    fs = require('fs'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = {};
server.listen(9001, function(){
    console.log("listening Port 9001");
});

//Maping Sentiments
function MapTweetSentiments(data, callback) {
    var sentimentMap = data.map(function(tweet) {
        return {
            text: tweet.text,
            sentiment: sentiAnalyze(tweet.text).score
        };
    });
    sentimentMap.sort(function(a, b) {
        return a.sentiment - b.sentiment;
    });
    callback(sentimentMap);
}

//Maping Word Frequency
function WordMap(data, callback) {
    var dulpicate = {},
        words = [],
        filteredTweets,
        filteredWords,
        wordFreqMap = {},
        tweetString,
        filterW,
        hashFreqMap = {},
        hashes = [];

    //Finding Duplicates if any
    filteredTweets = data.filter(function(tweet) {
        return dulpicate[tweet.id_str] ? false : dulpicate[tweet.id_str] = true;
    });

    //Coverting to Single String
    tweetString = filteredTweets.reduce(function(previous, nTweet) {
        return previous + nTweet.text + ' ';
    }, '');

    //Seperating strings to words
    words = words.concat(tweetString.toLowerCase().match(/[\w]+/g));

    //seperating #hash 
    hashes = hashes.concat(tweetString.toLowerCase().match(/#[\w]+/g));

    //Removing prepositions etc
    filteredWords = words.filter(function(word) {
        filterW = true;
        excludes.forEach(function(exclude) { //can use every instead of forEach
            if (word === exclude) {
                filterW = false;
            }
        });
        if (filterW) {
            //Mapping Word Frequency       
            if (word in wordFreqMap) {
                wordFreqMap[word] = wordFreqMap[word] + 1;
            } else {
                wordFreqMap[word] = 1;
            }

        }
        return filterW;
    });


    hashes.forEach(function(hash) {
        if (hash in hashFreqMap) {
            hashFreqMap[hash] = hashFreqMap[hash] + 1;
        } else {
            hashFreqMap[hash] = 1;
        }
    });

    callback({
        wordFreqMap: wordFreqMap,
        hashFreqMap: hashFreqMap
    });
}


//Analyze Time Map
function AnalyzeTime(data, callback) {
    var hour, minute, timeMap = {};
    console.log("Time");
    data.forEach(function(tweet) {

        hour = parseDate(tweet.created_at).getHours();
        // console.log(hour);
        if (hour in timeMap) {
            timeMap[hour]++;
        } else {
            timeMap[hour] = 1;
        }
    });
    // console.log(timeMap);
    callback(timeMap);
}

function parseDate(created_at) {
    return new Date(Date.parse(created_at));
}

function getRecentTweets(id, screen_name) {

    T.get('statuses/user_timeline', {
        screen_name: screen_name,
        include_rts: false
    }, function(e, data) {
        var sentimentMap;
        if (e) {
            console.log(e);
        } else {
            // console.log("Got Tweets");
            MapTweetSentiments(data, function(data) {
                // sentimentMap = data;
                users[id].socket.emit('sentiment_map', {
                    sentimentMap: data
                });
                
            });

            WordMap(data, function(data) {
                // var keysSorted = Object.keys(data.wordFreqMap).sort(function(a, b) {
                //     return data.wordFreqMap[a] - data.wordFreqMap[b];
                // });

                users[id].socket.emit('word_map', {
                    wordMap: data
                });

                gender(data.wordFreqMap, function(data) {

                    users[id].socket.emit('gender_map', {
                        score: data
                    });

                });
            });

            AnalyzeTime(data, function(data) {
                // console.log(data);
            });
        }
    });


}


io.sockets.on('connection', function(socket) {
    users[socket.id] = {socket:socket};

    socket.on('screen_name', function(data) {
        console.log(data);

        getRecentTweets(this.id, data.screen_name);


    });




});




app.get('/', function(req, res) {
console.log("Got request");
    // console.log(req.session);
    fs.readFile('./index.html', 'utf8', function(e, data) {
        if (e) {
            console.log(e);
        } else {
            res.send(data);
        }
    });

    // res.sendFile('./trends.html');
});



//Get Recent Tweets



var excludes = [
    "aug",
    "mar",
    "feb",
    "apr",
    "jan",
    "jun",
    "sep",
    "jul",
    "dec",
    "oct",
    "nov",
    "com",
    "the",
    "of",
    "and",
    "a",
    "to",
    "in",
    "is",
    "you",
    "that",
    "it",
    "he",
    "was",
    "for",
    "on",
    "are",
    "as",
    "with",
    "his",
    "they",
    "I",
    "at",
    "be",
    "this",
    "have",
    "from",
    "or",
    "one",
    "had",
    "by",
    "word",
    "but",
    "not",
    "what",
    "all",
    "were",
    "we",
    "when",
    "your",
    "can",
    "said",
    "there",
    "use",
    "us",
    "themselves",
    "inside",
    "an",
    "each",
    "which",
    "she",
    "do",
    "how",
    "their",
    "if",
    "will",
    "up",
    "other",
    "about",
    "out",
    "many",
    "then",
    "them",
    "these",
    "so",
    "some",
    "her",
    "would",
    "make",
    "like",
    "him",
    "into",
    "time",
    "has",
    "look",
    "two",
    "more",
    "write",
    "go",
    "see",
    "number",
    "no",
    "way",
    "could",
    "people",
    "my",
    "than",
    "first",
    "water",
    "been",
    "call",
    "who",
    "oil",
    "its",
    "now",
    "find",
    "long",
    "down",
    "day",
    "did",
    "get",
    "come",
    "made",
    "may",
    "part",
    "rt",
    "etc"
];
