/*
 * Copyright 2026   Digital Clever Solution Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { spawn, exec, ChildProcessWithoutNullStreams } from 'node:child_process'
import util from 'node:util'
import log from 'electron-log/node'
import { EventEmitter } from 'node:events'
import * as rfs from 'rotating-file-stream'

const execPromise = util.promisify(exec)
export enum StatusResult {
  success = 'success',
  fail = 'fail'
}

type Options = {
  binPath: string
  args: string[]
  logPath: string
  logName: string
}

class Child extends EventEmitter {
  child: ChildProcessWithoutNullStreams | null = null

  readonly binPath: string
  readonly args: string[]
  readonly logPath: string
  readonly logName: string
  private startedAt: number | null = null

  constructor(options: Options) {
    super()
    this.binPath = options.binPath
    this.args = options.args
    this.logPath = options.logPath
    this.logName = options.logName
    log.debug('child:constructed', {
      binPath: this.binPath,
      argsCount: this.args.length,
      logName: this.logName
    })
  }

  public isRunning(): boolean {
    return !!this.child
  }

  public async start(): Promise<StatusResult> {
    log.debug('child:start-requested', {
      binPath: this.binPath,
      argsCount: this.args.length,
      logName: this.logName
    })
    const logStream = rfs.createStream(this.logName, {
      size: '1000M',
      interval: '1d',
      compress: 'gzip',
      maxFiles: 20,
      path: this.logPath
    })

    this.child = spawn(this.binPath, this.args)
    this.startedAt = Date.now()

    this.child.stdout.pipe(logStream)
    this.child.stderr.pipe(logStream)

    this.child.on('spawn', () => {
      log.info('child:spawned', {
        binPath: this.binPath,
        pid: this.child ? this.child.pid : null
      })
      this.emit('start', this.child ? this.child.pid : null)
    })
    this.child.on('end', () => {
      logStream.end(() => {})
    })
    this.child.on('close', (code, signal) => {
      const uptimeMs = this.startedAt ? Date.now() - this.startedAt : null
      log.info('child:closed', {
        binPath: this.binPath,
        code,
        signal,
        uptimeMs
      })
      this.child = null
      this.startedAt = null
      this.emit('stop')
    })

    if (this.child.pid) return Promise.resolve(StatusResult.success)

    return await new Promise((resolve, reject) => {
      let count = 0
      const interval = setInterval(() => {
        if (!this.child) {
          log.error('child:start-failed', { binPath: this.binPath, reason: 'child-null' })
          return reject(StatusResult.fail)
        }
        if (this.child.pid) {
          clearInterval(interval)
          return resolve(StatusResult.success)
        }
        count++
        if (count > 10) {
          clearInterval(interval)
          log.error('child:start-timeout', { binPath: this.binPath })
          return reject(StatusResult.fail)
        }
      }, 500)
    })
  }

  public stop(): Promise<StatusResult> {
    return new Promise((resolve) => {
      if (!this.child) {
        return resolve(StatusResult.success)
      }
      this.child.once('close', (code) => {
        log.info('child:stop-complete', {
          binPath: this.binPath,
          code
        })
        // this.child = null
        resolve(StatusResult.success)
      })
      log.debug('child:stop-requested', {
        binPath: this.binPath,
        pid: this.child.pid
      })
      this.child.kill()
    })
  }
  public getPid() {
    if (!this.child) {
      return undefined
    }
    return this.child.pid
  }
  public async exec() {
    const startedAt = Date.now()
    try {
      const result = await execPromise(`${this.binPath} ${this.args.join(' ')}`)
      log.debug('child:exec-success', {
        binPath: this.binPath,
        durationMs: Date.now() - startedAt
      })
      return result
    } catch (error) {
      log.error('child:exec-failed', {
        binPath: this.binPath,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

export default Child
