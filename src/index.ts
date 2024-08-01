import ConfigParser from "configparser";
import { KSAniDB } from "./../kp-anidb-ts/dist/src/index";
import express from "express";

let config = new ConfigParser()
config.read(".config")
let client = config.get("Client", "client")
let clientVer = config.get("Client", "client_version")
if(client == null || clientVer == null) {
    console.error("Client or Client Version not set in .config file. Did you forget to create a .config file? Refer to the README for more information.")
    process.exit(1)
}else{
    console.log(`Client: ${client} | Client Version: ${clientVer}`)
}

const main = async () => {
    let db = KSAniDB.builder()
        .setClient(client)
        .setClientVer(parseInt(clientVer))
        .setRateLimit(1, 2000, true, true)
        .setCache("./cache", 1000 * 60 * 60 * 24, true)
        .build()

    await db.init()

    let app = express()

    app.get("/search/:title", async (req, res) => {
        let animes = await db.searchTitle(req.params.title)
        res.json(animes.map(anime => anime.data()))
    })

    app.get("/details/:title", async (req, res) => {
        let anime = (await db.searchTitle(req.params.title))[0]
        let details = await anime.fetchDetails()
        res.json(details)
    })

    app.get("/suggest/:title", async (req, res) => {
        let suggestion = await db.suggestTitle(req.params.title)
        res.json(suggestion)
    })

    app.listen(3000, () => {
        console.log("Server started on port 3000")
    })
}

main()