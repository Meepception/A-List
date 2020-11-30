const pg = require("pg");
const dbCredentials = process.env.DATABASE_URL || require("../localenv").credentials;

class StorageHandler {

    constructor(credentials) {
        this.credentials = {
            connectionString: credentials,
            ssl: {
                rejectUnauthorized: false
            }
        };
    }

    async insertUser(username, password) {
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('INSERT INTO "public"."users"("username", "password") VALUES($1, $2) RETURNING *;', [username, password]);
            results = results.rows[0].message;
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
    async insert(...params) {
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('INSERT INTO "public"."$1"("username", "password") VALUES($2, $3) RETURNING *;', params);
            results = results.rows[0].message;
            client.end();
        } catch (err) {
            client.end();
            results = err;
        }

        return results;
    }
    async todo(params) {
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('INSERT INTO "public"."list"("todo") VALUES($1) RETURNING *;', [params]);
            results = results.rows[0].message;
            client.end();
        } catch (err) {
            client.end();
            results = err;
        }

        return results;
    }
    async todoGet() {
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('SELECT * FROM "public".list');
            client.end();
        } catch (err) {
            client.end();
            results = err;
        }
        if (results.rows.length != 0){
            return results.rows;
        } else {
            return null; 
        }
        
    }
    async purge() {
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('DELETE FROM "public"."list"');
            client.end();
        } catch (err) {
            client.end();
            results = err;
        }    
    }

}

module.exports = new StorageHandler(dbCredentials);