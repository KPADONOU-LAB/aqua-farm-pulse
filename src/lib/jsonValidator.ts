/**
 * Utilitaire de validation et sanitisation JSON pour éviter les erreurs PostgreSQL
 */

export interface JsonValidationOptions {
  allowEmpty?: boolean;
  defaultValue?: any;
  strict?: boolean;
}

/**
 * Nettoie récursivement un objet pour le rendre sérialisable JSON
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (typeof obj === 'string') {
    return obj;
  }
  
  if (typeof obj === 'number') {
    return isNaN(obj) || !isFinite(obj) ? null : obj;
  }
  
  if (typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedValue = sanitizeObject(value);
      if (sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    }
    return sanitized;
  }
  
  // Filtrer les fonctions, undefined, etc.
  return undefined;
}

/**
 * Valide et nettoie les données JSON avant insertion en base
 */
export function validateAndSanitizeJson(
  data: any, 
  options: JsonValidationOptions = {}
): any {
  const { allowEmpty = true, defaultValue = {}, strict = false } = options;
  
  try {
    // Si les données sont déjà une chaîne, essayer de la parser
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (parseError) {
        if (strict) {
          throw new Error(`Invalid JSON string: ${parseError.message}`);
        }
        console.warn('Failed to parse JSON string, using default:', parseError);
        return defaultValue;
      }
    }
    
    // Nettoyer l'objet
    const sanitized = sanitizeObject(data);
    
    // Vérifier si le résultat est vide
    if (sanitized === null || sanitized === undefined) {
      return allowEmpty ? defaultValue : null;
    }
    
    // Test de sérialisation pour s'assurer que c'est du JSON valide
    const jsonString = JSON.stringify(sanitized);
    
    // Test de désérialisation pour s'assurer de la validité
    const reparsed = JSON.parse(jsonString);
    
    return sanitized;
    
  } catch (error) {
    if (strict) {
      throw new Error(`JSON validation failed: ${error.message}`);
    }
    
    console.error('JSON validation error:', error, 'Data:', data);
    return defaultValue;
  }
}

/**
 * Valide une chaîne JSON
 */
export function validateJsonString(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prépare les données pour une insertion/update Supabase
 */
export function prepareJsonForSupabase(data: any): any {
  return validateAndSanitizeJson(data, {
    allowEmpty: true,
    defaultValue: {},
    strict: false
  });
}

/**
 * Nettoie un objet pour s'assurer qu'il ne contient que des valeurs sérialisables
 */
export function ensureSerializable(obj: any): any {
  if (obj === null || obj === undefined) {
    return {};
  }
  
  const cleaned = sanitizeObject(obj);
  return cleaned || {};
}