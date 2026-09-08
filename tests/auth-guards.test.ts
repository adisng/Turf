import assert from 'node:assert/strict'
import test from 'node:test'

import { getLoginRedirect, isAdminRole } from '../lib/auth/guards'

test('unauthenticated users receive a login redirect with the original path', () => {
  assert.equal(getLoginRedirect(null, '/admin'), '/login?next=%2Fadmin')
  assert.equal(getLoginRedirect({ id: 'user-1' }, '/dashboard'), null)
})

test('only the exact admin role is authorized', () => {
  assert.equal(isAdminRole('admin'), true)
  assert.equal(isAdminRole('customer'), false)
  assert.equal(isAdminRole('ADMIN'), false)
  assert.equal(isAdminRole(undefined), false)
})
