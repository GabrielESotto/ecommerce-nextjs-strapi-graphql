/**
 * platform service
 */

import { factories } from '@strapi/strapi';
import slugify from 'slugify';

export default factories.createCoreService('api::platform.platform', ({strapi}) => ({
    async createPlat(params) {
        const slugString = slugify(params, { lower: true })

        const result = await super.create({ 
            data: {
                publishedAt: new Date(),
                name: params,
                slug: slugString
            }
        })
    }
}));
