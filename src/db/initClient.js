const { MongoClient } = require("mongodb")

module.exports = async function () {
    try {
      console.log('Conectando a la base de datos del MongoDB');
      const client = new MongoClient(process.env.DB_MONGO_URL);
      await client.connect();
  
      console.log('Base de datos MongoDB conectada correctamente.');
      return client;
    } catch (error) {
      console.error('Error al conectar con la base de datos MongoDB.');
      console.error(error);
    }
}