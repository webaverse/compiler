// import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, usePhysics, useZine} = metaversefile;

export default e => {
  const app = useApp();
  const physics = usePhysics();
  const zine = useZine();

  const srcUrl = ${this.srcUrl};
  
  // globalThis.zine = zine;
  console.log('zine app init', {srcUrl});

  e.waitUntil((async () => {
    console.log('zine app inside waitUntil', {app, physics});

    const zineInstance = await zine.createStoryboardInstanceAsync({
      start_url: srcUrl,
      physics,
    });
    app.add(zineInstance);
    zineInstance.updateMatrixWorld();
    
    app.zineInstance = zineInstance;
    app.physicsIds = zineInstance?.physicsIds ?? [];
  })());

  return app;
};
export const contentId = ${this.contentId};
export const name = ${this.name};
export const description = ${this.description};
export const type = 'zine';
export const components = ${this.components};