# Emerge Extension

Esta es la extensión de navegador para el proyecto "Emerge". Es la interfaz de usuario que:
1.  Analiza el historial de navegación local del usuario para identificar su "burbuja de filtros".
2.  Se comunica con el `emerge-backend` para obtener una recomendación de contenido novedoso.
3.  Muestra la recomendación al usuario en un popup.

## Stack de Tecnología

- **Lenguajes**: HTML, CSS, JavaScript (Vanilla JS)
- **APIs de Navegador**: `chrome.history`, `fetch`

## Configuración en el Navegador

Para instalar y probar la extensión en un navegador basado en Chromium (como Google Chrome, Brave, o Edge):

1.  **Abrir la Página de Extensiones**: Navega a `chrome://extensions`.

2.  **Activar el Modo Desarrollador**: Asegúrate de que el interruptor de "Modo de desarrollador" en la esquina superior derecha esté activado.

3.  **Cargar la Extensión**:
    - Haz clic en el botón "Cargar descomprimida" (Load unpacked).
    - Se abrirá un selector de archivos. Selecciona la carpeta completa de `emerge-extension`.

4.  **Fijar la Extensión**: Es recomendable hacer clic en el ícono de rompecabezas en la barra de herramientas del navegador y luego en el pin (chincheta) junto a "Emerge" para que su ícono sea siempre visible.

## Conexión con el Backend

- La lógica para comunicarse con el backend se encuentra en `popup.js`.
- Por defecto, está configurada para conectarse al servidor de desarrollo local en `http://localhost:3000`.
- Para que la conexión funcione, el `emerge-backend` debe estar corriendo localmente.

**Nota**: Si necesitas cambiar la URL del backend (por ejemplo, para apuntar a un servidor de producción), debes modificar la URL en la función `fetch` dentro de `popup.js`.
