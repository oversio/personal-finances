/**
 * Spanish translations for API error codes.
 * These map to the ErrorCodes defined in the API.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  "auth.invalid_credentials": "Credenciales inválidas",
  "auth.email_already_exists": "Este correo electrónico ya está registrado",
  "auth.token_expired": "Tu sesión ha expirado. Por favor, inicia sesión nuevamente",
  "auth.invalid_refresh_token": "Sesión inválida. Por favor, inicia sesión nuevamente",
  "auth.oauth_account_not_linked":
    "Esta cuenta no está vinculada. Por favor, inicia sesión con tu correo y contraseña",
  "auth.password_required": "Se requiere una contraseña para esta cuenta",

  // reCAPTCHA errors
  "recaptcha.verification_failed":
    "La verificación de seguridad falló. Por favor, intenta de nuevo",
  "recaptcha.token_missing":
    "Se requiere verificación de seguridad. Por favor, recarga la página e intenta de nuevo",

  // User errors
  "users.not_found": "Usuario no encontrado",
  "users.already_exists": "Este usuario ya existe",
  "users.invalid_email": "Correo electrónico inválido",

  // Workspace errors
  "workspaces.not_found": "Espacio de trabajo no encontrado",
  "workspaces.member_not_found": "Miembro no encontrado en este espacio de trabajo",
  "workspaces.user_already_member": "Este usuario ya es miembro del espacio de trabajo",
  "workspaces.access_denied": "No tienes acceso a este espacio de trabajo",
  "workspaces.limit_reached": "Has alcanzado el límite de espacios de trabajo",
  "workspaces.cannot_remove_owner": "No se puede eliminar al propietario del espacio de trabajo",
  "workspaces.cannot_change_owner_role": "No se puede cambiar el rol del propietario",
  "workspaces.insufficient_permissions": "No tienes permisos suficientes para realizar esta acción",
  "workspaces.user_not_found_by_email": "No se encontró un usuario con este correo electrónico",
  "workspaces.only_owner_can_delete": "Solo el propietario puede eliminar el espacio de trabajo",
  "workspaces.invitation_not_found": "Invitación no encontrada",
  "workspaces.invitation_expired": "Esta invitación ha expirado",
  "workspaces.invitation_already_accepted": "Esta invitación ya fue aceptada",
  "workspaces.invitation_revoked": "Esta invitación fue revocada",
  "workspaces.pending_invitation_exists": "Ya existe una invitación pendiente para este correo",
  "workspaces.invitation_email_mismatch": "Esta invitación fue enviada a otro correo electrónico",

  // Account errors
  "accounts.not_found": "Cuenta no encontrada",
  "accounts.insufficient_balance": "Saldo insuficiente",
  "accounts.already_exists": "Ya existe una cuenta con este nombre",

  // Transaction errors
  "transactions.not_found": "Transacción no encontrada",
  "transactions.invalid_amount": "Monto inválido",
  "transactions.invalid_date": "Fecha inválida",
  "transactions.transfer_requires_to_account": "Las transferencias requieren una cuenta de destino",
  "transactions.category_required": "Se requiere una categoría",
  "transactions.same_account_transfer": "No se puede transferir a la misma cuenta",

  // Category errors
  "categories.not_found": "Categoría no encontrada",
  "categories.in_use": "Esta categoría está en uso y no puede ser eliminada",
  "categories.already_exists": "Ya existe una categoría con este nombre",
  "categories.subcategory_not_found": "Subcategoría no encontrada",

  // Budget errors
  "budgets.not_found": "Presupuesto no encontrado",
  "budgets.exceeded": "Has excedido el presupuesto",
  "budgets.already_exists": "Ya existe un presupuesto para esta categoría",

  // Recurring transaction errors
  "recurring_transactions.not_found": "Transacción recurrente no encontrada",
  "recurring_transactions.invalid_frequency": "Frecuencia inválida",
  "recurring_transactions.invalid_interval": "Intervalo inválido",
  "recurring_transactions.invalid_schedule": "Programación inválida",
  "recurring_transactions.invalid_date_range": "Rango de fechas inválido",
  "recurring_transactions.already_paused": "Esta transacción recurrente ya está pausada",
  "recurring_transactions.already_active": "Esta transacción recurrente ya está activa",
  "recurring_transactions.transfer_not_allowed":
    "Las transferencias no están permitidas para transacciones recurrentes",

  // Generic entity errors
  "entity.not_found": "No encontrado",
  "entity.already_exists": "Ya existe",
  "entity.invalid_id": "ID inválido",

  // Validation errors
  "validation.required": "Este campo es requerido",
  "validation.min_length": "El texto es demasiado corto",
  "validation.max_length": "El texto es demasiado largo",
  "validation.invalid_format": "Formato inválido",
  "validation.invalid_email": "Correo electrónico inválido",
  "validation.invalid_url": "URL inválida",
  "validation.invalid_uuid": "ID inválido",
  "validation.invalid_number": "Número inválido",
  "validation.invalid_date": "Fecha inválida",
  "validation.too_small": "El valor es demasiado pequeño",
  "validation.too_big": "El valor es demasiado grande",
  "validation.invalid_type": "Tipo de dato inválido",
};

/**
 * Get translated error message for an error code.
 * Falls back to the original description if no translation exists.
 */
export function getErrorMessage(code: string, fallback: string): string {
  return ERROR_MESSAGES[code] ?? fallback;
}
