const authMiddleware = (req, res, next) => {
    if(!req.session || !req.session.userId){
        return res.status(401).json({
            success: false,
            message: "Authentication failed. Log In required!"
        })
    }

    req.userId = req.session.userId;
    next();
}
export default authMiddleware;