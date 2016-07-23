var configs = {
    development:{
        db:{
            connectionLimit : 100,
            host     : 'localhost',
            user     : 'root',
            password : 'rats',
            database : 'coredb',
            debug    :  false
        },
        leaderMinionPort: 8001,
        maxMinionsInHost : 5
    }, production:{
        db:{
            connectionLimit : 100,
            host     : 'localhost',
            user     : 'root',
            password : 'rats',
            database : 'coredb',
            debug    :  false
        },
        leaderMinionPort: 8001,
        maxMinionsInHost : 5
    },
};


module.exports = configs;