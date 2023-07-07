import jwt from "jsonwebtoken"

const token_introspect_url = "https://www.linkedin.com/oauth/v2/introspectToken"

const isAccessTokenActive = async (access_token) => {
    try {
        const body = new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            token: access_token
        })
        const response = await fetch(token_introspect_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        })
        const jsonResponse = await response.json()
        return jsonResponse.active
    } catch (error) {
        console.log(error)
    }

}

export const isTokenActive = async (req, res, next) => {
    try {
        const { token } = req.body;
        const access_token_json = jwt.verify(token, process.env.JWT_SECRET);
        const isTokenActive = await isAccessTokenActive(access_token_json.access_token);
        if (!isTokenActive) {
            return res.status(401).json({
                isTokenActive: false,
                success: true
            })
        }
        req.access_token = access_token_json.access_token
        next();
    } catch (error) {

    }

}