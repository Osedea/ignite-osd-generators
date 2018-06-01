// @cliDescription  Generates a redux smart component.

const patterns = require('../lib/patterns');

module.exports = async function (context) {
    // grab some features
    const { parameters, strings, print, ignite, filesystem } = context;
    const { pascalCase, isBlank } = strings;
    const config = ignite.loadIgniteConfig();

    // validation
    if (isBlank(parameters.first)) {
        print.info(`${context.runtime.brand} generate view <name>\n`);
        print.info('A name is required.');
        return;
    }

    const name = pascalCase(parameters.first);
    const props = { name,
        appName: config.appName };

    const jobs = [
        {
            template: 'view.ejs',
            target: `app/views/${name}/index.js`,
        },
    ];

    await ignite.copyBatch(context, jobs, props);

    // if using `react-navigation` go the extra step
    // and insert the view into the nav router
    if (config.navigation === 'react-navigation') {
        const viewName = name;
        const appNavFilePath = config.navigation === 'react-navigation'
            ? `${process.cwd()}/app/routes/index.js`
            : `${process.cwd()}/app/routes.js`;
        const importToAdd = `import ${viewName} from '${
            config.appName
        }/app/views/${viewName}'`;
        const routeToAdd = `    ${viewName}: { screen: ${viewName} },`;

        if (!filesystem.exists(appNavFilePath)) {
            const msg = `No '${appNavFilePath}' file found.  Can't insert view.`;
            print.error(msg);
            process.exit(1);
        }

        // insert view import
        ignite.patchInFile(appNavFilePath, {
            after: patterns[patterns.constants.PATTERN_ROUTES_IMPORT],
            insert: importToAdd,
        });

        // insert view route
        ignite.patchInFile(appNavFilePath, {
            after: patterns[patterns.constants.PATTERN_ROUTES],
            insert: routeToAdd,
        });
    } else {
        print.info(
            `View created, manually add it to your navigation. Here are the snippets:\n${importToAdd}\n${routeToAdd}`
        );
    }
};
