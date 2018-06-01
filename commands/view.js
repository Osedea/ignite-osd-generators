// @cliDescription  Generates a redux smart component.

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

    const appNavFilePath = config.navigation === 'react-navigation'
        ? `${process.cwd()}/app/routes/index.js`
        : `${process.cwd()}/app/routes.js`;
    const viewName = name;
    const importToAdd = `import ${viewName} from '${
        config.appName
    }/app/views/${viewName}';`;

    if (!filesystem.exists(appNavFilePath)) {
        const msg = `No '${appNavFilePath}' file found.  Can't insert view.`;
        print.error(msg);
        process.exit(1);
    }

    if (config.navigation === 'react-navigation') {
        const routeToAdd = `    ${viewName}: { screen: ${viewName} },`;

        // insert view import
        ignite.patchInFile(appNavFilePath, {
            after: `import Splash from './splash';`,
            insert: importToAdd,
        });

        // insert view route
        ignite.patchInFile(appNavFilePath, {
            after: 'const routes = {',
            insert: routeToAdd,
        });
    } else {
        const routeToAdd = `    Navigation.registerNewComponent('${config.appName}.${viewName}', () => provideRedux(${viewName}));`;

        // insert view import
        ignite.patchInFile(appNavFilePath, {
            after: `import Splash from '${config.appName}/app/views/Splash';`,
            insert: importToAdd,
        });

        // insert view route
        ignite.patchInFile(appNavFilePath, {
            after: 'export default function registerScreens',
            insert: routeToAdd,
        });
    }
};
