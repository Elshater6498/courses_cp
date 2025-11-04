/**
 * RTL (Right-to-Left) Utility Functions
 *
 * These utilities help determine text direction for multilingual forms,
 * particularly for Arabic (.ar) and Hebrew (.he) fields.
 */

/**
 * Checks if a field name indicates an RTL language (Arabic or Hebrew)
 * @param name - The field name (e.g., "name.ar", "description.he", "title_ar")
 * @returns true if the field is for Arabic or Hebrew, false otherwise
 */
export const isRTLField = (name?: string): boolean => {
  if (!name) return false;

  // Check for dot notation (e.g., "name.ar", "description.he")
  if (name.endsWith('.ar') || name.endsWith('.he')) {
    return true;
  }

  // Check for underscore notation (e.g., "title_ar", "description_he")
  if (name.endsWith('_ar') || name.endsWith('_he')) {
    return true;
  }

  return false;
};

/**
 * Gets the text direction based on field name
 * @param name - The field name
 * @returns "rtl" for Arabic/Hebrew fields, "ltr" for all others
 */
export const getTextDirection = (name?: string): 'rtl' | 'ltr' => {
  return isRTLField(name) ? 'rtl' : 'ltr';
};

/**
 * Gets the text alignment based on field name
 * @param name - The field name
 * @returns "right" for Arabic/Hebrew fields, "left" for all others
 */
export const getTextAlignment = (name?: string): 'left' | 'right' => {
  return isRTLField(name) ? 'right' : 'left';
};
