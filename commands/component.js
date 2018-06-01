// @cliDescription  Generates a component, styles, and an optional test.

module.exports = async function (context) {
    // grab some features
    const { parameters, strings, print, ignite, prompt } = context;
    const { pascalCase, isBlank } = strings;
    let isConnected = false;

    // validation
    if (isBlank(parameters.first)) {
        print.info(`${context.runtime.brand} generate component <name>\n`);
        print.info('A name is required.');
        return;
    }

    if (typeof parameters.options.isConnected === 'undefined') {
        const answer = await prompt.ask({
            name: 'isConnected',
            type: 'radio',
            message: 'Will this component be connected to redux?',
            choices: [false, true],
        });
        isConnected = answer.isConnected;
    }

    // read some configuration
    const name = pascalCase(parameters.first);
    const props = { 
        name,
        isConnected,
    };
    const jobs = [
        {
            template: 'component.ejs',
            target: `app/components/${name}.js`,
        },
        {
            template: 'component-test.ejs',
            target: `__tests__/${name}.test.js`,
        },
    ];

    await ignite.copyBatch(context, jobs, props);
};
