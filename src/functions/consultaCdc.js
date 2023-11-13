const setApi = require("facturacionelectronicapy-setapi").default;


module.exports = async (id, cdc, filePath, password) => {
    try {
        const env = process.env.ENTORNO;
        return setApi.consulta(
            id,
            cdc,
            env,
            filePath,
            password,
        )
    } catch (error) {
        console.log(error)
    }
}