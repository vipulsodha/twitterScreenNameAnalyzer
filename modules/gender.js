var extend = require('extend-object'),
    common = require('./common.json'),
    fs = require('fs');

module.exports = function(data, callback) {

    var match = [],
        nonMatch = [],
        words;

    words = Object.keys(data);

    words.forEach(function(word) {
        if (common.hasOwnProperty(word)) {
            match.push(word);
        } else {
            nonMatch.push({
                word: word,
                count: data[word]
            });
        }
    });
// console.log(nonMatch);
    var score = match.reduce(function(p, word) {
 	// console.log(word + " " + common[word] + " " + data[word]);
        return p + data[word] * common[word];
    }, 0);
 
    // console.log("Score :" + score);
    
process.nextTick(function () {
        callback(score);
    });
    if (nonMatch.length > 0) {
        pushToCommon(nonMatch, score);
    }
};


function pushToCommon(data, score) {
var newWords = {};
    if (score > 9) {
   data.forEach(function(word){
   		newWords[word.word] = 1;
    });


    } else if (score < -9) {

    	   data.forEach(function(word){
   		newWords[word.word] = -1;
    });


    }

    //  common = JSON.stringify(extend(common, newWords));
    // fs.writeFile('common.json', common, function(e){
    // 	if(e){console.log(e);}
    // })
 // console.log(common);
}
