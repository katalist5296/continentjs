export class Token<T> {
    constructor(public name?: string) {}
}

export class InjectionToken<T> extends Token<T> {}
