import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import useFormsStore from "../../stores/useFormsStore"
import Form from "../ui/Form"
// import { sendRequest } from "../../services/requestsServices"
// import { PROCEDURES_ID } from "../../constants/constants"
import { fetchUserId } from "../../services/userServices"
import AntecedentesPermisosTransitorios from "./AntecedentesPermisosTransitorios"
import ConfirmarFormularioPT from "./ConfirmarFormularioPT"
// import usePermisosTransitoriosStore from "../../stores/usePermisosTransitoriosStore"

/* 
PASOS
1. Datos organización
2. Datos representante legal
3. Detalles permiso
4. Antecedentes
5. Confirmación de los datos
*/
const FIRST_STEP = 1
const LAST_STEP = 5
const TITLE = "Solicitud de Autorización Especial Transitoria"

const FormularioPermisosTransitorios = () => {
    // Inputs
    const inputs = useFormsStore(state => state.inputs)

    // Respuestas formulario
    /* const formData = usePermisosTransitoriosStore(state => state.formData)
    const setFormData = usePermisosTransitoriosStore(state => state.setFormData) */
    const [formData, setFormData] = useState({})

    // ID del usuario
    const [userId, setUserId] = useState(null)

    // Pasos del formulario
    const [step, setStep] = useState(FIRST_STEP)

    // Hook para navegación
    const navigate = useNavigate()

    // Obtener RUT del usuario
    const sessionInfo = JSON.parse(sessionStorage.getItem('session'))
    const userRut = `${sessionInfo.run.numero}-${sessionInfo.run.DV}`

    // Obtener ID del usuario en la base de datos
    useEffect(() => {
        (async () => {
            const data = await fetchUserId(userRut)
            setUserId(data)
        })()
    }, [userRut])

    const nextStep = (data) => {
        setFormData(prev => ({ ...prev, ...data }))
        if (step < LAST_STEP) {
            setStep(prev => prev + 1)
        }
    }
    const prevStep = () => {
        if (step > FIRST_STEP) {
            setStep(prev => prev - 1)
        } else {
            navigate("/permisos-transitorios")
        }
    }

    // Campos paso 1
    const inputsOrgData = inputs.slice(0, 6)
    // Campos paso 2
    const inputsPresidentData = inputs.slice(6, 12)
    // Campos paso 3
    const inputsPermissionData = inputs.slice(12, 22)

    if (step === 1) {
        return <Form
            title={TITLE}
            stepTitle="1. Datos de la organización"
            inputs={inputsOrgData}
            onClickNext={nextStep}
            onClickPrev={prevStep}
        />
    }
    if (step === 2) {
        return <Form
            title={TITLE}
            stepTitle="2. Datos del representante legal"
            inputs={inputsPresidentData}
            onClickNext={nextStep}
            onClickPrev={prevStep}
        />
    }
    if (step === 3) {
        return <Form
            title={TITLE}
            stepTitle="3. Detalles del permiso"
            inputs={inputsPermissionData}
            onClickNext={nextStep}
            onClickPrev={prevStep}
        />
    }
    if (step === 4) {
        return <AntecedentesPermisosTransitorios
            title={TITLE}
            stepTitle="4. Antecedentes"
            onClickNext={nextStep}
            onClickPrev={prevStep}
        />
    }
    if (step === 5) {
        return <ConfirmarFormularioPT
            title={TITLE}
            stepTitle="Confirmar formulario"
            data={formData}
            userId={userId}
            onClickPrev={prevStep}
        />
    }
}

export default FormularioPermisosTransitorios
