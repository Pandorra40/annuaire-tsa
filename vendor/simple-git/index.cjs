'use strict'
const upstream = require('simple-git-upstream')

const simpleGit = upstream.simpleGit || upstream.default || upstream
module.exports = simpleGit
Object.assign(module.exports, upstream)
module.exports.simpleGit = simpleGit
module.exports.default = simpleGit
