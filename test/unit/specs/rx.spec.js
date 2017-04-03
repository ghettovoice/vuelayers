import sinon from 'sinon'
import OlObject from 'ol/object'
import { identity } from 'lodash/fp'
import Observable from '../../../src/rx'

describe('RxJS extensions', () => {
  describe('fromOlEvent', () => {
    let olMock = new OlObject()
    beforeEach(() => {
      sinon.spy(olMock, 'on')
      sinon.spy(olMock, 'un')
    })
    afterEach(() => {
      olMock.on.restore()
      olMock.un.restore()
    })

    it('should return observable', () => {
      const observable = Observable.fromOlEvent(olMock, 'click')

      expect(observable).to.be.instanceof(Observable)
    })

    it('should subscribe/unsubscribe to event', () => {
      Observable.fromOlEvent(olMock, 'click')
        .subscribe()
        .unsubscribe()

      expect(olMock.on).have.been.calledOnce
      expect(olMock.un).have.been.calledOnce
    })

    it('should map value through provided selector', done => {
      const selector = sinon.spy(evt => evt.type)
      const subs = Observable.fromOlEvent(olMock, 'click', selector)
        .subscribe(
          type => {
            expect(type).to.be.equal('click')
          },
          done
        )

      olMock.dispatchEvent({ type: 'click' })
      olMock.dispatchEvent({ type: 'click' })

      setTimeout(() => {
        subs.unsubscribe()

        expect(selector).have.been.calledTwice
        expect(olMock.on).have.been.calledOnce
        expect(olMock.un).have.been.calledOnce

        done()
      }, 100)
    })

    it('should subscribe to multiple events', done => {
      const selector = sinon.spy(identity)
      const observable = Observable.fromOlEvent(olMock, [
        'click',
        {
          event: 'move'
        },
        {
          event: 'dblclick',
          selector
        }
      ])

      expect(observable).to.be.instanceof(Observable)

      const subs = observable.subscribe(
        evt => {
          expect(evt).to.be.an('object')
          expect([ 'move', 'click', 'dblclick' ]).to.include(evt.type)
        },
        done
      )

      olMock.dispatchEvent({ type: 'move' })
      olMock.dispatchEvent({ type: 'click' })
      olMock.dispatchEvent({ type: 'click' })
      olMock.dispatchEvent({ type: 'dblclick' })

      setTimeout(() => {
        subs.unsubscribe()

        expect(selector).have.been.calledOnce
        expect(olMock.on).have.been.calledThrice
        expect(olMock.un).have.been.calledThrice

        done()
      }, 100)
    })
  })
})
