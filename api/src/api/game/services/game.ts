/**
 * game service
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';
import slugify from 'slugify';

// async function createPublisher(name, entityName, params) {
//     try {
//         const item = await getByName(name, entityName)
//         let flag = false;

//         for(let i = 0; i < item.length; i++) {
//             if(item[i].name === name) {
//                 console.log(`${name} já existe na lista de Publishers`)
//                 return flag = true
//             }
//         }

//         if(flag === false) {
//             console.log(`Publisher "${name}" adicionado com sucesso`)
//             return await strapi.service(entityName).createPub(params, 31)
//         } 
//     } catch (error) {
//         console.log(error)
//     }
// }

// async function createDeveloper(name, entityName, params) {
//     try {
//         const item = await getByName(name, entityName)
//         let flag = false

//         for(let i = 0; i < item.length; i++) {
//             if(item[i].name === name) {
//                 console.log(`${name} já existe na lista de Developers`)
//                 return flag = true
//             }
//         }

//         if (flag === false) {
//             console.log(`Developer "${name}" adicionado com sucesso`)
//             return await strapi.service(entityName).createDev(params, 31)
//         } 
//     } catch (error) {
//         console.log(error)
//     }
// }

async function getGameInfo(slug) {
    const jsdom = require('jsdom')
    const { JSDOM } = jsdom
    const body = await axios.get(`https://www.gog.com/en/game/${slug}`)
    const dom = new JSDOM(body.data)

    const description = dom.window.document.querySelector('.description')

    return {
        rating: 'BR0',
        short_description: description.textContent.trim().slice(0, 160),
        description: description.innerHTML
    }
}

async function getByName(name, entityName) {
    try {
        const item = await strapi.entityService.findMany(entityName, {
            fields: ['name'],
            filters: { name: name }
        })

        return item.length ? item[0] : null
    } catch(error) {
        console.log(error, 'Error getByName')
    }
    
}

async function createManyToManyData(products) {
    const allDevelopers = new Set();
    const allPublishers = new Set();
    const categories = new Set();
    const platforms = new Set();

    try {
        products.forEach((product) => {
            const { developers, publishers, genres, operatingSystems } = product;

            genres &&
                genres.forEach(async (item) => {
                    categories.add(item.name)
                });
            operatingSystems &&
                operatingSystems.forEach((item) => {
                    platforms.add(item)
                })
            developers &&
                developers.forEach((item) => {
                    allDevelopers.add(item)
                })
            publishers &&
                publishers.forEach((item) => {
                    allPublishers.add(item)
                })
        })

        console.log('Verificando dados existentes e adicionando o que não existe...')
    
        const createCallDev = (set, entityName) => Array.from(set).map(async (name) => {
            const ifExists = await getByName(name, entityName)
            return ifExists === null && await strapi.service(entityName).createDev(name)
        })

        const createCallPub = async (set, entityName) => Array.from(set).map(async (name) => {
            const ifExists = await getByName(name, entityName)
            return ifExists === null && await strapi.service(entityName).createPub(name)
        })
        const createCallPlt = (set, entityName) => Array.from(set).map(async (name) => {
            const ifExists = await getByName(name, entityName)
            return ifExists === null && await strapi.service(entityName).createPlat(name)
        })
        const createCallCat = (set, entityName) => Array.from(set).map(async (name) => {
            const ifExists = await getByName(name, entityName)
            return ifExists === null && await strapi.service(entityName).createCat(name)
        })

        Promise.all([
            ... createCallCat(categories, 'api::category.category'),
            ... await createCallPub(allPublishers, 'api::publisher.publisher'),
            ... createCallDev(allDevelopers, 'api::developer.developer'),
            ... createCallPlt(platforms, 'api::platform.platform'),
        ])

        console.log('Tudo ocorreu conforme o esperado.')        
    } catch (error) {
        console.log(error, 'Error in ManyToMany')
    }
}

async function creatingGames(products) {
    await Promise.all(
        products.map(async (product) => {            
            const game = await strapi.service("api::game.game").createGame(product)

            return game
        })
    )
}

async function setImage({image, game, field = "cover"}) {
    try {
        const url = image;
        const { data } = await axios.get(url.replace(/_{formatter}/g, ""), { responseType: "arraybuffer" })
        const buffer = Buffer.from(data, "base64")
    
        const FormData = require('form-data');
        const formData = new FormData();
    
        formData.append("refId", game.id)
        formData.append("ref", "api::game.game")
        formData.append("field", field)
        formData.append("files", buffer, { filename: `${game.slug}.jpg`})
    
        console.info(`Uploading ${field} image: ${game.slug}.jpg`)   
    
        await axios({
            method: "POST",
            url: `http://localhost:1337/api/upload`,
            data: formData,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`
            }
        })
    } catch(error) {
        console.log('SET IMAGE ERROR', error)
    } 
}

export default factories.createCoreService('api::game.game', ({strapi}) => ({
    async populate() {
        try {
            const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&genres=in%3Astrategy%2Csports%2Csimulation%2Cshooter%2Crpg%2Cracing%2Cadventure%2Caction&order=desc%3Atrending&productType=in%3Agame%2Cpack%2Cdlc%2Cextras&page=1&countryCode=BR&locale=en-US&currencyCode=BRL`
            const { data: { products } } = await axios.get(gogApiUrl)

            // await createManyToManyData(products)
            await creatingGames(products)
        } catch (error) {
            console.log(error, 'Error in Populate')
        }
    },

    async createGame(product) {
        try {
            const item = await getByName(product.title, "api::game.game")
      
            if(!item) {
                const date = product.releaseDate ? await product.releaseDate.split('.') : ['0000', '00', '00']
                const stringDate = `${date[2]}/${date[1]}/${date[0]}`
            
                console.info(`Creating: ${product.title}...`)

                const game = await super.create({
                    data: {
                        name: product.title,
                        slug: product.slug.replace(/-/g, "_"),
                        price: product.price.base,
                        release_date: stringDate,
                        categories: await Promise.all(product.genres.map((genre) => getByName(genre.name, "api::category.category"))),
                        platforms: await Promise.all(product.operatingSystems.map((name) => getByName(name, "api::platform.platform"))),
                        developers: await Promise.all(product.developers.map((name) => getByName(name, "api::developer.developer"))),
                        publisher: await Promise.all(product.publishers.map((name) => getByName(name, "api::publisher.publisher"))), 
                        ...(await getGameInfo(product.slug.replace(/-/g, "_")))            
                    }
                })

                await setImage({ image: product.coverHorizontal, game })
                await Promise.all(
                    product.screenshots.map((url) => setImage({ image: url, game, field: "gallery" }))
                )

                await setTimeout(() => {}, 2000)
                console.log('Processo finalizado!')
                return game
            } else {
                console.log(`O jogo ${product.title} já foi adicionado a lista`)
            }
        } catch(error) {
            console.log('ERROR IN FUNCTION CREATEGAME', error)
        }
    }
}));
