#!/usr/bin/env node
import app from './cli';

app(process.argv).catch(err => {
  console.error(err);
  process.exit(1);
});
