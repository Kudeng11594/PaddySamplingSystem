export interface ValidationError {
  field: string
  message: string
}

export function validatePhone(phone: string): string | null {
  return /^1\d{10}$/.test(phone) ? null : '手机号格式不正确'
}

export function validateLicensePlate(plate: string): string | null {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-Z][A-HJ-NP-Z0-9]{5,6}$/.test(plate)
    ? null : '车牌号格式不正确'
}

const VARIETIES = ['中科发5', '吉宏6', '鲜食玉米', '杂粮']
export function validateVariety(variety: string): string | null {
  return VARIETIES.includes(variety) ? null : '品种不在允许范围内'
}

export function validateDate(date: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? null : '日期格式不正确（YYYY-MM-DD）'
}

export function validateTime(time: string): string | null {
  return /^\d{2}:\d{2}$/.test(time) ? null : '时间格式不正确（HH:mm）'
}

export function validateMoisture(value: number): string | null {
  return value >= 12 && value <= 20 ? null : '水分范围 12%-20%'
}

export function validateRiceYield(value: number): string | null {
  return value >= 55 && value <= 65 ? null : '出米率范围 55%-65%'
}

export function validatePassword(password: string): string | null {
  return password.length >= 6 ? null : '密码最少 6 位'
}

const ROLES = ['admin', 'operator', 'manager']
export function validateRole(role: string): string | null {
  return ROLES.includes(role) ? null : '角色无效'
}

export function validateAppointmentInput(data: any): ValidationError[] {
  const errors: ValidationError[] = []
  const checks: [string, any, (v: any) => string | null][] = [
    ['phone', data.phone, validatePhone],
    ['licensePlate', data.licensePlate, validateLicensePlate],
    ['variety', data.variety, validateVariety],
    ['appointmentDate', data.appointmentDate, validateDate],
    ['appointmentTime', data.appointmentTime, validateTime],
  ]
  for (const [field, value, fn] of checks) {
    const err = fn(value)
    if (err) errors.push({ field, message: err })
  }
  return errors
}
