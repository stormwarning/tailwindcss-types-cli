import * as path from 'path'

// import dlv from 'dlv'
import dset from 'dset'
import glob from 'fast-glob'
import importFrom from 'import-from'
import normalizePath from 'normalize-path'
import resolveFrom from 'resolve-from'
import resolveConfig from 'tailwindcss/resolveConfig'
import invariant from 'tiny-invariant'

import extractClassNames from './extractClassNames'

/**
 * 1. Build utilities based on current config
 * 2. Extract classNames from postcss output
 * 3. Write .d.ts file (json-schema-to-typescript) from classNames
 * 4. Run above for each tailwind theme key
 */

const CONFIG_GLOB =
    '**/{tailwind,tailwind.config,tailwind-config,.tailwindrc}.js'

export async function getClassNames(cwd = process.cwd()) {
    // async function run() {
    let postcss
    let tailwindcss
    // let browserslistModule
    // let version
    // let featureFlags = { future: [], experimental: [] }

    const configPaths = (
        await glob(CONFIG_GLOB, {
            cwd,
            ignore: ['**/node_modules'],
            onlyFiles: true,
            absolute: true,
            suppressErrors: true,
        })
    )
        // @ts-ignore
        .map(normalizePath)
        .sort((a, b) => a.split('/').length - b.split('/').length)
        .map(path.normalize)

    invariant(configPaths.length > 0, 'No Tailwind CSS config found.')
    const configPath = configPaths[0]
    const configDir = path.dirname(configPath)
    const tailwindBase = path.dirname(
        resolveFrom(configDir, 'tailwindcss/package.json'),
    )
    postcss = importFrom(tailwindBase, 'postcss')
    tailwindcss = importFrom(configDir, 'tailwindcss')
    // version = importFrom(configDir, 'tailwindcss/package.json').version

    // try {
    //     // this is not required
    //     browserslistModule = importFrom(tailwindBase, 'browserslist')
    // } catch (_) {}

    // try {
    //     featureFlags = importFrom(tailwindBase, './lib/featureFlags.js')
    //         .default
    // } catch (_) {}

    const sepLocation = ['separator']
    let userSeperator
    let userPurge
    // let hook = Hook(fs.realpathSync(configPath), (exports) => {
    //     userSeperator = dlv(exports, sepLocation)
    //     userPurge = exports.purge
    //     dset(exports, sepLocation, '__TAILWIND_SEPARATOR__')
    //     exports.purge = {}
    //     return exports
    // })

    // hook.watch()
    let config
    try {
        config = require(configPath)
    } catch (error) {
        // hook.unwatch()
        // hook.unhook()
        throw error
    }
    // console.log('CONFIG:', config)
    const resolvedConfig = resolveConfig(config)

    resolvedConfig.corePlugins = ['fontFamily']
    // console.log('FINAL CONFIG:', resolvedConfig)

    // hook.unwatch()

    let postcssResult

    try {
        postcssResult = await Promise.all(
            ['base', 'components', 'utilities'].map((group) =>
                postcss([tailwindcss(resolvedConfig)]).process(
                    `@tailwind ${group};`,
                    {
                        from: undefined,
                    },
                ),
            ),
        )
    } catch (error) {
        console.log(error)
        throw error
        // } finally {
        //     hook.unhook()
    }

    const [base, components, utilities] = postcssResult

    if (typeof userSeperator !== 'undefined') {
        dset(config, sepLocation, userSeperator)
    } else {
        // @ts-ignore
        delete config[sepLocation]
    }

    if (typeof userPurge !== 'undefined') {
        config.purge = userPurge
    } else {
        delete config.purge
    }

    // const resolvedConfig = resolveConfig({ cwd: configDir, config })
    // const browserslist = browserslistModule
    //     ? browserslistModule(undefined, {
    //           path: configDir,
    //       })
    //     : []

    return {
        // version,
        configPath,
        // config: resolvedConfig,
        separator: typeof userSeperator === 'undefined' ? ':' : userSeperator,
        classNames: await extractClassNames([
            { root: base.root, source: 'base' },
            { root: components.root, source: 'components' },
            { root: utilities.root, source: 'utilities' },
        ]),
        // dependencies: hook.deps,
        // plugins: getPlugins(config),
        // variants: getVariants({ config, version, postcss, browserslist }),
        // utilityConfigMap: await getUtilityConfigMap({
        //     cwd: configDir,
        //     resolvedConfig,
        //     postcss,
        //     browserslist,
        // }),
        // modules: {
        //     tailwindcss,
        //     postcss,
        // },
        // featureFlags,
    }
    // }

    // return await run()
}
