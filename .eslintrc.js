module.exports = {
    extends: ['eslint:recommended', 'airbnb-base', 'plugin:import/recommended'],
    parser: '@babel/eslint-parser',
    parserOptions: { requireConfigFile: false },
    env: {
        browser: true,
        node: true,
    },
    settings: {
        'import/ignore': ['node_modules', '.(scss|css)$', '.(jpe?g|png|gif|svg)'],
    },
    rules: {
    /**
     * Possible Errors
     * http://eslint.org/docs/rus/#possible-errors
     */

        // Allow dangling commas for multiline arrays and objects
        // http://eslint.org/docs/rules/comma-dangle
        'comma-dangle': [1, 'only-multiline'],

        // Warn against use of console for non-error logging
        // http://eslint.org/docs/rules/no-console
        'no-console': [1, { allow: ['error'] }],

        // Allow use of Object.prototypes builtins directly
        // http://eslint.org/docs/rules/no-prototype-builtins
        'no-prototype-builtins': [0],

        /**
     * Best Practices
     * http://eslint.org/docs/rules/#best-practices
     */

        // Allow else clauses after an if with a return
        // http://eslint.org/docs/rules/no-else-return
        'no-else-return': [0],

        // Disallow reassignment of function parameters (but allow assigning to parameter's properties)
        // http://eslint.org/docs/rules/no-param-reassign.html
        'no-param-reassign': [2, { props: false }],

        /**
     * Variables
     * http://eslint.org/docs/rules/#variables
     */

        // Disallow use of variables and classes before they are defined
        // http://eslint.org/docs/rules/no-use-before-define
        'no-use-before-define': [2, { functions: false, classes: true }],

        // Disallow declaration of variables that are not used in the code, unless they are prefixed by
        // `ignored` (useful for creating subset objects through destructuring and rest objects)
        // http://eslint.org/docs/rules/no-unused-vars
        'no-unused-vars': [
            2,
            {
                vars: 'local',
                args: 'after-used',
                varsIgnorePattern: 'ignored.+',
            },
        ],

        /**
     * Stylelistic Issues
     * (http://eslint.org/docs/rules/#stylistic-issues)
     */

        // Enforce 4-space indents, except for switch cases
        // http://eslint.org/docs/rules/indent
        'indent': [2, 4, { SwitchCase: 1, VariableDeclarator: 1 }],

        // Specify the maximum length of a code line to be 100
        // http://eslint.org/docs/rules/max-len
        'max-len': [
            2,
            {
                code: 105, // Use 105 to give some leeway for *just* slightly longer lines when convienient
                ignorePattern: '^(import|export) .* from .*$',
                ignoreComments: false,
                ignoreTrailingComments: true,
                ignoreUrls: true,
            },
        ],

        // Require capitalization when using `new`, but don't require capitalized functions to be called
        // with new
        // http://eslint.org/docs/rules/new-cap
        'new-cap': [2, { newIsCap: true, capIsNew: false }],

        // Allow the continue statement
        // http://eslint.org/docs/rules/no-continue
        'no-continue': [0],

        // Disallow un-paren'd mixes of different operators if they're not of the same precendence
        // http://eslint.org/docs/rules/no-mixed-operators
        'no-mixed-operators': [
            2,
            {
                groups: [
                    ['+', '-', '*', '/', '%', '**'],
                    ['&', '|', '^', '~', '<<', '>>', '>>>'],
                    ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                    ['&&', '||'],
                    ['in', 'instanceof'],
                ],
                allowSamePrecedence: true,
            },
        ],

        // Allow use of unary increment/decrement operators
        // http://eslint.org/docs/rules/no-plusplus
        'no-plusplus': [0],

        // Always allow dangling underscores
        // http://eslint.org/docs/rules/no-underscore-dangle
        'no-underscore-dangle': [0],

        // Require unix-style line breaks
        // http://eslint.org/docs/rules/linebreak-style
        'linebreak-style': [2, 'unix'],

        // Require operators to always be at the end of a line, except for the ternary operator
        // http://eslint.org/docs/rules/operator-linebreak
        'operator-linebreak': [
            2,
            'after',
            { overrides: { '?': 'ignore', ':': 'ignore' } },
        ],

        // Require properties to be consistently quoted. Force numbers to be quoted, as they can have
        // weird behaviour during the coercion into a string)
        // http://eslint.org/docs/rules/quote-props
        'quote-props': [
            2,
            'consistent',
            { keywords: false, unnecessary: true, numbers: true },
        ],

        // Require spaces before parens for anonymous function declarations
        // http://eslint.org/docs/rules/space-before-function-paren
        'space-before-function-paren': [2, { anonymous: 'always', named: 'never' }],

        // Require a space immediately following the // or /* in a comment for most comments
        // http://eslint.org/docs/rules/spaced-comment
        'spaced-comment': [
            2,
            'always',
            {
                line: {
                    exceptions: ['-', '+'],
                },
                block: {
                    exceptions: ['*'],
                },
            },
        ],

        // We don't like semicolons so kill them
        // http://eslint.org/docs/rules/semi
        'semi': [2, 'never'],

        /**
     * Import rules
     * https://github.com/benmosher/eslint-plugin-import#rules
     */

        // Ensure named imports coupled with named exports
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/named.md#when-not-to-use-it
        'import/named': 2,

        // Ensure default import coupled with default export
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/default.md#when-not-to-use-it
        'import/default': 2,

        // Disallow namespace (wildcard) imports
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-namespace.md
        'import/no-namespace': 2,

        // Enforce imports to not specify a trailing .js extension
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/extensions.md
        'import/extensions': [2, { js: 'never' }],

        // Enforce module import order: builtin -> external -> internal
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/order.md
        'import/order': [
            2,
            {
                groups: [
                    'builtin',
                    'external',
                    ['internal', 'parent', 'sibling', 'index'],
                ],
            },
        ],

        /**
     * ES6-specific Issues
     * (http://eslint.org/docs/rules/#ecmascript-6)
     */
        'arrow-body-style': [0],
        'arrow-parens': [0],
        'arrow-spacing': [0],
        'constructor-super': [0],
        'generator-star-spacing': [0],
        'no-class-assign': [0],
        'no-confusing-arrow': [0],
        'no-const-assign': [0],
        'no-dupe-class-members': [0],
        'no-duplicate-imports': [0],
        'no-new-symbol': [0],
        'no-restricted-imports': [0],
        'no-this-before-super': [0],
        'no-useless-computed-key': [0],
        'no-useless-constructor': [0],
        'no-useless-rename': [0],
        'no-var': [0],
        'object-shorthand': [0],
        'prefer-arrow-callback': [0],
        'prefer-const': [0],
        'prefer-reflect': [0],
        'prefer-rest-params': [0],
        'prefer-spread': [0],
        'prefer-template': [0],
        'require-yield': [0],
        'rest-spread-spacing': [0],
        'sort-imports': [0],
        'template-curly-spacing': [0],
        'yield-star-spacing': [0],
    },
}
