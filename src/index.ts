import { spawnSync, SpawnSyncReturns } from 'child_process';

import { GitLocation, StatusCode } from './types/enums';

export class Porcelain {
  private statusFiles: Map<string, StatusCode> = new Map<string, StatusCode>(); // TODO: type values

  // =======================================================
  // private "util functions"
  // =======================================================
  /**
   * Should this be public???
   * No, it gets ran after each call
   */
  private populateGitStatus(): void {
    // run command
    const status: SpawnSyncReturns<Buffer> = spawnSync('git', ['status', '--porcelain', '-z']);
    // status.stdout.toString().split('\x00');
    // console.log(status.stdout.toString());
    const files = status.stdout.toString().split('\x00');
    this.statusFiles.clear();
    for (let i = 0; i < files.length - 1; ++i) {
      const filename = files[i].substring(files[i].lastIndexOf(' ') + 1);
      const status = files[i].substring(0, files[i].lastIndexOf(' '));
      this.statusFiles.set(filename, status as StatusCode);
    }
  }

  private checkFile(filename: string, statusCode: StatusCode, gitLocation: GitLocation | undefined): boolean {
    const gitFile = this.statusFiles.get(filename) ?? false;

    if (gitFile) {
      if (gitLocation) {
        if (gitLocation === GitLocation.INDEX) {
          return gitFile[0] === statusCode;
        } else {
          return gitFile[1] === statusCode;
        }
      }
      return gitFile.includes(statusCode);
    }
    return false;
  }

  // =======================================================
  // top level checks
  // =======================================================
  /**
   * @param filename relative path
   * @returns whether or not the file is editied i.e. the file would show up with `$ git status`
   */
  public isFileInStatus(filename: string): boolean {
    // Treat `./src/index.ts` and `src/index.ts` the same.
    if (filename.startsWith('./')) {
      filename = filename.substring(2);
    }
    this.populateGitStatus();
    return this.statusFiles.has(filename);
  }

  // =======================================================
  // check if a file is XY
  // =======================================================
  public isFileUntracked(filename: string): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.UNTRACKED, undefined);
  }
  public isModified(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.MODIFIED, gitLocation);
  }

  public isFileTypeChanged(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.FILE_TYPE_CHANGED, gitLocation);
  }

  public isAdded(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.ADDED, gitLocation);
  }

  public isDeleted(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.DELETED, gitLocation);
  }

  public isRenamed(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.RENAMED, gitLocation);
  }

  public isCopied(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.COPIED, gitLocation);
  }

  public isUpdatedButUnmerged(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCode.UPDATED_BUT_UNMERGED, gitLocation);
  }

  // =======================================================
  // get status files in your preferred DS
  // =======================================================
  public get getMap(): Map<string, StatusCode> {
    this.populateGitStatus();
    return this.statusFiles;
  }

  public get getSet(): Set<string> {
    return new Set<string>(Object.keys(this.statusFiles));
  }

  public get getHashTable(): Record<string, StatusCode> {
    const hashTable: Record<string, StatusCode> = {};
    for (const [key, val] of Object.entries(this.statusFiles)) {
      hashTable[key] = val as StatusCode;
    }
    return hashTable;
  }
}

// const inst = new Porcelain();
// console.log(inst.isFileInStatus('tsconfig.json'));
// console.log(inst.isModified('.gitignore'));
// console.log(inst.populateGitStatus());
// console.log(ans);
// console.log('');
// console.log(ans.split('\x00'));

// =============
// mapping out what we want to have and work with
// ========

// base check if a file is modified or not

// features:
// - pass it a file name to see if its tracked, or get its status
// - fetch array of all items
// - fetch set of all items
// - fetch hset of all items
//

// want to be able to chain
// Status.trackedOnly().modifiedOnly().toArray()
//

// Status.

// use case:
// - I want to use this with my cli so see if files X Y Z have uncommited changes

// should never just return a

// for i in file name:
//  if file in list of modifieds:
//    do thing....

// notes on yarn --porcelain
// it will list files from the root of the project (but without the ./ prefix)
// ... this is unlike the raw git status command which will list files with their relative paths

// error handling for when this script is ran in a file that is not a fit repo

// porcelain returns full paths from root: i.e. `git s --porcelain` src folder would list the root tsconfig as `tsconfig.json` and something in types folder as `src/types/blah.ts`
//
//
// need to handle:
// 1) user gives us relative path (like in git status)
// 2) user gives path from root
// 3) user gives path from root but leads with a ./
