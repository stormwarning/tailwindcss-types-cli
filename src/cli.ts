import * as fs from 'fs'

import { compile } from 'json-schema-to-typescript'
import sade from 'sade'

import { getClassNames } from './getClassNames'

const prog = sade('theme-types')

prog.command('build').action(() => {
    getClassNames().then((res) => {
        console.log(res.classNames.classNames)
        const { classNames } = res.classNames

        /**
         * Inline the object to avoid TypeScript narrowing the type.
         * @see https://github.com/bcherny/json-schema-to-typescript/issues/253#issuecomment-560388629
         */
        compile(
            {
                enum: classNames,
            },
            'FontFamilyClass',
        ).then((ts) => {
            console.log(ts)
            fs.writeFileSync('foo.d.ts', ts)
        })
    })
})

prog.parse(process.argv)
