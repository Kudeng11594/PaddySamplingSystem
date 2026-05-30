import { describe, it, expect } from 'vitest'
import {
  validatePhone, validateLicensePlate, validateVariety,
  validateDate, validateTime, validateMoisture, validateRiceYield,
  validatePassword, validateRole, validateDriverName, validateAppointmentInput,
} from '../utils/validation.js'

describe('validatePhone', () => {
  it('accepts valid 11-digit mobile numbers', () => expect(validatePhone('13800138000')).toBeNull())
  it('rejects short numbers', () => expect(validatePhone('1380013800')).not.toBeNull())
  it('rejects numbers with letters', () => expect(validatePhone('1380013800a')).not.toBeNull())
  it('rejects empty string', () => expect(validatePhone('')).not.toBeNull())
})

describe('validateLicensePlate', () => {
  it('accepts standard plates', () => expect(validateLicensePlate('辽A12345')).toBeNull())
  it('accepts new energy plates', () => expect(validateLicensePlate('沪A123456')).toBeNull())
  it('rejects invalid format', () => expect(validateLicensePlate('ABC123')).not.toBeNull())
  it('rejects empty', () => expect(validateLicensePlate('')).not.toBeNull())
})

describe('validateVariety', () => {
  it('accepts valid varieties', () => expect(validateVariety('中科发5')).toBeNull())
  it('rejects unknown varieties', () => expect(validateVariety('未知品种')).not.toBeNull())
})

describe('validateDate', () => {
  it('accepts YYYY-MM-DD', () => expect(validateDate('2026-05-22')).toBeNull())
  it('rejects wrong format', () => expect(validateDate('2026/05/22')).not.toBeNull())
  it('rejects empty', () => expect(validateDate('')).not.toBeNull())
})

describe('validateTime', () => {
  it('accepts HH:mm', () => expect(validateTime('08:30')).toBeNull())
  it('rejects wrong format', () => expect(validateTime('8:30')).not.toBeNull())
})

describe('validateMoisture', () => {
  it('accepts 12-20 range', () => { expect(validateMoisture(14.5)).toBeNull(); expect(validateMoisture(12)).toBeNull(); expect(validateMoisture(20)).toBeNull() })
  it('rejects below 12', () => expect(validateMoisture(11.9)).not.toBeNull())
  it('rejects above 20', () => expect(validateMoisture(20.1)).not.toBeNull())
})

describe('validateRiceYield', () => {
  it('accepts 55-65 range', () => { expect(validateRiceYield(60)).toBeNull(); expect(validateRiceYield(55)).toBeNull(); expect(validateRiceYield(65)).toBeNull() })
  it('rejects below 55', () => expect(validateRiceYield(54.9)).not.toBeNull())
  it('rejects above 65', () => expect(validateRiceYield(65.1)).not.toBeNull())
})

describe('validatePassword', () => {
  it('accepts 6+ characters', () => expect(validatePassword('123456')).toBeNull())
  it('rejects short passwords', () => expect(validatePassword('12345')).not.toBeNull())
})

describe('validateRole', () => {
  it('accepts admin', () => expect(validateRole('admin')).toBeNull())
  it('accepts operator', () => expect(validateRole('operator')).toBeNull())
  it('accepts manager', () => expect(validateRole('manager')).toBeNull())
  it('rejects unknown roles', () => expect(validateRole('superadmin')).not.toBeNull())
})

describe('validateDriverName', () => {
  it('accepts valid names', () => expect(validateDriverName('张三')).toBeNull())
  it('rejects empty', () => expect(validateDriverName('')).not.toBeNull())
  it('rejects whitespace-only', () => expect(validateDriverName('   ')).not.toBeNull())
})

describe('validateAppointmentInput', () => {
  it('returns no errors for valid input', () => {
    const errors = validateAppointmentInput({
      driverName: '张三', phone: '13800138000', licensePlate: '辽A12345',
      variety: '中科发5', appointmentDate: '2026-05-28', appointmentTime: '09:00',
    })
    expect(errors).toHaveLength(0)
  })
  it('returns errors for invalid input', () => {
    const errors = validateAppointmentInput({
      driverName: '', phone: 'bad', licensePlate: 'bad',
      variety: 'bad', appointmentDate: 'bad', appointmentTime: 'bad',
    })
    expect(errors.length).toBeGreaterThan(0)
  })
})
