import { spawnSync, SpawnSyncReturns } from 'child_process';

type GitLocation = 'index' | 'working tree';
// type StatusCode = ' ' | 'M' | 'T' | 'A' | 'D' | 'R' | 'C' | 'U' | '??';

enum StatusCode {
  UNMODIFIED = ' ',
  MODIFIED = 'M',
  FILE_TYPE_CHANGED = 'T',
  ADDED = 'A',
  DELETED = 'D',
  RENAMED = 'R',
  COPIED = 'C',
  UPDATED_BUT_UNMERGED = 'U',
  UNTRACKED = '??',
}

interface IPorcelain {
  isFileInStatus(filename: string): boolean;
  isFileUntracked(filename: string): boolean;
  isModified(filename: string, gitLocation?: GitLocation): boolean;
  isFileTypeChanged(filename: string, gitLocation?: GitLocation): boolean;
  isAdded(filename: string, gitLocation?: GitLocation): boolean;
  isDeleted(filename: string, gitLocation?: GitLocation): boolean;
  isRenamed(filename: string, gitLocation?: GitLocation): boolean;
  isCopied(filename: string, gitLocation?: GitLocation): boolean;
  isUpdatedButUnmerged(filename: string, gitLocation?: GitLocation): boolean;
  get getMap(): Map<string, StatusCode>;
  get getSet(): Set<string>;
  get getHashTable(): Record<string, StatusCode>;
}

export class Porcelain implements IPorcelain {
  private statusFiles: Map<string, StatusCode> = new Map<string, StatusCode>();

  private populateGitStatus(): void {
    const status: SpawnSyncReturns<Buffer> = spawnSync('git', ['status', '--porcelain']);
    const files = status.stdout.toString().split('\n');
    this.statusFiles.clear();

    for (let i = 0; i < files.length - 1; ++i) {
      const file = files[i];
      let filename;

      if (file.includes(' -> ')) {
        // We have a reaname
        filename = file.substring(
          3,
          file.split('').findIndex((_, i) => file.substring(i, i + 4) === ' -> ')
        );
      } else {
        filename = file.substring(file.lastIndexOf(' ') + 1);
      }
      const status = file.substring(0, 2);
      this.statusFiles.set(filename, status as StatusCode);
    }
  }

  private checkFile(filename: string, statusCode: StatusCode, gitLocation: GitLocation | undefined): boolean {
    if (filename.startsWith('./')) {
      filename = filename.substring(2);
    }
    const gitFile = this.statusFiles.get(filename) ?? false;

    if (gitFile) {
      if (gitLocation) {
        if (gitLocation === 'index') {
          return gitFile[0] === statusCode;
        } else {
          return gitFile[1] === statusCode;
        }
      }
      return gitFile.includes(statusCode);
    }
    return false;
  }

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
