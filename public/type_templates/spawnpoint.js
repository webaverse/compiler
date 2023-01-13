import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useLocalPlayer, useSpawnManager, usePartyManager} = metaversefile;

const oneVector = new THREE.Vector3(1, 1, 1);

const localEuler = new THREE.Euler(0, 0, 0, 'YXZ');

export default e => {
  const spawnManager = useSpawnManager();
  const app = useApp();
  
  const srcUrl = ${this.srcUrl};
  const mode = app.getComponent('mode') ?? 'attached';
  if (mode === 'attached') {
    (async () => {
      const res = await fetch(srcUrl);
      const j = await res.json();
      if (j) {
        // const {camera} = useInternals();

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        if (j.position) {
          position.fromArray(j.position);
        }
        if (j.quaternion) {
          quaternion.fromArray(j.quaternion);
          localEuler.setFromQuaternion(quaternion, 'YXZ');
          localEuler.x = 0;
          localEuler.z = 0;
          quaternion.setFromEuler(localEuler);
        }

        const scale = new THREE.Vector3();
        new THREE.Matrix4()
          .compose(position, quaternion, oneVector)
          .premultiply(app.matrixWorld)
          .decompose(position, quaternion, scale);

        spawnManager.setSpawnPoint(position, quaternion);
      }
    })();
  }

  return app;
};
export const contentId = ${this.contentId};
export const name = ${this.name};
export const description = ${this.description};
export const type = 'spawnpoint';
export const components = ${this.components};