import { spawnSync, SpawnSyncReturns } from 'child_process';

import { GitLocation, StatusCodes } from './types/enums';

class Porcelain {
  private statusFiles: Map<string, string> = new Map<string, string>();

  // constructor() {}

  // =======================================================
  // private "util functions"
  // =======================================================
  private populateGitStatus(): void {
    // run command
    const status: SpawnSyncReturns<Buffer> = spawnSync('git', ['status', '--porcelain', '-z']);
    // status.stdout.toString().split('\x00');
    const files = status.stdout.toString().split('\x00');
    // populate set
    for (let i = 0; i < files.length - 1; ++i) {
      const filename = files[i].substring(files[i].lastIndexOf(' ') + 1);
      const status = files[i].substring(0, files[i].lastIndexOf(' '));
      // this.statusFiles.add(filename);
      console.log(status);
      this.statusFiles.set(filename, status); // need to use enum
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
}

export default Porcelain;