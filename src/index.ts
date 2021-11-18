import { spawnSync, SpawnSyncReturns } from 'child_process';

class Porcelain {
  private statusFiles: Set<string> = new Set<string>();
  private fileStatuses: Map<string, string> = new Map<string, string>(); // need to use for status

  // constructor() {}

  /**
   * Populate the list of files.
   */
  private populateGitStatus(): void {
    // run command
    const status: SpawnSyncReturns<Buffer> = spawnSync('git', ['status', '--porcelain', '-z']);
    // status.stdout.toString().split('\x00');
    const files = status.stdout.toString().split('\x00');
    // populate set
    for (let i = 0; i < files.length - 1; ++i) {
      const filename = files[i].substring(files[i].lastIndexOf(' ') + 1);
      const status = files[i].substring(0, files[i].lastIndexOf(' '));
      this.statusFiles.add(filename);
      console.log(status);
      this.fileStatuses.set(filename, status); // need to use enum
    }
  }

  /**
   * Check for if a file name would be in the git status list.
   */
  public isFileInStatus(filename: string): boolean {
    this.populateGitStatus();
    return this.statusFiles.has(filename);
  }

  /**
   * Check for if a file name would be in the git status list and if so, check if its modified
   */
  public isModified(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status.includes('M');
    }
    return false;
  }

  public isFileTypeChanged(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status.includes('T');
    }
    return false;
  }

  public isAdded(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status.includes('A');
    }
    return false;
  }

  public isDeleted(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status.includes('D');
    }
    return false;
  }

  public isRenamed(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status.includes('R');
    }
    return false;
  }

  public isCopied(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status.includes('C');
    }
    return false;
  }

  public isUpdatedButUnmerged(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status.includes('U');
    }
    return false;
  }

  public isUntracked(filename: string): boolean {
    this.populateGitStatus();
    const status = this.fileStatuses.get(filename) ?? false;
    if (status) {
      return status === '??';
    }
    return false;
  }

  public get getList(): Set<string> {
    return this.statusFiles;
  }
}
