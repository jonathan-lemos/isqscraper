# isqscraper
Scrapes professor ratings from the UNF Department Schedule. Uses React/Bootstrap for the frontend, Express for the web server, and MySQL for the database.

## Getting started

### Dependencies
Before attempting to use `isqscraper`, you will need the following dependencies:
* Node.js
* MySQL Server

### Building
Before anything else, make sure the MySQL server is running.
By default, `isqscraper` binds to a MySQL server on port 3306 with the login `root:toor`.
To configure this, edit `isqscraper/src/settings.ts`.

First, clone the repository:
```shell
git clone https://github.com/jonathan-lemos/isqscraper.git
cd isqscraper
```

Then download all dependencies:
```shell
npm install
```

Then build the project:
```shell
npx webpack-cli
```

Finally, run the server as follows:
```shell
npm start
```
You can then access the website by visiting `localhost:80`.

The current user must be able to bind to port 80.

### Tests
Unit tests can be run using:
```shell
npx jest
```

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for contributing guidelines.

## Licensing
This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt) for details.
