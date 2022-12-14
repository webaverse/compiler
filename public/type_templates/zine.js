// import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, usePhysics, useCameraManager, useZine} = metaversefile;

export default e => {
  const app = useApp();
  const physics = usePhysics();
  const cameraManager = useCameraManager();
  const zine = useZine();

  const srcUrl = ${this.srcUrl};
  
  // globalThis.zine = zine;
  console.log('zine app init', {srcUrl});

  e.waitUntil((async () => {
    console.log('zine app inside waitUntil', {app, physics});

    const zineInstance = await zine.createInstanceAsync({
      start_url: srcUrl,
      physics,
    });
    app.add(zineInstance);
    zineInstance.updateMatrixWorld();
    
    app.zineInstance = zineInstance;
    app.physicsIds = zineInstance?.physicsIds ?? [];

    // console.log('zine app create wait done', {
    //   app,
    //   zineInstance,
    //   physicsIds: app?.physicsIds?.slice(),
    //   camera: zineInstance.camera,
    //   cameraClone: zineInstance.camera.clone(),
    // });

    cameraManager.setLockCamera(zineInstance.camera);
  })());

  return app;
};
export const contentId = ${this.contentId};
export const name = ${this.name};
export const description = ${this.description};
export const type = 'glbb';
export const components = ${this.components};