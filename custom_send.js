/**
 * Encapsula la logica relacionada con Supabase y utilidades de envio.
 * Objetivo: mantener la comunicacion con la base de datos separada
 * del codigo de la UI (formulario, validaciones, etc.).
 *
 * Nota para estudiantes: la clave que se usa aquí es una "publishable"
 * (de cliente). En producción conviene mover operaciones sensibles
 * a un servidor para no exponer claves privadas.
 */

// ===== CONEXIÓN SUPABASE =====
// URL y KEY: usadas para crear el cliente de Supabase.
// Exportamos el cliente en `window.sb` para que otros scripts en la
// página (ej. `landing_custom.js`) puedan llamar a funciones que
// interactúan con la tabla `waitlist`.
const SUPABASE_URL = 'https://ijoemnetxbztbxurkzri.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iKlWYxKf--3LOGk1iE9oSQ_1V3d6x19';
window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== DETECTAR PAÍS POR IP =====
/**
 * getCountry()
 * - Llama a un servicio externo (`ipapi.co`) para obtener la información
 *   geográfica aproximada basada en la IP del visitante.
 * - Devuelve `country_name` o `null` si falla.
 * - No es crítica: si falla simplemente se guarda `null` en la DB.
 */
window.getCountry = async function getCountry() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return data.country_name || null;
  } catch (err) {
    console.error('No se pudo detectar el país:', err);
    return null;
  }
};

// ===== FUNCIÓN PÚBLICA: Enviar datos a la tabla waitlist =====
/**
 * sendWaitlist({ nombre, correo })
 * - Funcion de alto nivel que usa `getCountry()` y el cliente `sb`
 *   para insertar un registro en la tabla `waitlist`.
 * - Retorna el resultado de la inserción (objeto con `data` y/o `error`).
 * - Uso desde la UI: `await window.sendWaitlist({ nombre, correo })`.
 * - Esta función centraliza el envío para mantener `landing_custom.js`
 *   limpio y enfocado en la interacción con el usuario.
 */
window.sendWaitlist = async function sendWaitlist({ nombre, correo }) {
  try {
    const pais = await window.getCountry();
    // Insertamos un objeto con los campos esperados por la tabla.
    return await window.sb.from('waitlist').insert([{ nombre, correo, pais }]);
  } catch (err) {
    // Devolvemos un objeto con `error` para que el llamante lo procese.
    console.error('Error enviando a waitlist:', err);
    return { error: err };
  }
};
