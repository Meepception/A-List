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

    async getPassword(username){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('SELECT "passord" FROM "public"."brukere" WHERE "brukernavn" = $1;', [username]);
            results = results.rows[0].passord;
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async updatePassword(user, password){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('UPDATE "public"."brukere" SET "passord" = $1 WHERE "brukernavn" = $2;', [password, user]);
            results = results.rows[0];
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async deleteUser(username){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();

            let result1 = await client.query('DELETE FROM "public"."brukere" WHERE "brukernavn" = $1;', [username]);
            result1 = result1.rows;
            
            let result2 = await client.query('DELETE FROM "public"."lister" WHERE "brukernavn" = $1;', [username]);
            result2 = result2.rows;

            let result3 = await client.query('DELETE FROM "public"."listeitem" WHERE "brukernavn" = $1;', [username]);
            result3 = result3.rows;

            results = [result1, result2, result3];
            
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async insertUser(username, password) {
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('INSERT INTO "public"."brukere"("brukernavn", "passord") VALUES($1, $2) RETURNING *;', [username, password]);
            results = results.rows[0].message;
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async createList(listeNavn, username){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('INSERT INTO "public"."lister"("listenavn", "brukernavn") VALUES($1, $2) RETURNING *;', [listeNavn, username]);
            results = results.rows[0];
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async createItem(oppgave, listeNavn, username){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('INSERT INTO "public"."listeitem"("listeitem", "listenavn", "brukernavn") VALUES($1, $2, $3) RETURNING *;', [oppgave, listeNavn, username]);
            results = results.rows[0];
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async itemGet(listenavn, username){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('SELECT * FROM "public"."listeitem" WHERE listenavn = $1 AND brukernavn = $2;', [listenavn, username]);
            results = results.rows;
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async deleteItem(id){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('DELETE FROM "public"."listeitem" WHERE "listeitemID" = $1;', [id]);
            results = results.rows;
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async deleteList(listenavn){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();

            let result1 = await client.query('DELETE FROM "public"."lister" WHERE "listenavn" = $1;', [listenavn]);
            result1 = result1.rows;
            
            let result2 = await client.query('DELETE FROM "public"."listeitem" WHERE "listenavn" = $1;', [listenavn]);
            result2 = result2.rows;

            results = [result1, result2];
            
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async updateList(gammelt, nytt){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();

            let result1 = await client.query('UPDATE "public"."lister" SET "listenavn" = $1 WHERE "listenavn" = $2;', [nytt, gammelt]);
            result1 = result1.rows;
            
            let result2 = await client.query('UPDATE "public"."listeitem" SET "listenavn" = $1 WHERE "listenavn" = $2;', [nytt, gammelt]);
            result2 = result2.rows;

            results = [result1, result2];
            
            client.end();
        } catch (err) {
            client.end();
            console.log(err);
            results = err;
        }

        return results;
    }

    async updateItem(id, ny){
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('UPDATE "public"."listeitem" SET "listeitem" = $1 WHERE "listeitemID" = $2;', [ny, id]);
            results = results.rows;
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
    async todoGet(username) {
        const client = new pg.Client(this.credentials);
        let results = null;
        try {
            await client.connect();
            results = await client.query('SELECT * FROM "public".lister WHERE brukernavn = $1;', [username]);
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