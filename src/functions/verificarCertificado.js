const mongodb = require('../db')
const { utilities, common } = require("@fintechinnovaciondev/paragon-common"); 
const { createDirectory, verifyDirectory } = utilities;
const { encrypt } = common;
const path = require("path");


async function getParametros(rucEmpresa) {
    try {
      const coleccionParametro = await mongodb("PARAMETRO");
      const coleccionCredencial = await mongodb("CREDENCIAL");
      const gcs = await mongodb("GCS");

      const cantidadDE =
        await coleccionParametro.findOneByName('CANT_MAX_DE_SET');
     console.log(
        'Cantidad máxima documentos electróonicos ' +
          'que se pueden enviar por lote: ' +
          cantidadDE.valor,
      );
      let passwordDelCertificado;
      if (rucEmpresa) {
        const passwordCertificado =
          await coleccionCredencial.findFirmaByRuc(rucEmpresa);
       console.log(
          'Datos de contraseña del certificado obtenidos correctamente para ' +
            'la empresa con RUC N°: ' +
            rucEmpresa,
        );

        passwordDelCertificado = !passwordCertificado
          ? null
          : encrypt.decryptStringBase64(passwordCertificado.valor);
      } else {
        passwordDelCertificado = '';
      }

      const bucket = await coleccionCredencial.findOneByName('GCS_BUCKET_NAME');
     console.log('Nombre del bucket del GCS recuperado.');

      return {
        cantidadPorLote: parseInt(cantidadDE.valor),
        passwordDelCertificado,
        bucketName: bucket.valor,
        gcs,
      };
    } catch (error) {
      console.log(error);
    }
  }


async function getDatosCertificado(rucEmpresa, directorio) {
    try {
      console.log(
        'Inicia el proceso de descarga del certificado ' +
          'de la empresa con RUC N°: ' +
          rucEmpresa,
      );

      const { passwordDelCertificado, gcs } =
        await getParametros(rucEmpresa);

      if (!passwordDelCertificado) {
        console.warn('No existe el dato de la firma de la empresa en BD.');

        return {
          filePath: null,
          passwordDelCertificado,
        };
      } else {
        const nombreOriginal = process.env.URL_FIRMA;
        const nombreNuevo = rucEmpresa;
        const archivoDescargado = await gcs.downloadFileFromGCS(
          nombreOriginal,
          directorio,
          nombreNuevo,
        );

        console.log(
          'Archivo descargado en el directorio: ' +
            archivoDescargado.directorio,
        );

        return {
          filePath: archivoDescargado.directorio,
          passwordDelCertificado,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }


module.exports = async (
    idEmpresa,
    nombreEmpresa,
    rucEmpresa,
  ) => {
    try {

      console.log(    idEmpresa,
        nombreEmpresa,
        rucEmpresa,);

      const empresa = `${idEmpresa}-${nombreEmpresa.replaceAll(' ', '_')}`;
      const directorio = path.join(__dirname, '..', 'firma', empresa);

      const directorioCreado = createDirectory(directorio);
      const nombreArchivo = path.join(directorioCreado, `${rucEmpresa}.p12`);

      if (!verifyDirectory(nombreArchivo)) {
        return await getDatosCertificado(rucEmpresa, directorioCreado);
      } else {
        const { passwordDelCertificado } = await getParametros(rucEmpresa);

        return {
          filePath: nombreArchivo,
          passwordDelCertificado,
        };
      }
    } catch (error) {
      console.log(error);
    }
}

