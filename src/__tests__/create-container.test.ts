import createContainer, { createSubScope } from "..";

test('createContainer', () => {
    type Greeter = (msg: string) => string;

    const provideGreeter = ({}) =>
        (msg: string) => `[greeter] ${msg}`;
    const provideGreeting = ({ greeter }: { greeter: Greeter }) =>
        (name: string) => greeter(`Hello ${name}!`);

    const container = createContainer({
        greeter: provideGreeter,
        greeting: provideGreeting,
    });

    expect(container.greeting('Jane Doe')).toEqual('[greeter] Hello Jane Doe!');
});

test('createContainer - Should reject recursive injections', () => {

    const provideA = ({ c }: { c: 'C' }) => 'A' as 'A';
    const provideB = ({ a }: { a: 'A' }) => 'B' as 'B';
    const provideC = ({ b }: { b: 'B' }) => 'C' as 'C';

    const container = createContainer({
        a: provideA,
        b: provideB,
        c: provideC,
    });

    expect(() => container.a).toThrow();
});

test('createSubScope', () => {
    type Greeter = (msg: string) => string;

    const provideGreeter = ({}) =>
        (msg: string) => `[greeter] ${msg}`;
    const provideGreeting = ({ greeter }: { greeter: Greeter }) =>
        (name: string) => greeter(`Hello ${name}!`);

    const container = createContainer({
        greeter: provideGreeter,
        greeting: provideGreeting,
    });

    expect(container.greeting('Jane Doe')).toEqual('[greeter] Hello Jane Doe!');
    
    const scope = createSubScope(container, {
        userBean: () => ({ name: 'John Doe', age: 20 }),
    });

    expect(scope.greeting('Jane Doe')).toEqual('[greeter] Hello Jane Doe!');
    expect(scope.userBean.name).toEqual('John Doe');
});
