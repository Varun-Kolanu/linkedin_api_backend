
export const apiResponse = async (response,res, message) => {
    if(response.status !== 200) {
        res.status(response.status).json({
            isTokenActive: true,
            success: false,
            error: response.error
        })
    }
    else {
        const jsonResponse = await response.json();
        console.log(message)
        res.status(200).json({
            isTokenActive: true,
            success: true,
            result: jsonResponse
        })
    }
}