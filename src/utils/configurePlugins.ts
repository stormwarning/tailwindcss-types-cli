/**
 * Copied from Tailwind source
 * @see https://github.com/tailwindlabs/tailwindcss/blob/master/src/util/configurePlugins.js
 */
type ConfigurePluginsReturn = undefined | string[]
export function configurePlugins(pluginConfig, plugins): ConfigurePluginsReturn {
    if (pluginConfig === undefined) {
      return plugins
    }

    const pluginNames = Array.isArray(pluginConfig)
      ? pluginConfig
      : plugins.filter((pluginName) => {
          return pluginConfig !== false && pluginConfig[pluginName] !== false
        })

    return pluginNames
  }
