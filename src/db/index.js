const initClient = require("./initClient");
const { datasources } =
  require('@fintechinnovaciondev/paragon-common');
const { ParametroDataSource, Logger, GCSDataSource } = datasources;


module.exports = async (nombreColeccion) => {
    const cliente = await initClient();
    let coleccion;
    
    const console = {
        active: Boolean(process.env.LOGGING_TRANSPORTS_CONSOLE),
        level: process.env.LOGGING_LEVEL_CONSOLE,
        json: Boolean(process.env.LOGGING_LEVEL_JSON),
        color: Boolean(process.env.LOGGING_LEVEL_COLOR),
    };

    const file = {
        active: Boolean(process.env.LOGGING_TRANSPORTS_FILE),
        level: process.env.LOGGING_LEVEL_FILE,
        dailyRotate: Boolean(process.env.LOGGING_TRANSPORTS_DAILY_ROTATE),
        path: process.env.LOGGING_FILE_PATH,
        name: process.env.LOGGING_FILE_NAME,
        maxSize: process.env.LOGGING_FILE_MAXSIZE,
    }

    const log = new Logger(console, file).getLogger();

    if(nombreColeccion === "PARAMETRO")
        coleccion = process.env.DB_PARAMETRO_COLLECTION_NAME
    if(nombreColeccion === "CREDENCIAL")
        coleccion = process.env.DB_CREDENCIAL_COLLECTION_NAME
    if(nombreColeccion === "GCS")
        coleccion = process.env.DB_CREDENCIAL_COLLECTION_NAME

    let instanciaClase;
    if(["PARAMETRO", "CREDENCIAL"].includes(nombreColeccion))
        instanciaClase = new ParametroDataSource(
            cliente,
            process.env.DB_NAME,
            coleccion,
            log
        );
    else 
        instanciaClase = new GCSDataSource(
            cliente,
            process.env.DB_NAME,
            coleccion,
            log
        );

    return instanciaClase
}