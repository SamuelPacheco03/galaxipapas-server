import Attempt from "../models/Attempt.js";
import Code from "../models/Code.js";
import User from "../models/User.js";
import UserInfo from "../models/UserInfo.js";

// Función para mezclar un array (Fisher-Yates Shuffle)
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const createCodes = async (req) => {
    try {
        // Verificar si la colección está vacía
        const existingCodes = await Code.countDocuments();
        if (existingCodes > 0) {
            // Si hay códigos, eliminar todos
            await Code.deleteMany({});
            await Attempt.deleteMany({});
        }

        // Preparar la lista de códigos
        const codes = [];
        const totalCodes = 801; // Códigos del 0 al 800

        // Asignar premios aleatoriamente
        let prizes = [
            ...Array(50).fill('1.000.000 pesos'), // 50 premios de 1 millón
            ...Array(150).fill('50.000 pesos'),  // 150 premios de 50 mil
            ...Array(200).fill('10.000 pesos'),  // 200 premios de 10 mil
            ...Array(totalCodes - 400).fill('Sin premio'), // Resto sin premio
        ];

        // Mezclar la distribución de premios
        prizes = shuffleArray(prizes);

        // Generar 801 códigos del 0 al 800
        for (let i = 0; i < totalCodes; i++) {
            // Crear un nuevo código
            const code = new Code({
                code: i.toString(), // Código numérico del 0 al 800
                prize: prizes[i],   // Premio asignado de manera aleatoria
                state: 'libre',     // Estado inicial
                date: null,         // Sin fecha inicial
            });

            codes.push(code);
        }

        // Insertar los códigos en la base de datos
        await Code.insertMany(codes);

        return { message: 'Códigos creados correctamente.' };
    } catch (error) {
        console.error('Error al crear códigos:', error);
        throw error;
    }
};

const getCodes = async (req) => {
    const { page = 1, used, prize } = req.query; // Parámetros de paginación y filtros
    const limit = 10; // Número de códigos por página
    const skip = (page - 1) * limit; // Cálculo para la paginación

    try {
        // Filtro base para la consulta de códigos
        const filters = {};

        // Filtro por estado de uso (incluir todos si 'used' está vacío o no está definido)
        if (used === 'true') {
            filters.state = 'usado';
        } else if (used === 'false') {
            filters.state = 'libre';
        }

        // Filtro por premio
        if (prize) {
            filters.prize = prize;
        }

        // Obtener los códigos filtrados y paginados
        const codes = await Code.find(filters).skip(skip).limit(limit);

        // Arreglo para almacenar la información de los códigos
        const codesData = [];

        // Iterar sobre los códigos obtenidos
        for (const code of codes) {
            let codeData = {
                code: code.code,
                prize: code.prize,
                state: code.state,
            };

            // Si el código está en estado 'usado', buscar el intento asociado
            if (code.state === 'usado') {
                const attempt = await Attempt.findOne({ code: code.code });
                
                if (attempt) {
                    // Buscar la información del usuario que hizo el intento
                    const userInfo = await UserInfo.findOne({ user_id: attempt.user_id });
                    if (userInfo) {
                        // Agregar la información completa al objeto del código
                        codeData = {
                            ...codeData,
                            date: attempt.date,
                            user_name: userInfo.name,
                            user_document: userInfo.document_number,
                            user_phone: userInfo.phone,
                        };
                    }
                }
            }

            // Agregar el código (usado o libre) al arreglo de códigos
            codesData.push(codeData);
        }

        return {
            codes: codesData,
            currentPage: parseInt(page, 10),
            hasNextPage: codes.length === limit, // Si hay más de 10 resultados, hay una siguiente página
        };
    } catch (error) {
        console.error('Error al obtener los códigos:', error);
        throw new Error('Error al obtener los códigos.');
    }
};

// Servicio para usar un código enviado por el usuario
const useCode = async (req) => {
    const { user } = req;
    const { code } = req.body;
    const foundUser = await User.findOne({ email: user.user });
    let message = null;
    if (!foundUser) {
        throw new NotFoundError("Usuario no encontrado.");
    }
    const userId = foundUser._id;

    try {
        // Verificar si el código existe en la colección de códigos
        const codeRecord = await Code.findOne({ code });

        if (!codeRecord) {
            return { success: false, message: 'El código no existe.' };
        }

        // Verificar si el código ya está en la colección de intentos
        const existingAttempt = await Attempt.findOne({ code });

        if (existingAttempt) {
            return { message: 'El código ya ha sido usado.' }
        }

        // Crear un nuevo intento en la colección de intentos
        const newAttempt = new Attempt({
            code,
            date: new Date(), // Fecha actual de registro
            user_id: userId,
        });

        await newAttempt.save();

        // Actualizar el estado del código a 'usado'
        codeRecord.state = 'usado';
        await codeRecord.save();

        // Verificar si el código es ganador
        message = 'Código registrado con éxito.';
        if (codeRecord.prize !== 'Sin premio') {
            message = `¡Felicidades! Has ganado ${codeRecord.prize}.`;
        }

        return { success: true, message };
    } catch (error) {
        console.error('Error al usar el código:', error);
        throw new Error("Error al usar el código.");
    }
};


const getUserLog = async (req) => {
    const { user } = req;
    const foundUser = await User.findOne({ email: user.user });

    if (!foundUser) {
        throw new Error("Usuario no encontrado.");
    }

    try {
        // Filtrar intentos por el ID del usuario
        const attempts = await Attempt.find({ user_id: foundUser.id }).sort({ date: -1 });

        // Preparar la respuesta con la información de cada intento
        const userLog = [];

        for (const attempt of attempts) {
            // Obtener la información del código asociado al intento
            const codeRecord = await Code.findOne({ code: attempt.code });

            userLog.push({
                date: attempt.date,
                code: attempt.code,
                prize: codeRecord ? codeRecord.prize : 'Sin premio',
            });
        }
        return { success: true, log: userLog };
    } catch (error) {
        console.error('Error al obtener el log del usuario:', error);
        throw new Error('Error al obtener el log del usuario.');
    }
};

export default {
    createCodes,
    getCodes,
    useCode,
    getUserLog
};
