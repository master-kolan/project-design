import {tokenMapbox} from "../config";

export const getUriMapbox = ( api, pos, token = tokenMapbox) => {
    let prefix, res = '';
    switch (api) {
        case 'mapbox-terrain-vector':
            prefix = 'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2';
            res = '.vector.pbf';
            break;
        case 'mapbox-terrain-rgb':
            prefix = 'https://api.mapbox.com/v4/mapbox.terrain-rgb';
            res = '@2x.pngraw';
            break;
        case 'mapbox-satellite':
            prefix = 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles';
            break;
        default:
            console.log('getUriMapbox(): unsupported api:', api);
            return '';
    }
    return `${prefix}/${pos.join('/')}${res}?access_token=${token}`;
}

