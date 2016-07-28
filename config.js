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
        maxMinionsInHost : 5,
        scheduleStrategy: "force"
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
        maxMinionsInHost : 5,
        scheduleStrategy: "force"
    },
};


module.exports = configs;