const Button = ({ text, type = "button", variant, wFull = false }) => {

    // Color del botón
    let buttonVariant = ""
    switch (variant) {
        case "primary":
            buttonVariant = "bg-primary hover:bg-primaryHover text-white"
            break;
        case "secondary":
            buttonVariant = "bg-secondary hover:bg-secondaryHover text-white"
            break;
        case "tertiary":
            buttonVariant = "bg-[#fff] text-black hover:bg-[#eee]"
            break;
        default:
            break;
    }

    return (
        <button className={`block p-2 rounded ${wFull && "w-full"} ${buttonVariant}`} type={type}>{text}</button>
    )
}

export default Button