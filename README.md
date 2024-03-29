#postgres-contentful

## Description

A CLI app to insert/update content from a postgresSQL database.table to Contentful.com content type.

**Note:** Tested on Mac OS X (Sierra 10.12), with node 6.7 and npm 3.10.3

**Note:** The cli tool uses `pg-json-schema-export` package. The package has a bug in which if there are capital letters in table name it might throw an error. As of now I have submitted a pull request resolving this error and used my own git url as dependency in package.json. But when gets resolved, it is advisable to switch package.json back to pg-json-schema-export. There may occur some issues like this, I have tried to resolve what I have came across. 

## Usage

In development use:

```
$ node ./bin/postgres-contentful --help
```

To make the command available to use directly use `npm link` and then the command will be accessible like:

```
$ postgres-contentful --help
```

## Seed data for testing

Seed folder has been initialized with sequelize and provides migration folder, config folder and seeders to seed database before you begin to test.

In config folder replace the environment you will be using (by default `development` is used) with your database config. Make sure you already don't have `content_section` table in your db and you have an existent db with the name mentioned in config file.

Use `npm run sequelize db:migrate` to run migration and create a table `content_section` in database.

Use `npm run sequelize db:seed` to fill database with seed values (make sure it doesn't have values that will conflict with seed values, use `npm run sequelize db:seed:undo` to truncate the content_section table.

Use `npm run sequelize db:migrate:undo` to drop table `content_section` or to do down migration.

Use `--` and then pass any parameters to these commands like `npm run sequelize db:migrate -- --env production`.

## Publish

If you’ve never published a package to npm before, you can read the [docs](https://docs.npmjs.com/getting-started/publishing-npm-packages) to get started with it.

Because this is a scoped package, if you want to publish it publicly, you’ll have to use the access option. You can read more in the [scoped packages docs](https://docs.npmjs.com/getting-started/scoped-packages).

```
$ npm publish --access=public
```

If you’re going to publish this as a [private package](https://www.npmjs.com/features), and you you’re already a paid member, then you can just run `npm publish`.

After publishing one can simply do:

```
$ npm install -g postgres-contentful
```

to get the command (and including sub commands) in global scope.

## Linting

```
# for testing lints
$ npm run lint

# for fixing lint issues
$ npm run lint:fix
```

## Features

1. Include default values like postgres connection url and contentful access_token from config file

    ```
    $ postgres-contentful config [key] [value]
    ```

2. Updates/Inserts records from postgres to contentful. Stores contentful version of entry in db for the same. Create a column `contentfulVersion` in database which should be an integer and can be null.
   
3. Connects records in postgres to entries in contentful with an id (field `externalId` by default). All entries are updated/inserted using this id. So it is necessary for this column to be present in the database.\
   It should have a unique constraint to avoid conflict. One can even configure a column name except `externalId` (but it should have unique constraint - check for this has not been implemented so it should be done on users part) by using
   
    ```
    $ postgres-contentful data:sync <file> --connecting-key <column_name>
    ```
    
4. Fetches information via APIs (like spaces and content types) or other schemas (like table columns) thus reducing the number of times one has to type. Simply use the prompts (list, yes/no, input etc.) for reducing time consuming tasks.

5. Support of environment variable to skip the prompts bringing more ease while creating mapping file
    * **PG_CONNECTION_URI** - postgres connection url
    * **CONTENTFUL_ACCESS_TOKEN** - contentful authorization token (Management API). Follow this [link](https://www.contentful.com/developers/docs/references/authentication/) for more details about Management API access_token.
    * **CONTENTFUL_SPACE_ID** - id of a contentful space. If you are working more on one particular space this becomes a lot helpful.
    
6. Proper division of command and code. For creating mapping file use:
   
    ```
    $ postgres-contentful map:create
    ```
   
    For syncing data use:
   
    ```
    $ postgres-contentful data:sync <mapping_file>
    ```
   
7. Log the response of syncing with a log file:
   
    ```
    $ postgres-contentful data:sync <mapping_file> --log <log_file>
    ```
   
8. Validates mapping file before performing sync, in case you make some mistake.
   **Note:** Validation schema has been built on understanding of working dataset and outputs and might fail in unseen circumstances because of which program might fail to run. If such case occurs, best thing would be to try `--no-validate` option in `data:sync` command to avoid validation of schema and proceed further. If errors still persist, then the application will need debugging via error messages given out by the command.

9. Control the output file via `-o, --output <file>` option and `-s, --spaces <spaces>` (number of spaces in json file) in `map:create` command.

10. If postgres schema is not public one can use `--schema <schema_name>` to fetch structure from that schema in `map:create`.

11. Asks where in data:sync command with default value `1=1` (not shown in video as first it was command line argument but removed because of quote issues) to limit the number of rows to be synced with contentful. Make sure you use column names within double quotes and values in single quotes or else postgres might not be able to identify some column names (like the ones with capital letters).

12. In generated mapping file, already fills the mappings key with content fields of Contentful ContentType with null values for further easing the process.

13. Limits 10 requests per second to avoid reaching API limit ([read more](https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/api-rate-limits)).

14. Displays progress bar to track how much data is yet to be pushed in to Contentful.

15. Command to just validate the mappings file by using `postgres-contentful map:validate <file>`.

## License

Copyright (c) 2016 Anurag Agarwal

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

## Acknowledgments

Built using [generator-commader](https://github.com/Hypercubed/generator-commander).
