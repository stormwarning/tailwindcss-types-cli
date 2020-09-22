import * as path from 'path'

import importFrom from 'import-from'
import resolveFrom from 'resolve-from'
import resolveConfig from 'tailwindcss/resolveConfig'

import extractClassNames from './extractClassNames'
import { getConfigPath } from './getConfigPath'

/**
 * 1. Build utilities based on current config
 * 2. Extract classNames from postcss output
 * 3. Write .d.ts file (json-schema-to-typescript) from classNames
 * 4. Run above for each tailwind theme key
 */

type ClassNames = {
    classNames: {
        classNames: any
    }
}

export async function getClassNames(cwd = process.cwd()): Promise<ClassNames> {
    const configPath = await getConfigPath(cwd)
    const configDir = path.dirname(configPath)
    const tailwindBase = path.dirname(
        resolveFrom(configDir, 'tailwindcss/package.json'),
    )
    const postcss = importFrom(tailwindBase, 'postcss') as Function
    const tailwindcss = importFrom(configDir, 'tailwindcss') as Function

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tailwindConfig = require(configPath)
    const resolvedConfig = resolveConfig(tailwindConfig)

    resolvedConfig.corePlugins = ['fontFamily']

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
    }

    const [base, components, utilities] = postcssResult

    return {
        classNames: await extractClassNames([
            { root: base.root, source: 'base' },
            { root: components.root, source: 'components' },
            { root: utilities.root, source: 'utilities' },
        ]),
    }
}
