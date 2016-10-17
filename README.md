#postgres-contentful

## Description

A CLI app to insert/update content from a postgresSQL database.table to Contentful.com content type.

## Usage

In development use:

```
$ node ./bin/postgres-contentful --help
```

To make the command available to use directly use `npm link` and then the command will be accessible like:

```
$ postgres-contentful --help
```

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
   
3. Connects records in postgres to entries in contentful with an id (field `externalid` by default). All entries are updated/inserted using this id. So it is necessary for this column to be present in the database.\
   It should have a unique constraint to avoid conflict. One can even configure a column name except `externalid` (but it should have unique constraint - check for this has not been implemented so it should be done on users part) by using
   
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

11. Use `--where <where_clause>` (where caluse within quotes) to limit the number of rows to be synced with contentful in `data:sync` command.

12. In generated mapping file, already fills the mappings key with content fields of Contentful ContentType with null values for further easing the process.

13. Limits 10 requests per second to avoid reaching API limit ([read more](https://www.contentful.com/developers/docs/references/content-management-api/#/introduction/api-rate-limits)).

14. Displays progress bar to track how much data is yet to be pushed in to Contentful.

## License

Copyright (c) 2016 Anurag Agarwal

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

## Acknowledgments

Built using [generator-commader](https://github.com/Hypercubed/generator-commander).
