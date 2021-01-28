export async function processCss(postcss, tailwindcss, twConfig) {
    let postcssResult

    try {
        postcssResult = await Promise.all(
            ['base', 'components', 'utilities'].map((group) =>
                postcss([tailwindcss(twConfig)]).process(
                    `@tailwind ${group};`,
                    {
                        from: undefined,
                    },
                ),
            ),
        )
    } catch (error) {
        throw error
    }

    return postcssResult
}
