import { useEffect, useState } from "react";
import Accordion from "../../ui/Accordion";
import { fetchRequestById, updateRequestStatus } from "../../../services/requestsServices";
import { fetchFinalDocument } from "../../../services/permisosTransitoriosServices";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../../../utils/format";
import { API_URL } from "../../../constants/constants";
import Modal from "../../ui/Modal";
import StatusTag from "../../ui/StatusTag";
import { sendEmail } from "../../../services/emailServices";
import { renderTemplatePT } from "../../../email-templates/permisosTransitorios";
const RequestDetailPT = () => {

    const { id } = useParams()

    const [request, setRequest] = useState({})
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [rejectModal, setRejectModal] = useState(false)
    const [confirmRejectModal, setConfirmRejectModal] = useState(false)
    const [confirmApproveModal, setConfirmApproveModal] = useState(false)
    const [unsignedDoc, setUnsignedDoc] = useState(null)
    const [signedDoc, setSignedDoc] = useState(null)

    const navigate = useNavigate()

    const [modalInput, setModalInput] = useState("")

    useEffect(() => {
        (async () => {
            if (Object.values(request).length === 0) {
                const request = await fetchRequestById(id)
                setRequest(request)
                setStatus(request.estado)
            }
            if (!unsignedDoc) {
                const document = await fetchFinalDocument(id, 'sin firmar')
                setUnsignedDoc(document)
            }
            if (!signedDoc) {
                const document = await fetchFinalDocument(id, 'firmado')
                setSignedDoc(document)
            }
            setLoading(false)
        })()
    }, [id, unsignedDoc, request, signedDoc])


    // Obtener un documento por el nombre del campo
    const getDocByFieldname = (fieldname) => {
        if (!loading) {
            const doc = request.documentos.find(doc => doc.fieldname === `documentos[${fieldname}]`)
            return doc
        }
    }

    const approveRequest = () => {
        const requestInfo = {
            id: request.id,
            activity: request.respuestas.permissionName,
            orgName: request.respuestas.orgName,
            orgRut: request.respuestas.orgRut,
            presidentName: request.respuestas.presidentName,
            presidentRut: request.respuestas.presidentRut,
            startDate: request.respuestas.permissionStartDate,
            startTime: request.respuestas.permissionStartTime,
            endTime: request.respuestas.permissionEndTime,
            place: request.respuestas.permissionPlace
        }
        navigate("aprobar-solicitud", { state: requestInfo })
    }

    // Función para visualizar el decreto generado
    const handlePreviewUnsignedDoc = () => {
        window.open(`${API_URL}/${unsignedDoc.ruta}`, "_blank")
        console.log(unsignedDoc)
    }
    // Función para visualizar el decreto firmado
    const handlePreviewSignedDoc = () => {
        window.open(`${API_URL}/${signedDoc.ruta}`, "_blank")
        console.log(signedDoc)
    }

    // Abrir modal para rechazar solicitud de permiso
    const handleRejectRequest = () => {
        setRejectModal(true)
    }

    // Abrir modal de confirmación
    const openConfirmModal = () => {
        if (modalInput.trim().length > 3) {
            setRejectModal(false)
            setConfirmRejectModal(true)
        } else {
            alert("Debe ingresar un motivo para rechazar la solicitud")
        }
    }

    const openApproveModal = () => {
        setConfirmApproveModal(true)
    }

    // Enviar decreto firmado por correo electrónico
    const sendSignedDoc = async () => {
        const emails = [request.respuestas.orgEmail, request.respuestas.presidentEmail]
        const userName = `${request.usuario.nombres} ${request.usuario.apellidos}`
        const attachments = {
            filename: signedDoc?.nombre,
            path: `${API_URL}/${signedDoc?.ruta}`
        }
        try {
            await updateRequestStatus(request.id, "finalizada")
            await sendEmail(emails, "Solicitud de permiso transitorio: APROBADA", renderTemplatePT(userName, modalInput, 'Solicitud aprobada', 'aprobado'), attachments)
            alert("Se ha enviado el decreto")
        } catch (error) {
            console.log(error)
            throw new Error(`Ha ocurrido un error: ${error.message}`);
        }
        setStatus("finalizada")
        setConfirmApproveModal(false)
    }

    // Confirmar rechazo de solicitud
    const confirmReject = async () => {
        if (modalInput.trim().length > 3) {
            const emails = [request.respuestas.orgEmail, request.respuestas.presidentEmail]
            const userName = `${request.usuario.nombres} ${request.usuario.apellidos}`
            try {
                await updateRequestStatus(request.id, "rechazada")
                await sendEmail(emails, "Solicitud de permiso transitorio: RECHAZADA", renderTemplatePT(userName, modalInput, 'Solicitud rechazada', 'rechazado'))
                alert("Se ha rechazado la solicitud")
            } catch (error) {
                console.log(error)
                throw new Error(`Ha ocurrido un error: ${error.message}`);
            }
            setStatus("rechazada")
            setConfirmRejectModal(false)
        } else {
            alert("Debe ingresar un motivo para rechazar la solicitud")
        }
    }

    if (loading) {
        return
    }

    return (
        <div>
            <Modal
                title="Enviar decreto al solicitante"
                modal={confirmApproveModal}
                setModal={setConfirmApproveModal}
                onClick={sendSignedDoc}
                btnText="Enviar decreto"
            >
                <p>Se notificará al usuario por correo electrónico la aprobación de su solicitud y se adjuntará el decreto firmado.</p>
                <p>¿Seguro que desea enviar el decreto?</p>
            </Modal>
            <Modal
                title="Rechazar solicitud"
                modal={confirmRejectModal}
                setModal={setConfirmRejectModal}
                onClick={confirmReject}
                btnText="Rechazar solicitud"
            >
                <p>Se notificará al usuario por correo electrónico el motivo del rechazo</p>
                <p>¿Seguro que desea rechazar esta solicitud?</p>
            </Modal>
            <Modal
                title="Rechazar solicitud"
                modal={rejectModal}
                setModal={setRejectModal}
                onClick={openConfirmModal}
                btnText="Rechazar solicitud"
            >
                <p className="mb-1">Escriba el motivo por el cual rechaza la solicitud</p>
                <textarea value={modalInput} onChange={(e) => { setModalInput(e.target.value) }} className="p-1 border border-slate-600 rounded w-full resize-none" />
            </Modal>
            <div className="flex items-center gap-5">
                <h1 className="text-2xl font-bold">Solicitud de permiso transitorio #{request.id}</h1>
                <StatusTag status={status} />
            </div>
            <p className="text-slate-500"><strong>Fecha de solicitud:</strong> {formatDate(request.createdAt, 1)}</p>
            {(status === "pendiente" || status === "en revision") && <div className="flex items-center gap-4 my-4">
                <button onClick={handleRejectRequest} className="bg-red-300 hover:bg-red-200 text-red-800 py-2 px-5 rounded">Rechazar solicitud</button>
                <button onClick={approveRequest} className="bg-amber-300 hover:bg-amber-200 text-amber-800 py-2 px-5 rounded">Generar decreto</button>
            </div>}
            {status === "por firmar" && <div className="flex items-center gap-4 my-4">
                <button onClick={handleRejectRequest} className="bg-red-300 hover:bg-red-200 text-red-800 py-2 px-5 rounded">Rechazar solicitud</button>
                <button onClick={handlePreviewUnsignedDoc} className="bg-blue-300 hover:bg-blue-200 text-blue-800 py-2 px-5 rounded">Descargar decreto</button>
                <Link to="subir-decreto-firmado" className="bg-amber-300 hover:bg-amber-200 text-amber-800 py-2 px-5 rounded">Subir decreto firmado</Link>
            </div>}
            {status === "aprobada" && <div className="flex items-center gap-4 my-4">
                <button onClick={handlePreviewUnsignedDoc} className="bg-blue-300 hover:bg-blue-200 text-blue-800 py-2 px-5 rounded">Descargar decreto sin firma</button>
                <button onClick={handlePreviewSignedDoc} className="bg-violet-300 hover:bg-violet-200 text-violet-800 py-2 px-5 rounded">Descargar decreto firmado</button>
                <button onClick={openApproveModal} className="bg-green-300 hover:bg-green-200 text-green-800 py-2 px-5 rounded">Enviar decreto</button>
            </div>}
            {status === "finalizada" && <div className="flex items-center gap-4 my-4">
                <button onClick={handlePreviewUnsignedDoc} className="bg-blue-300 hover:bg-blue-200 text-blue-800 py-2 px-5 rounded">Descargar decreto sin firma</button>
                <button onClick={handlePreviewSignedDoc} className="bg-violet-300 hover:bg-violet-200 text-violet-800 py-2 px-5 rounded">Descargar decreto firmado</button>
            </div>}
            <div className="mt-4">
                <h2 className="text-xl mb-2 font-semibold">Información del solicitante</h2>
                <div className=" bg-[#fff] p-4 shadow rounded">
                    <p>Nombre: {request.usuario.nombres} {request.usuario.apellidos}</p>
                    <p>RUT: {request.usuario.run}</p>
                </div>
            </div>
            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-2">Datos de la solicitud</h2>
                <Accordion title="1. Datos de la organización">
                    <div className="grid grid-cols-2">
                        <p><strong>Nombre o razón social:</strong> {request.respuestas.orgName}</p>
                        <p><strong>RUT de la organización:</strong> {request.respuestas.orgRut}</p>
                        <p><strong>Domicilio:</strong> {request.respuestas.orgAddress}</p>
                        <p><strong>Correo electrónico:</strong> {request.respuestas.orgEmail}</p>
                        <p><strong>Teléfono:</strong> {request.respuestas.orgPhone}</p>
                        <p><strong>Tipo de organización:</strong> {request.respuestas.orgType}</p>
                    </div>
                </Accordion>
                <Accordion title="2. Datos del representante legal">
                    <div className="grid grid-cols-2">
                        <p><strong>Nombre Completo:</strong> {request.respuestas.presidentName}</p>
                        <p><strong>RUT:</strong> {request.respuestas.presidentRut}</p>
                        <p><strong>Domicilio:</strong> {request.respuestas.presidentAddress}</p>
                        <p><strong>Correo electrónico:</strong> {request.respuestas.presidentEmail}</p>
                        <p><strong>Teléfono:</strong> {request.respuestas.presidentPhone}</p>
                        <p><strong>Teléfono 2:</strong> {request.respuestas.presidentPhone2 === "NaN" ? "No indica" : request.respuestas.presidentPhone2}</p>
                    </div>
                </Accordion>
                <Accordion title="3. Detalles del permiso">
                    <div className="grid grid-cols-2">
                        <p><strong>Nombre de la actividad:</strong> {request.respuestas.permissionName}</p>
                        <p><strong>Lugar de realización:</strong> {request.respuestas.permissionPlace}</p>
                        <p><strong>Fecha de inicio:</strong> {formatDate(request.respuestas.permissionStartDate, 1)}, {request.respuestas.permissionStartTime}</p>
                        <p><strong>Fecha de término:</strong> {formatDate(request.respuestas.permissionEndDate, 1)}, {request.respuestas.permissionEndTime}</p>
                        <p><strong>Consumo y/o venta de bebidas alcohólicas:</strong> {request.respuestas.permissionAlcohol === "true" ? "Si" : "No"}</p>
                        <p><strong>Consumo y/o venta de alimentos:</strong> {request.respuestas.permissionFood === "true" ? "Si" : "No"}</p>
                        <p><strong>Descripción de la actividad:</strong> {request.respuestas.permissionDescription}</p>
                        <p><strong>Destino de los fondos:</strong> {request.respuestas.permissionPurpose}</p>
                    </div>
                </Accordion>
                <Accordion title="4. Antecedentes">
                    <ul className="list-disc list-inside text-blue-700 underline">
                        <li><a target="_blank" href={`${API_URL}/${getDocByFieldname("docCI").path}`}>Cédula de identidad del representante legal</a></li>
                        <li><a target="_blank" href={`${API_URL}/${getDocByFieldname("docRutTributario").path}`}>RUT tributario</a></li>
                        <li><a target="_blank" href={`${API_URL}/${getDocByFieldname("docCertificadoAntecedentes").path}`}>Certificado de antecedentes para fines especiales</a></li>
                        <li><a target="_blank" href={`${API_URL}/${getDocByFieldname("docVigenciaPersonaJuridica").path}`}>Certificado de vigencia de Persona Jurídica</a></li>
                        <li><a target="_blank" href={`${API_URL}/${getDocByFieldname("docOcupacionRecinto").path}`}>Documento que acredita la ocupación legal del recinto</a></li>
                        <li><a target="_blank" href={`${API_URL}/${getDocByFieldname("docDeclaracionJurada").path}`}>Declaración jurada simple Ley 19.925 de alcoholes</a></li>
                        <li><a target="_blank" href={`${API_URL}/${getDocByFieldname("docFirmaPresidente").path}`}>Documento con firma del presidente</a></li>
                    </ul>
                </Accordion>
            </div>
        </div>
    )
}

export default RequestDetailPT