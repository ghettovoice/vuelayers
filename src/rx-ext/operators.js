import { debounceTime, map, tap } from 'rxjs/operators'

export function bufferDebounceTime (time = 0) {
  return source => {
    let bufferedValues = []

    return source.pipe(
      tap(value => bufferedValues.push(value)),
      debounceTime(time),
      map(() => bufferedValues),
      tap(() => { bufferedValues = [] }),
    )
  }
}
