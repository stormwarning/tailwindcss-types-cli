import * as fs from 'fs'

import { compile } from 'json-schema-to-typescript'
import sade from 'sade'

import { getClassNames } from './getClassNames'

type Schema = { [k: string]: { enum: string[] } }

const prog = sade('theme-types')

prog.command('build').action(() => {
    getClassNames().then(async (allClassNames) => {
        const classNames: Schema = {}

        Object.entries(allClassNames).map(([group, classes]) => {
            classNames[group] = { enum: classes }
        })

        for (const set of Object.keys(classNames)) {
            /**
             * Inline the object to avoid TypeScript narrowing the type.
             * @see https://github.com/bcherny/json-schema-to-typescript/issues/253#issuecomment-560388629
             */
            compile(classNames[set], set, { bannerComment: '' })
                .then((ts) => {
                    try {
                        fs.appendFileSync('theme.d.ts', ts)
                    } catch (error) {
                        console.log('[write] error:', error)
                    }
                })
                .catch((err) => console.log('[compile] error:', err))
        }
    })
})

prog.parse(process.argv)
