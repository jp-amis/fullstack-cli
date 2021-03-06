const { mkdirSync } = require('fs');
const inquirer = require('inquirer');
const { execSync } = require('child_process');

const { log } = require('../tools/message.tools');

const { createElement } = require('../tools/core.tools');

// These are the forms for each project type.

const front = require('../forms/front.form');
const back = require('../forms/back.form');
const graphiql = require('../forms/graphiql.form');
const catalog = require('../forms/catalog.form');

const forms = {
  front,
  back,
  graphiql,
  catalog,
};

module.exports.actionHandler = type => new Promise((resolve, reject) => {
  inquirer.prompt(forms[type])
    .then((options) => {
      const opt = { ...options };

      if ('ddbb' in opt) {
        opt.ddbb.forEach(db => Object.assign(opt, {
          [db.name]: db.value,
        }));
        delete opt.ddbb;
      }

      // First we create the project folder.

      try {
        mkdirSync(opt.name);
      } catch (error) {
        // Check this in Windows 10:
        // https://stackoverflow.com/questions/48875535/cmd-command-mkdir-does-not-create-new-directory
        reject(error);
      }

      // Then we create the common files (no dependencies).

      log();
      /* eslint-disable-next-line global-require, import/no-dynamic-require */
      require(`../modules/${type}/common/config.json`).forEach((file) => {
        createElement(opt, file, ['modules', type, 'common', 'templates']);
      });

      /**
       * We create the project's files. We need to add only the files that are
       * required:
       *
       * !file.dependency || opt[file.dependency] === true
       */

      /* eslint-disable-next-line global-require, import/no-dynamic-require */
      require(`../modules/${type}/config.json`).forEach((file) => {
        if (!file.dependency || opt[file.dependency]) {
          createElement(opt, file, ['modules', type, 'templates'], type);
        }
      });

      // Then we launch the command line tasks.

      // First we initialize an empty git repository.

      try {
        execSync(`cd ./${opt.name} && git init`, { stdio: [process.stderr] });
      } catch (error) {
        reject(new Error('Cannot create git repository!'));
      }

      // And then we install the dependencies.

      log();
      log('Installing dependencies!', 'working');

      try {
        execSync(`cd ./${opt.name} && npm install`, { stdio: [process.stderr] });
      } catch (error) {
        reject(new Error('Cannot install dependencies!'));
      }

      // Finally we send upstream the result of the process.

      resolve([
        `Project "${opt.name}" created!\n`,
        'Instructions:',
        'To start the project => npm start',
        'To build the project => npm run build',
        'To create the docs => npm run docs',
        'To check the code => npm run lint',
        'To test the project => npm test',
      ]);
    })
    .catch(() => reject(new Error('Cannot create project!')));
});
