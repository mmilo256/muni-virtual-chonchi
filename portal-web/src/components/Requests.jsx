import { useEffect, useState } from "react"  // Importa hooks de React
import Container from "./ui/Container"  // Componente para envolver el contenido con un contenedor
import Heading from "./ui/Heading"  // Componente de encabezado
import { fetchRequestsByRut } from "../services/requestsServices"  // Función para obtener las solicitudes desde el backend
import BaseTable from "./ui/BaseTable"  // Componente para mostrar una tabla con los datos
import StatusTag from "./ui/StatusTag"  // Componente para mostrar el estado de una solicitud de forma estilizada
import { formatDate } from "../utils/utils"  // Función para formatear la fecha de la solicitud
import { Link } from "react-router-dom"  // Componente de Link para la navegación

const Requests = () => {

    // Obtener los datos del usuario desde el sessionStorage
    const user = JSON.parse(sessionStorage.getItem('session'))
    const rut = `${user.run.numero}-${user.run.DV}`  // Construye el RUT completo del usuario

    // Estados para almacenar las solicitudes y el estado de carga
    const [requests, setRequests] = useState([])  // Almacena las solicitudes del usuario
    const [loading, setLoading] = useState(true)  // Controla el estado de carga

    // Efecto para obtener las solicitudes cuando el componente se monta
    useEffect(() => {
        (async () => {
            // Llama al servicio para obtener las solicitudes del usuario por RUT
            const data = await fetchRequestsByRut(rut)
            // Formatea los datos obtenidos para mostrarlos en la tabla
            const formattedData = data.solicitudes.map((solicitud) => ({
                id: solicitud.id,  // ID de la solicitud
                tramite: solicitud.tramite.titulo,  // Título del trámite
                fecha: formatDate(solicitud.createdAt, 2),  // Fecha de la solicitud formateada
                estado: <StatusTag status={solicitud.estado} />,  // Muestra el estado con el componente StatusTag
                acciones: <Link to={`${solicitud.id}`} className="text-blue-500 underline">Seguimiento</Link>  // Enlace para ver el seguimiento de la solicitud
            }))
            // Ordena las solicitudes por ID de forma descendente
            formattedData.sort((a, b) => b.id - a.id)
            setRequests(formattedData)  // Guarda las solicitudes formateadas en el estado
            setLoading(false)  // Establece que la carga ha finalizado
        })()
    }, [rut])  // Solo se vuelve a ejecutar cuando cambia el RUT

    // Definición de las columnas y datos de la tabla
    const table = {
        columns: ['ID', 'Trámite', 'Fecha de solicitud', 'Estado', 'Acciones'],  // Encabezados de la tabla
        data: requests  // Datos de las solicitudes
    }

    // Si los datos están cargando, no muestra nada
    if (loading) {
        return null
    }

    return (
        <Container>  {/* Contenedor del componente */}
            <Heading level={2}>Solicitudes realizadas</Heading>  {/* Título de la página */}
            <BaseTable table={table} />  {/* Componente de tabla para mostrar las solicitudes */}
        </Container>
    )
}

export default Requests
