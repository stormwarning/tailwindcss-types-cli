export async function processCss(postcss, tailwindcss, twConfig) {
    let postcssResult

    postcssResult = await Promise.all(
        ['base', 'components', 'utilities'].map((group) =>
            postcss([tailwindcss(twConfig)]).process(`@tailwind ${group};`, {
                from: undefined,
            }),
        ),
    )

    return postcssResult
}
