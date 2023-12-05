import bcryptjs from "bcryptjs"
class AgentModel {
    static async AgentLogin(req, res, next) {

        const { email, password } = req.body

        if(!email || !password){
            return res.status(422).json({
                status: false,
                code: 422,
                message: "Please fill all the required field",
            });
        }

        const findAgent = await findOne({ email })
        if (!findAgent) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: "Data not found",
            });
        }

        let validPassword = await bcryptjs.compare(password, findAgent.password)

        if(!validPassword){
            return res.status(401).json({
                status: false,
                code: 401,
                message: "Incorrect Password",
            });
        }

        const {agentId, agentext} = findAgent




    }

}

export default AgentModel