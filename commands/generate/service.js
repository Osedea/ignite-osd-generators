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
                template: `service/actions.js.ejs`,
                target: `app/services/${name}/actions.js`,
            },
            {
                template: `service/reducer.js.ejs`,
                target: `app/services/${name}/reducer.js`,
            },
            {
                template: `service/requests.js.ejs`,
                target: `app/services/${name}/requests.js`,
            },
            {
                template: `service/selectors.js.ejs`,
                target: `app/services/${name}/selectors.js`,
            },
            {
                template: `service/thunks.js.ejs`,
                target: `app/services/${name}/thunks.js`,
            },
        ];

        await ignite.copyBatch(context, jobs, props);

        ignite.patchInFile(`${process.cwd()}/app/reducers.js`, {
            after: `import { combineReducers } from 'redux-immutable';`,
            insert: `import ${name}Reducer from '${appName}/app/services/${name}/reducer';`,
        });

        ignite.patchInFile(`${process.cwd()}/app/reducers.js`, {
            after: `export default combineReducers`,
            insert: `    ${name}: ${name}Reducer,`,
        });
    }
};
