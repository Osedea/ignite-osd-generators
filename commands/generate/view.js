/* eslint-disable object-shorthand */
module.exports = {
    description: 'Generates a redux smart component.',
    run: async function (context) {
        // grab some features
        const { parameters, strings, print, ignite, filesystem } = context;
        const { pascalCase, isBlank } = strings;

        const { navigation, appName } = await filesystem.read(`${process.cwd()}/ignite/ignite.json`, 'json');

        // validation
        if (isBlank(parameters.first)) {
            print.info(`${context.runtime.brand} generate view <name>\n`);
            print.info('A name is required.');
            return;
        }

        const name = pascalCase(parameters.first);
        const props = { name,
            appName };

        const jobs = [
            {
                template: 'view.ejs',
                target: `app/views/${name}/index.tsx`,
            },
        ];

        await ignite.copyBatch(context, jobs, props);

        const appNavFilePath = navigation === 'react-navigation'
            ? `${process.cwd()}/app/routes/index.ts`
            : `${process.cwd()}/app/routes.ts`;
        const viewName = name;
        const importToAdd = `import ${viewName} from '${
            appName
        }/app/views/${viewName}';`;

        if (!filesystem.exists(appNavFilePath)) {
            const msg = `No '${appNavFilePath}' file found.  Can't insert view.`;
            print.error(msg);
            process.exit(1);
        }

        if (navigation === 'react-navigation') {
            const routeToAdd = `    ${viewName}: { screen: ${viewName} },`;

            const file = await filesystem.read(appNavFilePath);
            const splashImport = `import Splash from './splash';`;

            if (file.includes(splashImport)) {
                // insert view import
                ignite.patchInFile(appNavFilePath, {
                    after: splashImport,
                    insert: importToAdd,
                });
            } else {
                ignite.patchInFile(appNavFilePath, {
                    after: "import { BottomTabBar, createBottomTabNavigator } from 'react-navigation-tabs';",
                    insert: importToAdd,
                });
            }

            // insert view route
            ignite.patchInFile(appNavFilePath, {
                after: 'const routes = {',
                insert: routeToAdd,
            });
        } else {
            const routeToAdd = `    Navigation.registerComponent('${appName}.${viewName}', () => provideRedux(${viewName}));`;

            // ensure the splash import exists and fallback if it does not.
            const file = await filesystem.read(appNavFilePath);
            const splashImport = `import Splash from '${appName}/app/views/Splash';`;

            if (file.includes(splashImport)) {
                // insert view import
                ignite.patchInFile(appNavFilePath, {
                    after: splashImport,
                    insert: importToAdd,
                });
            } else {
                ignite.patchInFile(appNavFilePath, {
                    after: `import { Navigation } from 'react-native-navigation';`,
                    insert: importToAdd,
                });
            }

            // insert view route
            ignite.patchInFile(appNavFilePath, {
                after: 'export default function registerScreens',
                insert: routeToAdd,
            });
        }
    },
};
