/* eslint-disable object-shorthand */
module.exports = {
    description: 'Generates a action/creator/reducer set for Redux.',
    run: async function (context) {
        // grab some features
        const { parameters, ignite, strings, print, filesystem } = context;
        const { isBlank, pascalCase } = strings;
        const { appName } = await filesystem.read(`${process.cwd()}/ignite/ignite.json`, 'json');

        // validation
        if (isBlank(parameters.first)) {
            print.info(`${context.runtime.brand} generate service <name>\n`);
            print.info('A name is required.');
            return;
        }

        const name = pascalCase(parameters.first);
        const props = {
            name,
            appName,
        };

        const jobs = [
            {
                template: `service/reducer.js.ejs`,
                target: `app/services/${name}/reducer.ts`,
            },
            {
                template: `service/selectors.js.ejs`,
                target: `app/services/${name}/selectors.ts`,
            },
            {
                template: `service/thunks.js.ejs`,
                target: `app/services/${name}/thunks.ts`,
            },
        ];

        await ignite.copyBatch(context, jobs, props);

        ignite.patchInFile(`${process.cwd()}/app/reducers.ts`, {
            after: `import { combineReducers } from 'redux';`,
            insert: `import ${name}Reducer from '${appName}/app/services/${name}/reducer';`,
        });

        ignite.patchInFile(`${process.cwd()}/app/reducers.ts`, {
            after: `export default combineReducers`,
            insert: `    ${name}: ${name}Reducer,`,
        });
    }
};
