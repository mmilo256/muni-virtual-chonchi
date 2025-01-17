import Button from "../buttons/Button"
import Container from "../Container"
import Heading from "../Heading"

const FormCompleted = ({ text }) => {
    return (

        <Container>
            <div className="py-24">
                <Heading className="text-center" level={1}>¡Solicitud enviada!</Heading>
                <p className="text-center mb-3">{text}</p>
                <div className="max-w-fit mx-auto">
                    <Button type="link" href="/inicio" variant="primary">Volver al inicio</Button>
                </div>
            </div>
        </Container>

    )
}

export default FormCompleted