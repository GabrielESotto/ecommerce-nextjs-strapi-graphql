/**
 * game controller
 */

import { factories } from '@strapi/strapi'



export default factories.createCoreController('api::game.game', ({strapi}) => ({

    async populate(ctx) {
        console.log('Starting to populate')

        strapi.service('api::game.game').populate()
        
        ctx.body = 'Finished populating!'
    }

}));
