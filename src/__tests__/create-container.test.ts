import createContainer from "..";

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