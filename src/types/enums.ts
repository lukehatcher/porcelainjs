export enum GitLocation {
  INDEX = 'index',
  WORKINGTREE = 'working tree',
}

export enum StatusCodes {
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
