import * as path from 'path'

import importFrom from 'import-from'
import resolveFrom from 'resolve-from'
import resolveConfig from 'tailwindcss/resolveConfig'

import extractClassNames from './extractClassNames'
import { getConfigPath } from './getConfigPath'
import { processCss } from './utils'

/**
 * 1. Build utilities based on current config
 * 2. Extract classNames from postcss output
 * 3. Write .d.ts file (json-schema-to-typescript) from classNames
 * 4. Run above for each tailwind theme key
 */

type ClassNames = Record<string, string[]>

export async function getClassNames(cwd = process.cwd()): Promise<ClassNames> {
    const configPath = await getConfigPath(cwd)
    const configDir = path.dirname(configPath)
    const tailwindBase = path.dirname(
        resolveFrom(configDir, 'tailwindcss/package.json'),
    )
    const postcss = importFrom(tailwindBase, 'postcss') as Function
    const tailwindcss = importFrom(configDir, 'tailwindcss') as Function
    const {corePluginList} = importFrom(configDir, 'tailwindcss/lib/corePluginList.js') as { corePluginList: string[]}

    const pluginsDir = path.resolve(tailwindBase, 'lib', 'plugins')
    // const twCorePlugins = await fs.promises
    //     .readdir(pluginsDir)
    //     .then((results) =>
    //         results
    //             .filter((file) => file.endsWith('.js'))
    //             .map((plugin) => plugin.replace('.js', ''))
    //             .filter((plugin) => plugin !== 'index'),
    //     )
    // console.log('DEFAULT CORE:', corePluginList)

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tailwindConfig = require(configPath)
    const resolvedConfig = resolveConfig(tailwindConfig)

    /**
     * @todo Merge corePlugins from local config with corePlugins from
     *       default config.
     */
    // const corePlugins: Array<string> = resolvedConfig.corePlugins || []

    const allClassNames = {}

    for (const plugin of corePluginList) {
        const tempConfig = resolvedConfig
        /**
         * Override config to enable only the current `corePlugin`
         * and disable all custom utilities.
         *
         * @todo Figure out how to include third-party plugins.
         */
        Object.assign(tempConfig, { corePlugins: [plugin] })

        const [base, components, utilities] = await processCss(postcss, tailwindcss, tempConfig)

        /** Are `base` and `components` needed here? */
        const { classNames } = await extractClassNames([
            { root: base.root, source: 'base' },
            { root: components.root, source: 'components' },
            { root: utilities.root, source: 'utilities' },
        ])

        allClassNames[plugin] = classNames
    }

    return allClassNames
}
