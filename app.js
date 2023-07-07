import { config } from "dotenv"
import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import { isTokenActive } from "./middlewares/isTokenActive.js"
import { apiResponse } from "./utils/apiResponse.js"
import fetch from "node-fetch"
config()
export const app = express()
app.use(express.static("public"))
app.use(express.json())
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }));

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const linkedin_url_access = "https://www.linkedin.com/oauth/v2/accessToken"

app.post("/getaccesstoken", async (req, res) => {
    try {
        const { code } = req.body
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id,
            client_secret,
            redirect_uri,
        });
        let access_token = ""
        let refresh_token = ""
        const response = await fetch(linkedin_url_access, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        })
        console.log("Get Access Token:", response.status)
        if (response.status !== 200) {
            res.status(response.status).json({
                status: response.status,
                success: false,
                message: "Please re-authorize"
            })
        }
        else {
            const jsonResponse = await response.json();
            access_token = jsonResponse.access_token;
            refresh_token = jsonResponse.refresh_token;
            const signedJwt = jwt.sign({
                access_token,
                refresh_token
            }, process.env.JWT_SECRET);
            res.status(200).json({
                success: true,
                signedJwt
            })
        }
    } catch (error) {
        console.log(error)
    }

})

app.post("/getprofile", isTokenActive, async (req, res) => {
    try {
        const response = await fetch("https://api.linkedin.com/v2/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${req.access_token}`
            }
        })
        apiResponse(response, res, "Profile api called successfully")
    } catch (error) {
        console.log(error)
    }
})

app.post("/getemail", isTokenActive, async (req, res) => {
    try {
        const response = await fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${req.access_token}`
            }
        })
        apiResponse(response, res, "Email api called successfully")
    } catch (error) {
        console.log(error)
    }
})



