type ProviderMap<T extends { [k: string]: any }> = {
    [N in keyof T]: (deps: T) => T[N];
};

/**
 * Create an container
 * @param providerMap Providers of component instance associated with their names.
 */
export function createContainer<T>(providerMap: ProviderMap<T>): T {
    const internalContainer: any = {};
    const container: T = {} as T;
    const injecting: { [p: string]: boolean } = {};

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

export default createContainer;
