export default function (fn) {
  return async function (...args) {
    if (fn._execPromise) {
      await fn._execPromise
    }
    fn._execPromise = Promise.resolve(this::fn(...args))
    const res = await fn._execPromise
    delete fn._execPromise
    return res
  }
}
