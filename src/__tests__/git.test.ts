import { Porcelain } from '../index';
import { execSync } from 'child_process';

const testFile = `index.${Math.random()}.js`;

describe('porcelainjs', () => {
  const fileChecker = new Porcelain();

  it('return true given the name of a modified file', () => {
    // TODO: cross platform compatiblilty
    execSync(`touch ${testFile}`);
    const isThere = fileChecker.isFileInStatus(testFile);

    expect(isThere).toBe(true);
    // TODO: cross platform compatiblilty
    execSync(`rm ${testFile}`);
    execSync(`git ls-files`);
  });
});
