export function isAbsolute(path: string): boolean {
  return path.startsWith('/')
}

export function joinPaths(...paths: string[]): string {
  const list = paths.filter(v => v !== '')
  return list.join('/').replaceAll(/\/+/g, '/')
}
