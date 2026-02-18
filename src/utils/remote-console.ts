/**
 * Remote console logger — intercepts ALL browser console output
 * and sends it to the server for debugging.
 *
 * Captures: log, warn, error, info, debug, trace, dir, dirxml,
 *           table, assert, count, countReset, time, timeEnd, timeLog,
 *           group, groupEnd, clear
 * Also captures: uncaught errors, unhandled promise rejections
 *
 * Import this file once in main.tsx to activate.
 * Remove when debugging is done.
 */

const LEVELS = [
  'log',
  'warn',
  'error',
  'info',
  'debug',
  'trace',
  'dir',
  'dirxml',
  'table',
  'assert',
  'count',
  'countReset',
  'time',
  'timeEnd',
  'timeLog',
  'group',
  'groupCollapsed',
  'groupEnd',
  'clear',
] as const

type Level = (typeof LEVELS)[number]

const originals = Object.fromEntries(
  LEVELS.map((level) => {
    const fn = console[level]
    return [level, typeof fn === 'function' ? fn.bind(console) : null]
  }),
) as Record<Level, ((...args: unknown[]) => void) | null>

function serialize(arg: unknown): unknown {
  if (arg instanceof Error) {
    return { __error: true, message: arg.message, stack: arg.stack }
  }
  if (arg instanceof HTMLElement) {
    return `<${arg.tagName.toLowerCase()}${arg.id ? '#' + arg.id : ''}${arg.className ? '.' + String(arg.className).split(' ').join('.') : ''}>`
  }
  try {
    JSON.stringify(arg)
    return arg
  } catch {
    return String(arg)
  }
}

let queue: {
  level: string
  args: unknown[]
  timestamp: string
  url: string
}[] = []
let timer: ReturnType<typeof setTimeout> | null = null

function flush() {
  if (queue.length === 0) return
  const batch = queue
  queue = []
  timer = null

  for (const entry of batch) {
    fetch('/api/debug/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      // silently ignore — don't recurse
    })
  }
}

function enqueue(level: string, args: unknown[]) {
  queue.push({
    level,
    args: args.map(serialize),
    timestamp: new Date().toISOString(),
    url: location.href,
  })
  if (!timer) {
    timer = setTimeout(flush, 300)
  }
}

// Hook all console methods
for (const level of LEVELS) {
  const original = originals[level]
  if (!original) continue

  if (level === 'assert') {
    // console.assert only logs when the first arg is falsy
    console.assert = (condition?: boolean, ...args: unknown[]) => {
      original(condition, ...args)
      if (!condition) {
        enqueue('assert', ['Assertion failed:', ...args])
      }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(console as any)[level] = (...args: unknown[]) => {
      original(...args)
      enqueue(level, args)
    }
  }
}

// Capture uncaught errors
window.addEventListener('error', (event) => {
  enqueue('uncaught-error', [
    event.message,
    `at ${event.filename}:${event.lineno}:${event.colno}`,
    event.error?.stack,
  ])
})

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  enqueue('unhandled-rejection', [
    reason instanceof Error
      ? { message: reason.message, stack: reason.stack }
      : reason,
  ])
})

originals.log?.(
  '[remote-console] activated — ALL browser console output will be sent to server',
)
