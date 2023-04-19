#!/usr/bin/env node
import { npmGoBin } from './core';

npmGoBin(process.argv, process.platform, process.arch, process.cwd())
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
