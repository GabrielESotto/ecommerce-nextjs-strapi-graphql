/**
 * publisher service
 */

import { factories } from '@strapi/strapi';
import slugify from 'slugify';

export default factories.createCoreService('api::publisher.publisher', ({strapi}) => ({
    async createPub(params) {
        const slugString = slugify(params, { lower: true })

        const result = await super.create({ 
            data: {
                publishedAt: new Date(),
                name: params,
                slug: slugString
            }
        })

        return result
    }
}));
