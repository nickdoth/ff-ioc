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

    for (const p in providerMap) {
        if (providerMap.hasOwnProperty(p)) {
            Object.defineProperty(container, p, {
                get: () => {
                    try {
                        if (!internalContainer[p]) {
                            internalContainer[p] = providerMap[p](container);
                        }
                        return internalContainer[p];
                    } catch (e) {
                        console.error(`Error while injecting ${p}:`);
                        throw e;
                    }
                },
            });
        }
    }

    return container;
}

export default createContainer;
