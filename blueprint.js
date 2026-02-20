#!/usr/bin/env node
"use strict";

const { startBlueprint } = require('./dist/cli/startBlueprint');

const args = process.argv.slice(2);
const watch = args.includes('--watch');

startBlueprint(watch);
