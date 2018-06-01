// @cliDescription  Generates a action/creator/reducer set for Redux.

module.exports = async function (context) {
    // grab some features
    const { parameters, ignite, strings, print } = context;
    const { isBlank, pascalCase } = strings;
    const config = ignite.loadIgniteConfig();

    // validation
    if (isBlank(parameters.first)) {
        print.info(`${context.runtime.brand} generate service <name>\n`);
        print.info('A name is required.');
        return;
    }

    const name = pascalCase(parameters.first);
    const props = { name,
        appName: config.appName };

    const jobs = [
        {
            template: `actions.js.ejs`,
            target: `app/services/${name}/actions.js`,
        },
        {
            template: `reducer.js.ejs`,
            target: `app/services/${name}/reducer.js`,
        },
        {
            template: `requests.js.ejs`,
            target: `app/services/${name}/requests.js`,
        },
        {
            template: `selectors.js.ejs`,
            target: `app/services/${name}/selectors.js`,
        },
        {
            template: `thunks.js.ejs`,
            target: `app/services/${name}/thunks.js`,
        },
    ];

    await ignite.copyBatch(context, jobs, props);
};
