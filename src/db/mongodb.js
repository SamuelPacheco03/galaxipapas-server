import mongoose from "mongoose";
import config from "../config.js";

const dbconfig = {
  uri: config.mongodb.user && config.mongodb.password
      ? `mongodb+srv://${config.mongodb.user}:${config.mongodb.password}@cluster0.yxt6q.mongodb.net/${config.mongodb.database}?retryWrites=true&w=majority&authSource=admin&ssl=true`
    : `mongodb://${config.mongodb.host}/${config.mongodb.database}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};


const connMongoDB = () => {
  mongoose.connect(dbconfig.uri)
    .then(() => {
      console.log("DB Connected");
    })
    .catch((err) => {
      console.error("[db err]", err);
      setTimeout(connMongoDB, 200); // Intentar reconectar automáticamente
    });

  mongoose.connection.on("error", (err) => {
    console.error("[db err]", err);
    if (err.message && err.message.includes("ECONNREFUSED")) {
      connMongoDB(); // Intentar reconectar en caso de pérdida de conexión
    } else {
      throw err;
    }
  });
};


// Obtener todos los registros de una colección
const all = (model) => {
  return new Promise((resolve, reject) => {
    model.find({}, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

// Obtener un solo registro por ID
const one = (model, id) => {
  return new Promise((resolve, reject) => {
    model.findById(id, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

// Obtener un solo registro por USER
const oneByUser = (model, user) => {
  return new Promise((resolve, reject) => {
    model.findOne({ username: user }, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

// Obtener un solo registro por EMAIL
const oneByEmail = (model, email) => {
  return new Promise((resolve, reject) => {
    model.findOne({ email: email }, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

// Agregar un nuevo registro
const add = (model, data) => {
  return new Promise((resolve, reject) => {
    model.create(data, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

// Actualizar un registro por ID
const update = (model, data, id) => {
  return new Promise((resolve, reject) => {
    model.findByIdAndUpdate(id, data, { new: true }, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

// Eliminar un registro por ID
const deleteR = (model, id) => {
  return new Promise((resolve, reject) => {
    model.findByIdAndDelete(id, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

// Ejecutar cualquier consulta con parámetros (ej. find con filtros)
const query = (model, filters, projection = null) => {
  return new Promise((resolve, reject) => {
    model.find(filters, projection, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
};

export default {
  all,
  one,
  add,
  update,
  deleteR,
  query,
  oneByUser,
  oneByEmail
};

connMongoDB();
