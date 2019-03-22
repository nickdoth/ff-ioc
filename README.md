# ff-ioc

Fail-fast IoC container powered by typechecking from TypeScript

`ff-ioc` aims to introduce a simple yet enforced way to declare dependency graph: as long as using well type-defined providers, no dependency mistake can be escaped from the TypeScript complier.

## Get Started

Supposed there is a `UserService` and a `FriendService`, which can be defined as below:

```typescript
interface UserService {
    get(id: string): Promise<User | null>;
    add(user: User): Promise<User>;
    delete(id: string): Promise<void>;
    getByIdList(idList: string[]): Promise<User[]>;
}

interface FriendService {
    getFriendsOfUser(uid: string): Promise<User[]>;
}
```

`FriendService` depends on the `UserService` for retrieving user information. Based on the definition of this dependency, their _provider functions_ can be defined as below:

```typescript
type UserServiceProvider = (deps: {
    // No dependency
}) => UserService;

type FriendServiceProvider = (deps: {
    userService: UserService,
}) => FriendService;
```

We can now implement both service providers based on above type-defs:

```typescript
const provideUserService: UserServiceProvider = ({}) => {
    return {
        async get(id) { ... },
        async add(user) { ... },
        async delete(id) { ... },
        async getByIdList(idList) { ... },
    }
};

const provideFriendService: FriendServiceProvider = ({
    userService,
}) => {
    return {
        async getFriendsOfUser(uid) {
            return await userService.getByIdList(
                await _getFriendUidList(uid)
            );
        },
    };
}
```

Use `createContainer` to create an IoC container and bind all providers to it:

```typescript
import createContainer from 'ff-ioc';

const container = createContainer({
    friendService: provideFriendService,
    userService: provideUserService,
});

container.friendService.getFriendsOfUser('xxxxxxx').then((users) => ...);
```

## Concept of Fail-fast

<!-- This library (or say code snippet) is nothing magical. It is written with 40+ lines of code in a single file. It creates an plain object with lazy-evaluating getters, which invokes provider functions you bind to the container, and finally use the return value as the injected instance... You can take 2 mins to read the code of `createContainer` and know everything about it ;) -->

The ability of fail-fast comes from TypeScript by the following type definition:

```typescript
type ProviderMap<T extends {
    [k: string]: any;
}> = {
    [N in keyof T]: (deps: T) => T[N];
};
```

`T` is the generic type of container. It is inferred from `ProviderMap<T>` when calling `createContainer(providerMap)`:

```typescript
function createContainer<T>(providerMap: ProviderMap<T>): T;
```

This means when you have `ProviderMap<T>` as the following type:

```typescript
{
    greeting: (deps: { greeter: Greeter }) => Greeting,
    greeter: (deps: {}) => Greeter,
}
```

TypeScript will infer `T` as the following type:

```typescript
{
    greeting: Greeting,
    greeter: Greeter, 
}
```

It then uses `T` to declare the first parameter of associated provider functions, which builds up a junction between the container type and dependency type expected by each provider. If the container type is not a supertype of one of the provider dependency, there will be a compile error:

```typescript
type Greeter = (msg: string) => void;

const container = createContainer({
    // This is OK:
    // greeter: ({}) => console.log,

    // This is not correct
    greeter: ({}) => console,

    greeting: ({ greeter }: { greeter: Greeter }) => (name: string) => greeter(`Hello ${name}`),
});

// TypeScript Error: Type 'Console' provides no match for the signature '(msg: string): void'
```