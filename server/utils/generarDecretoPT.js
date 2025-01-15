// Librería para generar un documento a partir de una plantilla
import Docxtemplater from "docxtemplater";
// Librería para cargar los archivos docx/pptx/xlsx en memoria
import PizZip from "pizzip";

// Utilidades del sistema de archivos integradas
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url); // Obtener la URL del archivo actual
const __dirname = dirname(__filename); // Obtener el directorio del archivo actual

// Función para generar el decreto a partir de la plantilla
export const generarDecretoPT = (data) => {
    // 1. Cargar el archivo .docx como contenido binario desde la plantilla
    const content = readFileSync(
        resolve(__dirname, "../templates/decreto_permisoTransitorio.docx"), // Ruta de la plantilla
        "binary" // Leer el archivo como binario
    );

    // 2. Descomprimir el .docx en memoria (recordar que los archivos .docx son archivos comprimidos .zip)
    const zip = new PizZip(content); // Descomprimir el contenido en memoria

    // 3. Crear una instancia de Docxtemplater utilizando el archivo descomprimido
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true, // Permitir el bucle de párrafos para reemplazar contenido dinámico
        linebreaks: true, // Manejar correctamente los saltos de línea
    });

    // 4. Renderizar el documento, ingresando los datos dinámicos (proporcionados por 'data')
    doc.render(data); // Reemplazar las variables en la plantilla con los valores de 'data'

    // 5. Generar el archivo de salida como un buffer .zip comprimido
    const buf = doc.getZip().generate({
        type: "nodebuffer", // Generar como buffer de Node.js
        compression: "DEFLATE" // Comprimir el archivo con el algoritmo DEFLATE
    });

    // 6. Preparar los datos del archivo generado (nombre y ruta)
    const filename = `${Date.now()}_DECRETO_PT.docx`; // Generar un nombre único basado en el timestamp
    const fileData = {
        filename, // Nombre del archivo
        path: `decretos\\permisos-transitorios\\${filename}` // Ruta del archivo en el sistema
    };

    // 7. Escribir el archivo generado en el sistema de archivos
    writeFileSync(resolve(resolve(__dirname, '../decretos/permisos-transitorios'), fileData.filename), buf);
    // El archivo se guarda en la ruta especificada en el sistema de archivos

    // 8. Retornar los datos del archivo generado (nombre y ruta)
    return fileData; // Devolver la información del archivo para su posterior uso
}
