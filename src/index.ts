import { spawnSync, SpawnSyncReturns } from 'child_process';

import { GitLocation, StatusCodes } from './types/enums';
import { IFilenameStatusHashTable } from './types/interfaces';

class Porcelain {
  private statusFiles: Map<string, string> = new Map<string, string>(); // TODO: type values
  private statusFilesSet: Set<string> = new Set<string>();
  private statusFilesHashTable: IFilenameStatusHashTable = {};

  // constructor() {}

  // =======================================================
  // private "util functions"
  // =======================================================
  private populateGitStatus(): void {
    // run command
    const status: SpawnSyncReturns<Buffer> = spawnSync('git', ['status', '--porcelain', '-z']);
    // status.stdout.toString().split('\x00');
    const files = status.stdout.toString().split('\x00');
    this.statusFiles.clear();
    for (let i = 0; i < files.length - 1; ++i) {
      const filename = files[i].substring(files[i].lastIndexOf(' ') + 1);
      const status = files[i].substring(0, files[i].lastIndexOf(' '));
      this.statusFiles.set(filename, status);
    }
  }

  private populateGitStatusHashSet(): void {
    // onlny generate this when users ask for it (want to keep main fetch func small)
    const status: SpawnSyncReturns<Buffer> = spawnSync('git', ['status', '--porcelain', '-z']);
    const files = status.stdout.toString().split('\x00');
    this.statusFilesSet.clear();
    for (let i = 0; i < files.length - 1; ++i) {
      const filename = files[i].substring(files[i].lastIndexOf(' ') + 1);
      this.statusFilesSet.add(filename);
    }
  }

  private populateGitStatusHashTable(): void {
    // onlny generate this when users ask for it (want to keep main fetch func small)
    const status: SpawnSyncReturns<Buffer> = spawnSync('git', ['status', '--porcelain', '-z']);
    const files = status.stdout.toString().split('\x00');
    this.statusFilesHashTable = {};
    for (let i = 0; i < files.length - 1; ++i) {
      const filename = files[i].substring(files[i].lastIndexOf(' ') + 1);
      const status = files[i].substring(0, files[i].lastIndexOf(' '));
      this.statusFilesHashTable[filename] = status;
    }
  }

  private checkFile(filename: string, statusCode: StatusCodes, gitLocation: GitLocation | undefined): boolean {
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
  public isFileInStatus(filename: string): boolean {
    // need to handle:
    // 1) user gives us relative path (like in git status)
    // 2) user gives path from root
    // 3) user gives path from root but leads with a ./
    this.populateGitStatus();
    return this.statusFiles.has(filename);
  }

  public isFileUntracked(filename: string): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.UNTRACKED, undefined);
  }

  // =======================================================
  // check if a file is XY
  // =======================================================
  public isModified(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.MODIFIED, gitLocation);
  }

  public isFileTypeChanged(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.FILE_TYPE_CHANGED, gitLocation);
  }

  public isAdded(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.ADDED, gitLocation);
  }

  public isDeleted(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.DELETED, gitLocation);
  }

  public isRenamed(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.RENAMED, gitLocation);
  }

  public isCopied(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.COPIED, gitLocation);
  }

  public isUpdatedButUnmerged(filename: string, gitLocation?: GitLocation): boolean {
    this.populateGitStatus();
    return this.checkFile(filename, StatusCodes.UPDATED_BUT_UNMERGED, gitLocation);
  }

  // =======================================================
  // get status files in your preferred DS
  // =======================================================
  public get getMap(): Map<string, string> {
    this.populateGitStatus();
    return this.statusFiles;
  }

  public get getSet(): Set<string> {
    this.populateGitStatusHashSet();
    return this.statusFilesSet;
  }

  public get getHashTable(): IFilenameStatusHashTable {
    this.populateGitStatusHashTable();
    return this.statusFilesHashTable;
  }
}

export default Porcelain;

const inst = new Porcelain();
console.log(inst.isFileInStatus('tsconfig.json'));
console.log(inst.isModified('.gitignore'));
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
