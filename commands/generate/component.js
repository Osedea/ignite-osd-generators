/* eslint-disable object-shorthand */
module.exports = {
    description: 'Generates a component, styles, and an optional test.',
    run: async function (context) {
        // grab some features
        const { parameters, strings, print, ignite, prompt } = context;
        const { pascalCase, isBlank } = strings;
        const name = pascalCase(parameters.first);

        let isConnected = false;
        let isPure = false;
        let isFunctional = false;


        const jobs = [
            {
                template: 'component.ejs',
                target: `app/components/${name}.tsx`,
            },
            {
                template: 'component-test.ejs',
                target: `__tests__/${name}.test.js`,
            },
        ];

        const config = ignite.loadIgniteConfig();

        // validation
        if (isBlank(parameters.first)) {
            print.info(`${context.runtime.brand} generate component <name>\n`);
            print.info('A name is required.');
            return;
        }

        if (typeof parameters.options.isFunctional === 'undefined') {
            const answer = await prompt.ask({
                name: 'isFunctional',
                type: 'select',
                message: 'Will the component be functional?',
                choices: ['No', 'Yes'],
            });
            isFunctional = answer.isFunctional === 'Yes';
            if (isFunctional) {
                jobs[0].template = 'component-functional.ejs';
            }
        }

        if (typeof parameters.options.isConnected === 'undefined') {
            const answer = await prompt.ask({
                name: 'isConnected',
                type: 'select',
                message: 'Will this component be connected to redux?',
                choices: ['No', 'Yes'],
            });
            isConnected = answer.isConnected === 'Yes';
        }

        if (typeof parameters.options.isPure === 'undefined' && !isFunctional) {
            const answer = await prompt.ask({
                name: 'isPure',
                type: 'select',
                message: 'Will the component be a pure component?',
                choices: ['No', 'Yes'],
            });
            isPure = answer.isPure === 'Yes';
        }

        // read some configuration
        const props = {
            ...config,
            name,
            isConnected,
            isPure,
        };

        await ignite.copyBatch(context, jobs, props);
    }
};
