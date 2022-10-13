import path from 'path';
import url from 'url';
import {fetchFileFromId, createRelativeFromAbsolutePath} from '../util.js';

const _jsonParse2 = s => {
  try {
    const result = JSON.parse(s);
    return {result};
  } catch(error) {
    return {error};
  }
};

export default {
  async resolveId(id, importer) {
    const s = await fetchFileFromId(id, importer, 'utf8');

    if (s !== null) {
      const {result, error} = _jsonParse2(s);

      if (!error) {
        const {name, description, start_url, components} = result;

        if (start_url) {
          const _mapUrl = () => {
            if (/^https?:\/\//.test(start_url)) {
              const o = url.parse(start_url, true);
              let s = url.format(o);
              return s;
            } else if (/^https?:\/\//.test(id)) {
              const o = url.parse(id, true);
              o.pathname = path.join(path.dirname(o.pathname), start_url);
              let s = url.format(o);
              return s;
            } else if (/^\//.test(id)) {
              id = createRelativeFromAbsolutePath(id);
              
              const o = url.parse(id, true);
              o.pathname = path.join(path.dirname(o.pathname), start_url);
              let s = url.format(o);
              return s;
            } else {
              throw new Error('.metaversefile scheme unknown');
            }
          };
          const _makeHash = mapped_start_url => {
            const searchParams = new URLSearchParams();

            searchParams.set('contentId', mapped_start_url);
            if (name) {
              searchParams.set('name', name);
            }
            if (description) {
              searchParams.set('description', description);
            }
            if (Array.isArray(components)) {
              searchParams.set('components', JSON.stringify(components));
            }
            const s = searchParams.toString();
            return s ? ('#' + s) : '';
          };

          let u = _mapUrl();
          if (u) {
            u += _makeHash(u);
            return u;
          } else {
            return u;
          }
        } else {
          throw new Error('.metaversefile has no "start_url": string', {j, id, s});
        }
      } else {
        throw new Error('.metaversefile could not be parsed: ' + error.stack);
      }
    } else {
      throw new Error('.metaversefile could not be loaded');
    }
  }
};