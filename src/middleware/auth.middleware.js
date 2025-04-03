const cookie = require('cookie')
const redisClient = require('../config/redis')
const { verifyAccessToken, verifyRefreshToken } = require('../service/jwt')

const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization')
    const accessToken = authHeader && authHeader.split(" ")[1]
    if (!accessToken) return res.status(403).json({ message: "Token is required" })

    const decoded = verifyAccessToken(accessToken)
    if (!decoded) {
        if (req.headers.cookie) {
            const cookies = cookie.parse(req.headers.cookie)
            const refreshToken = cookie.refreshToken
            if (!refreshToken) {
                return res.status(401).json({ message: "User is not logged in" })
            }
            const user = verifyRefreshToken(refreshToken)
            if (!user) {
                return res.status(403).json({ message: "Invalid refresh token" })
            }
            const tokens = await generateToken(user)
            if (tokens) {
                const newAccessToken = tokens.accessToken
                const newRefreshToken = tokens.refreshToken
                if (!newAccessToken || !newRefreshToken) return res.status(500).json({ message: "Error generate new token" })

                await redisClient.set(`userID:${user.id}`, newRefreshToken, { EX: 604800 }) // ⭐️ update new refreshtoken in redis
                res.cookie('refreshToken', newRefreshToken, { // ⭐️ update new refreshtoken in cookie
                    httpOnly: true,
                    secure: false,
                    maxAge: 604800000
                })
                res.setHeader('Authorization', `Bearer ${newAccessToken}`) // ⭐️ update new accesstoken to header
                await redisClient.set(accessToken, 'blacklisted', { EX: 900 }) // ⭐️ add old accesstoken to blacklist

                req.user = user
                req.token = newAccessToken
            }
        }
    } else {
        const checkBlacklisted = await redisClient.get(accessToken)
        if (checkBlacklisted === "blacklisted") return res.status(401).json({ message: "User is not logged in" })
        req.user = decoded
        req.token = accessToken
    }
    next()
}

const authorizeRole = (role) => {
    return async (req, res, next) => {
        if (req.user) {
            const userRole = req.user.role
            if (userRole === role) {
                next()
            } else {
                res.status(403).json({ message: "User is not have permission" })
            }
        }
    }
}

module.exports = { authenticate, authorizeRole }