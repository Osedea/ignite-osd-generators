/* eslint-disable object-shorthand */
module.exports = {
    description: 'Generates a action/creator/reducer set for Redux.',
    run: async function (context) {
        // grab some features
        const { parameters, ignite, strings, print, filesystem, prompt } = context;
        const { appName } = await filesystem.read(`${process.cwd()}/ignite/ignite.json`, 'json');

        // validation
        if (strings.isBlank(parameters.first)) {
            print.info(`${context.runtime.brand} generate service <name>\n`);
            print.info('A name is required.');
            return;
        }

        const name = strings.pascalCase(parameters.first);

        if (!strings.isPlural(name)) {
            const result = await prompt.confirm(`You should use a Plural term, do you wish to continue?`);
            if (!result) {
                process.exit();
            }
        }

        const props = {
            name,
            singularName: strings.singular(name),
            kebabCaseName: strings.kebabCase(name),
            lowerFirstName: strings.lowerFirst(name),
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
            before: `app/services`,
            insert: `import ${name}Reducer from '${appName}/app/services/${name}/reducer';`,
        });

        ignite.patchInFile(`${process.cwd()}/app/reducers.ts`, {
            after: `export default combineReducers`,
            insert: `    ${strings.lowerFirst(name)}: ${name}Reducer.reducer,`,
        });
    }
};
