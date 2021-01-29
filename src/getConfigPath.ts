import * as path from 'path'

import glob from 'fast-glob'
import normalizePath from 'normalize-path'
import invariant from 'tiny-invariant'

const CONFIG_GLOB =
    '**/{tailwind,tailwind.config,tailwind-config,.tailwindrc}.js'

/**
 * Get the path to the local Tailwind config file.
 */
export async function getConfigPath(cwd = process.cwd()): Promise<string> {
    let configPaths = (
        await glob(CONFIG_GLOB, {
            cwd,
            ignore: ['**/node_modules'],
            onlyFiles: true,
            absolute: true,
            suppressErrors: true,
        })
    )
        .map((g) => normalizePath(g))
        .sort((a, b) => a.split('/').length - b.split('/').length)
        .map(path.normalize)

    invariant(configPaths.length > 0, 'No Tailwind CSS config found.')

    return configPaths[0]
}
