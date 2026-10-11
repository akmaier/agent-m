// errors.mjs — a failure of MOD-mail-routes: an error with the name the module file gives it and its fields.
//
// Module: MOD-mail-routes

export function failure(name, fields, message) {
  return Object.assign(new Error(message), { name }, fields);
}
