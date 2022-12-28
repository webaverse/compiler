// import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, usePhysics, useZine} = metaversefile;

export default e => {
  const app = useApp();
  const physics = usePhysics();
  const zine = useZine();

  const srcUrl = ${this.srcUrl};
  
  e.waitUntil((async () => {
    const zineInstance = await zine.createStoryboardInstanceAsync({
      start_url: srcUrl,
      physics,
    });
    app.add(zineInstance);
    zineInstance.updateMatrixWorld();
    
    app.zineInstance = zineInstance;
    app.physicsIds = zineInstance?.physicsIds ?? [];

    await zineInstance.spawn();
  })());

  return app;
};
export const contentId = ${this.contentId};
export const name = ${this.name};
export const description = ${this.description};
export const type = 'zine';
export const components = ${this.components};