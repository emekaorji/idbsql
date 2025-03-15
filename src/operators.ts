/**
 * SQL operators for query conditions
 */

/**
 * Equal operator
 */
export function eq(field: any, value: any) {
  return { type: 'eq', field, value };
}

/**
 * Not equal operator
 */
export function ne(field: any, value: any) {
  return { type: 'ne', field, value };
}

/**
 * Greater than operator
 */
export function gt(field: any, value: any) {
  return { type: 'gt', field, value };
}

/**
 * Greater than or equal operator
 */
export function gte(field: any, value: any) {
  return { type: 'gte', field, value };
}

/**
 * Less than operator
 */
export function lt(field: any, value: any) {
  return { type: 'lt', field, value };
}

/**
 * Less than or equal operator
 */
export function lte(field: any, value: any) {
  return { type: 'lte', field, value };
}

/**
 * Is null operator
 */
export function isNull(field: any) {
  return { type: 'isNull', field };
}

/**
 * Is not null operator
 */
export function isNotNull(field: any) {
  return { type: 'isNotNull', field };
}

/**
 * In array operator
 */
export function inArray(field: any, values: any[]) {
  return { type: 'inArray', field, values };
}

/**
 * Not in array operator
 */
export function notInArray(field: any, values: any[]) {
  return { type: 'notInArray', field, values };
}

/**
 * Like operator
 */
export function like(field: any, pattern: string) {
  return { type: 'like', field, pattern };
}

/**
 * Between operator
 */
export function between(field: any, lower: any, upper: any) {
  return { type: 'between', field, lower, upper };
}
