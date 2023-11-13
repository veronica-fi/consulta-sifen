const path = require('path');
const fs = require("fs")
const jsonTOcsv = require('json2csv');

async function generarCsv() {
    const file = fs.readFileSync(
        "archivo.txt",
        { encoding: "utf-8" }
    );

    const datos = JSON.parse(file);

    const dataFinal = datos.map((item) => {
        const { id_documento, cdc, consultaSer } = item;
        const fechaProceso = consultaSer["ns2:rEnviConsDeResponse"]["ns2:dFecProc"];
        const codigo = consultaSer["ns2:rEnviConsDeResponse"]["ns2:dCodRes"];
        const mensaje = consultaSer["ns2:rEnviConsDeResponse"]["ns2:dMsgRes"];

        return { id_documento, cdc, fechaProceso, codigo, mensaje }
    });

    const directorio = path.join(__dirname, 'listado');    
    fs.mkdirSync(directorio, { recursive: true })
    const data = jsonTOcsv.parse(dataFinal, {delimiter: ','})
    fs.writeFileSync(path.join(directorio, 'consulta-sifen.csv'), data)  
}


generarCsv().then(x => console.log(x))