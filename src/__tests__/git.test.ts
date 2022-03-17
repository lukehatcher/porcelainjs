import { Porcelain } from '../index';
import { exec, execSync } from 'child_process';
import fs, { writeFileSync } from 'fs';
import path from 'path';

const testFile = 'index.x.js';

// Paths of files in git must be absolut paths from the root of the git repo.
const blankFile = path.join('src', '__tests__', 'blank.ts');
const renamedFile = path.join('src', '__tests__', 'renamed.ts');

describe('porcelainjs', () => {
  beforeEach(() => {
    try {
      execSync(`touch ${testFile}`);
    } catch (err) {
      console.error(err);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      try {
        execSync(`rm ${testFile}`);
      } catch (err) {
        console.error(err);
      }
    }
  });

  afterAll(() => {
    exec(`git restore --staged ${testFile}`, (e) => {
      if (e) console.error(e);
    });
  });

  const fileChecker = new Porcelain();

  it('should return true to show that a newly created file is listed in `git status`', () => {
    const isInStatus = fileChecker.isFileInStatus(testFile);
    expect(isInStatus).toBe(true);
  });

  it('should identify an untracked file', () => {
    const isUntracked = fileChecker.isFileUntracked(testFile);
    expect(isUntracked).toBe(true);
  });

  it('should identify an added file', () => {
    execSync(`git add ${testFile}`);
    const isAdded = fileChecker.isAdded(testFile);
    expect(isAdded).toBe(true);
  });

  it('should identify file as modified (working tree)', () => {
    execSync(`git add ${testFile}`);
    const lines = ['asdf', 'asdf', 'asdf'];
    writeFileSync(testFile, lines.join('\n'));

    const isModified = fileChecker.isModified(testFile, 'working tree');
    expect(isModified).toBe(true);
  });

  it('should identify file as modified (working tree)', () => {
    execSync(`git add ${testFile}`);
    const lines = ['asdf', 'asdf', 'asdf'];
    writeFileSync(testFile, lines.join('\n'));

    const isModified = fileChecker.isModified(testFile, 'working tree');
    expect(isModified).toBe(true);
  });

  // TODO
  // it('should identify file as having its type changed (working tree)', () => {
  //   execSync(`git add ./${testFile}`);
  //   const lines = ['asdf', 'asdf', 'asdf'];
  //   writeFileSync(`./${testFile}`, lines.join('\n'));

  //   const isModified = fileChecker.isModified(`./${testFile}`, GitLocation.WORKINGTREE);
  //   expect(isModified).toBe(true);
  // });

  it('should identify file as having been deleted', () => {
    execSync(`git add ${testFile}`);
    execSync(`rm ${testFile}`);

    const isDeleted = fileChecker.isDeleted(testFile);
    expect(isDeleted).toBe(true);
  });

  it('should identify file as having been renamed', () => {
    execSync(`git mv ${blankFile} ${renamedFile}`);

    const isRenamed = fileChecker.isRenamed(`${blankFile}`);
    expect(isRenamed).toBe(true);
    execSync(`git mv ${renamedFile} ${blankFile}`);
  });

  // TODO
  // it('should identify file as having been copied', () => {
  //   // execSync(``);

  //   const isCopied = fileChecker.isCopied(`${blankFile}`);
  //   expect(isCopied).toBe(true);
  //   // execSync(``);
  // });

  // TODO
  // it('should identify file as having been updated but not merged', () => {
  //   // execSync(``);

  //   const isUpdatedButUnmerged = fileChecker.isUpdatedButUnmerged(`${blankFile}`);
  //   expect(isUpdatedButUnmerged).toBe(true);
  //   // execSync(``);
  // });
});
