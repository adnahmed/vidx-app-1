import { TransitionObject } from 'gl-transition-utils/lib/transformSource';
import GLTransitions from 'gl-transitions';
import { supplyDefaultSampler2DToTransition } from './transform';

export const transitions: TransitionObject[] =
    (GLTransitions || [])
        .map(
            supplyDefaultSampler2DToTransition
        );

export const transitionsOrderByCreatedAt = [...transitions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

export const transitionsOrderByUpdatedAt = [...transitions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
);

export const transitionsOrderByRandom = [...transitions].sort(() => 0.5 - Math.random());

export const transitionsByName: Record<string, TransitionObject> = {};
for (const t of transitions) {
    transitionsByName[t.name] = t;
}
