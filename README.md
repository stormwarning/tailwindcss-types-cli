# tailwindcss-types-cli

> A CLI to generate type declarations from your Tailwind CSS classes.

## Usage

This doesn't run PurgeCSS before compiling the list of classes — make sure the
output file is not included in the files PurgeCSS checks or it will find *all*
the class strings and purge nothing, giving you a massive CSS file.

## Prior art

Similar projects, adjacent goals.

- [Tailwind CSS IntelliSense](https://github.com/tailwindlabs/tailwindcss-intellisense)
- [Typed Tailwind](https://github.com/dvkndn/typed.tw)
- [tailwindcss-classnames](https://github.com/muhammadsammy/tailwindcss-classnames)
