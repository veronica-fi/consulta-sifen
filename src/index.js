const dotenv = require('dotenv');
dotenv.config('../../.env');
const datos = require('./data').data;
const path = require('path');
const fs = require("fs")
const jsonTOcsv = require('json2csv');
const { consultarCdc, verificarCertificado } = require("./functions");


async function consultar() {
    try {
        
        const { filePath, passwordDelCertificado } = await verificarCertificado(
            process.env.ID_EMPRESA,
            process.env.NOMBRE_EMPRESA,
            process.env.RUC_EMPRESA
        )

        const allDocs = await Promise.all(datos.map(async (item) => {
            console.log(item);
            const { id_documento, cdc } = item;
            const consulta = await consultarCdc(id_documento, cdc, filePath, passwordDelCertificado);
            const fechaProceso = consulta["ns2:rEnviConsDeResponse"]["ns2:dFecProc"];
            const codigo = consulta["ns2:rEnviConsDeResponse"]["ns2:dCodRes"];
            const mensaje = consulta["ns2:rEnviConsDeResponse"]["ns2:dMsgRes"];
            return { id_documento, cdc, fechaProceso, codigo, mensaje }

        }))

        return allDocs.filter(item => item);

    } catch (error) {
        console.log(error)
    }
}

consultar()
.then(item => {
    console.log(item);
    const directorio = path.join(__dirname, 'listado');    
    fs.mkdirSync(directorio, { recursive: true })
    //const data = jsonTOcsv.parse(item, {delimiter: ','})
    fs.writeFileSync(path.join(directorio, 'consulta-cdc-set-02-13-2023-nr-pronet-.txt'), JSON.stringify(item))  
})
.catch(y => console.log(y))