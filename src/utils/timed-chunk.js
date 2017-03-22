// Copyright 2009 Nicholas C. Zakas. All rights reserved.
// MIT Licensed
export default function timedChunk (items, process, processContext, callback, callbackContext) {
  return new Promise(resolve => {
    let todo = items.slice() // create a clone of the original

    let exec = function () {
      let start = Date.now()

      do {
        process.call(processContext, todo.shift())
      } while (todo.length > 0 && (Date.now() - start < 50))

      if (todo.length > 0) {
        setTimeout(exec, 25)
      } else {
        if (typeof callback === 'function') {
          callback.call(callbackContext, items)
        }
        resolve(items)
      }
    }

    if (todo.length) {
      setTimeout(exec, 25)
    } else {
      resolve(items)
    }
  })
}
