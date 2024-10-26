export const success = (req, res, message = '', status = 200) => {
    res.status(status).send({
        error: false,
        status: status,
        body: message
    });
};

export const error = (req, res, message = 'Error interno', status = 500) => {
    res.status(status).send({
        error: true,
        status: status,
        body: message
    });
};

export default{
    success,
    error
}
