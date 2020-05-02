import { interval as intervalObs, NEVER as NEVER_OBS, race as raceObs, throwError as throwErrorObs } from 'rxjs'
import {
  catchError as catchErrorObs,
  first as firstObs,
  skipUntil as skipUntilObs,
  skipWhile as skipWhileObs,
  switchMap as switchMapObs,
  timeout as timeoutObs,
} from 'rxjs/operators'
import { isFunction, negate } from './minilo'

export class WaitCancelError extends Error {
  name = 'WaitCancelError'
}

export class WaitTimeoutError extends Error {
  name = 'WaitTimeoutError'
}

/**
 * @param {function|Observable} condition
 * @param {function|Observable} [breakOn]
 * @param {number} [timeout]
 * @returns {Promise<boolean>}
 */
export default function waitFor (condition, breakOn, timeout) {
  const defCond = x => !x
  const success = intervalObs(1000 / 60).pipe(
    isFunction(condition)
      ? skipWhileObs(negate(condition))
      : skipUntilObs(condition.pipe(skipWhileObs(defCond))),
    firstObs(),
  )
  let failed = NEVER_OBS
  if (breakOn) {
    failed = intervalObs(1000 / 60).pipe(
      isFunction(breakOn)
        ? skipWhileObs(negate(breakOn))
        : skipUntilObs(breakOn.pipe(skipWhileObs(defCond))),
      firstObs(),
      switchMapObs(() => throwErrorObs(new WaitCancelError('wait canceled'))),
    )
  }
  let obs = raceObs(success, failed)
  if (timeout > 0) {
    obs = obs.pipe(timeoutObs(timeout))
  }
  return obs.pipe(
    catchErrorObs(err => {
      if (err.name === 'TimeoutError') {
        err = new WaitTimeoutError('wait timed out')
      }
      throw err
    }),
  ).toPromise(Promise)
}
