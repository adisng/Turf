import assert from 'node:assert/strict'
import test from 'node:test'

import { BOOKING_STATUSES } from '../lib/types'

test('booking status mutation accepts only the supported statuses', () => {
  assert.deepEqual(BOOKING_STATUSES, ['pending', 'confirmed', 'completed', 'cancelled'])
  assert.equal(BOOKING_STATUSES.includes('confirmed'), true)
  assert.equal(BOOKING_STATUSES.includes('refunded' as never), false)
})
