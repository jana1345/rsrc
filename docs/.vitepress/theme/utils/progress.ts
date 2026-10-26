export const PROGRESS_EVENT = 'lfg:progress'

const PREFIX = 'lfg:done:'

export function progressKey(path: string): string {
  return `${PREFIX}${path}`
}

export function readDone(path: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(progressKey(path)) === '1'
  } catch {
    return false
  }
}

export function writeDone(path: string, done: boolean): void {
  if (typeof window === 'undefined') return
  try {
    if (done) window.localStorage.setItem(progressKey(path), '1')
    else window.localStorage.removeItem(progressKey(path))
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { path, done } }))
  } catch {
    // Storage can be unavailable in private mode. Progress is a convenience, not flight data.
  }
}

export function clearAllProgress(paths: string[]): void {
  if (typeof window === 'undefined') return
  try {
    for (const path of paths) window.localStorage.removeItem(progressKey(path))
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { reset: true } }))
  } catch {
    // Ignore storage failures.
  }
}
