const Dev = require('../models/Dev');

module.exports = {
    async store(req,res){
        console.log("re.io=",req.io, "req.connectedUsers", req.connectedUsers)

        //Desestruturação pega as informações vinda das requisição
        const { user } = req.headers;
        const { devId } = req.params;

        const loggedDev = await Dev.findById(user);
        const targetDev = await Dev.findById(devId);
        
        //verifica se não esta dando like em um usuário não existente
        //Http codes 400 bad request
        if (!targetDev){
            return res.status(400).json({error:"Dev não encontrado"})
        }

        if(targetDev.likes.includes(loggedDev._id)){
            const loggedSocket = req.connectedUsers[user];
            const targetSocket = req.connectedUsers[devId];

            if(loggedSocket){
                req.io.to(loggedSocket).emit('match', targetDev);
            }

            if(targetSocket){
                req.io.to(targetSocket).emit('match', loggedDev);
            }
        }

        //salva com a id _id do mongodb
        loggedDev.likes.push(targetDev._id);

        //tem que ser chamada função save para salvar as informações
        await loggedDev.save();


        return res.json(loggedDev)
    }
};