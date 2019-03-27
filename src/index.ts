type ProviderMap<T extends { [k: string]: any }> = {
    [N in keyof T]: (deps: T) => T[N];
};

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

const PRIVATE_FIELD = '' + (+new Date);

/**
 * Create an container
 * @param providerMap Providers of component instance associated with their names.
 */
export function createContainer<T>(providerMap: ProviderMap<T>): T {
    const internalContainer: any = {};
    const container: T = {} as T;
    const injecting: { [p: string]: boolean } = {};

    Object.defineProperty(container, PRIVATE_FIELD, {
        value: { providerMap, injecting, internalContainer },
        enumerable: false,
        writable: false,
    });

    for (const p in providerMap) {
        if (providerMap.hasOwnProperty(p)) {
            Object.defineProperty(container, p, {
                get: () => {
                    if (injecting[p]) {
                        throw new Error(`Error while injecting ${p}: recursive reference detected`);
                    }

                    try {
                        if (!internalContainer[p]) {
                            injecting[p] = true;
                            internalContainer[p] = providerMap[p](container);
                            injecting[p] = false;
                        }
                        return internalContainer[p];
                    } catch (e) {
                        console.error(`Error while injecting ${p}:`);
                        injecting[p] = false;
                        throw e;
                    }
                },
            });
        }
    }

    return container;
}

function createParentScopeProviderMap<T>(container: T): ProviderMap<T> {
    const parentProviderMap: ProviderMap<T> = (container as any)[PRIVATE_FIELD].providerMap;

    const parentScopeProviderMap: ProviderMap<T> = {} as any;

    for (let p in parentProviderMap) {
        parentScopeProviderMap[p] = () => container[p];
    }

    return parentScopeProviderMap;
}

export function createSubScope<T, U>(container: T, providerMap: ProviderMap<U>) {
    const o = {
        ...providerMap,
        ...createParentScopeProviderMap(container),
    } as unknown as ProviderMap<T & Omit<U, keyof T>>;
    return createContainer(o);
}

export default createContainer;
