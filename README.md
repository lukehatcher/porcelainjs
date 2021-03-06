<h1 align="center"><strong>porcelain.js</strong></h1>
<h4 align="center">A utility class that makes parsing `git status --porcelain` fun.</h4>

## Use case

One use case (the one that inspired this package) is a Node.js script that performs very specific code modifications on predefined files.
I wanted a simple way to check that certain files did not have unsaved/unstaged changes before letting the script run.

## Import

### CommonJS

```ts
const Porcelain = require('porcelainjs').Porcelain;
```

### ESM

```ts
import { Porcelain } from 'porcelainjs';
```

## Usage

```ts
const gitStatusChecker = new Porcelain();
const isModified = gitStatusChecker.isFileModified('src/myFile'); // Must use absolute path from your git repo root.
```

## API

```ts
interface IPorcelain {
  // `filename` is an absolute path from your git repo root.
  isFileInStatus(filename: string): boolean;
  isFileUntracked(filename: string): boolean;

  // `filename` is an absolute path from your git repo root.
  // `gitLocation` is an optional parameter allowing you to limit your search to either the working tree or index.
  isModified(filename: string, gitLocation?: 'index' | 'working tree'): boolean;
  isFileTypeChanged(filename: string, gitLocation?: 'index' | 'working tree'): boolean;
  isAdded(filename: string, gitLocation?: 'index' | 'working tree'): boolean;
  isDeleted(filename: string, gitLocation?: 'index' | 'working tree'): boolean;
  isRenamed(filename: string, gitLocation?: 'index' | 'working tree'): boolean;
  isCopied(filename: string, gitLocation?: 'index' | 'working tree'): boolean;
  isUpdatedButUnmerged(filename: string, gitLocation?: 'index' | 'working tree'): boolean;

  // Turn your `git status` into the data structure of your choice with filename -> git status code mappings
  // see https://git-scm.com/docs/git-status#_short_format for documentation on git status formats
  get getHashTable(): Record<string, 'M' | 'T' | 'A' | 'D' | 'R' | 'C' | 'U' | '??' | ' '>;
  get getMap(): Map<string, 'M' | 'T' | 'A' | 'D' | 'R' | 'C' | 'U' | '??' | ' '>;
  get getSet(): Set<string>;
}
```
