#!/usr/bin/env node
"use strict";

import { execBlueprintCli } from './dist/cli/execBlueprintCli.js';

const args = process.argv.slice(2);
const command = args.shift();

execBlueprintCli(command, args).catch((err) => {
    console.error(err);
    process.exit(1);
});
